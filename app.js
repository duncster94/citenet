var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var Sifter = require('sifter');
var elasticsearch = require('elasticsearch');
var neo4j = require('neo4j-driver').v1;
var fs = require('fs');


var sifter = new Sifter([]);
var app = express();
var es = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});
var indexName = 'workingpapers';

var neoDriver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'citenet'));
var neoSession = neoDriver.session();

var port = 8000;

// var layout_view = fs.readFileSync(__dirname + '/views/layout.ejs').toString();
// console.log(layout_view);

// Boilerplate
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.render('index');
});

// When paper is submitted, send pageRank request to Neo.
app.post('/submit_paper', (req, res) => {
  res.contentType('json')

  console.log(req.body);

  var paper_ids_seed = req.body.seeds;
  console.log(paper_ids_seed);

  // var n_results = Number(req.body.n_results);

  var resultPromise = neoSession.run(
    'MATCH (p) WHERE p.paper_id IN $paper_ids \
     CALL algo.pageRank.stream(null, null, {direction: "BOTH", sourceNodes: [p], iterations:20, dampingFactor:0.85}) \
     YIELD nodeId, score \
     WITH p, nodeId, score ORDER BY score DESC \
     LIMIT 100\
     \
     MATCH (n) WHERE id(n) = nodeId \
     WITH collect(nodeId) as ids, collect(n {.*, score}) as nodes \
     CALL apoc.algo.cover(ids) YIELD rel\
     RETURN ids, nodes, collect(rel) as rels',
    {
      paper_ids: paper_ids_seed
      // n_results: n_results
    }
  );

  resultPromise.then(result => {
    neoSession.close();

    // Process nodes.
    var formatted_nodes = {};
    var uuids = result.records[0].get(0);
    var papers = result.records[0].get(1);
    var relationships = result.records[0].get(2);

    // JSON containing paper_id to uuid mapping.
    var uuid_to_paperId = {}

    // Iterate over each 'uuid' and 'paper' and format.
    for (var i = 0; i < uuids.length; i++) {
      formatted_nodes[uuids[i]] = papers[i];
      uuid_to_paperId[papers[i]['paper_id']] = String(uuids[i].low);
    }

    // Get maximum and minimum pageRank scores excluding seed nodes.
    var maxScore = -1;
    var minScore = 99999999;
    for (formatted_node in formatted_nodes) {

      var curr_paper_id = formatted_nodes[formatted_node].paper_id;

      if (curr_paper_id in paper_ids_seed) {
        continue;
      }

      var curr_score = formatted_nodes[formatted_node].score;

      if (curr_score > maxScore) {
        maxScore = curr_score;
      }

      if (curr_score < minScore) {
        minScore = curr_score
      }
    }

    // Normalize pageRank scores.
    // for (formatted_node in formatted_nodes) {
    //   formatted_nodes[formatted_node].score = (formatted_nodes[formatted_node].score - minScore) / (maxScore - minScore);
    // }


    function get_info(formatted_node) {

      // Query 'paper_id' in elasticsearch.
      var curr_paper_info = es.search({
        index: 'workingpapers',
        body: {
          query: {
            ids: {
              type: 'paper',
              values: [formatted_nodes[formatted_node].paper_id]
            }
          }
        }
      });

      return curr_paper_info;
    }

    // Array of promises.
    var es_promises = [];

    // Query title, author, journal, date and abstract from elasticsearch and add to formatted_nodes.
    for (formatted_node in formatted_nodes) {
      es_promises.push(get_info(formatted_node));
    }

    Promise.all(es_promises).then((result) => {

      for (curr_result of result) {
        var res_body = curr_result.hits.hits[0]._source;
        var curr_paper_id = parseInt(curr_result.hits.hits[0]._id);

        // Get corresponding uuid.
        var curr_node_id = uuid_to_paperId[curr_paper_id];

        formatted_nodes[curr_node_id].title = res_body.title;

        var date_string = '';
        date_string += res_body.pub_date.Year;
        if (res_body.pub_date.Month) {
          date_string += ', ' + res_body.pub_date.Month;
        }
        formatted_nodes[curr_node_id].pub_date = date_string;
        formatted_nodes[curr_node_id].pub_year = res_body.pub_date.Year;
        formatted_nodes[curr_node_id].journal = res_body.journal;

        var author_string = '';
        for (author_dict of res_body.authors) {
          author_string += author_dict['LastName'] + ' ' + author_dict['Initials'] + ',   ';
        }
        author_string = author_string.slice(0, -4);
        formatted_nodes[curr_node_id].authors = author_string;

        formatted_nodes[curr_node_id].abstract = res_body.abstract;
      }

      var formatted_relationships = [];

      for (relationship of relationships) {
        var start = relationship.start.low;
        var end = relationship.end.low;

        formatted_relationships.push([start, end]);
      }

      // Map seeds to their corresponding uid.
      var seed_uid = [];
      for (seed of paper_ids_seed) {
        for (uid_key in formatted_nodes) {
          if (formatted_nodes[uid_key].paper_id == seed) {
              seed_uid.push(parseInt(uid_key));
          }
        }
      }

      res.send({
        nodes: formatted_nodes,
        relationships: formatted_relationships,
        seeds: seed_uid
      });
      res.end();

    })

  })
});


app.post('/character_input', (req, res) => {
  getSuggestions(req.body.value).then(function (result) {res.json(result)});
});


app.listen(port, () => {
  console.log('Server listening on Port ' + port);
});


function getSuggestions(input) {
  var es_search = es.search({
    index: indexName,
    type: 'paper',
    size: 10,
    body: {
      query: {
        multi_match: {
          query: input,
          fields: ["title", "authors.LastName", "authors.Initials", "_id"]
        }
      }
    }
  });
  // console.log(es_search);
  return es_search
}
