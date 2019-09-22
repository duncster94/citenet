const express = require("express");
const { fork } = require("child_process");
const path = require("path");
const bodyParser = require("body-parser");
const elasticsearch = require("elasticsearch");
const query_es = require("./query-es.js");

const app = express();
const es = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

const port = 3001;

// Elasticsearch index.
const index_name = "gisample";

// Boilerplate
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Called on page load.
// app.get("/", (request, response) => {
//   response.render("index");
// });

app.post("/test", (request, response) => {
  // response.json({res: `POST request proxied to localhost:${port}`})
  console.log(request.body)
  response.json({res: request.body})
})

// Called on user selectize query.
app.post("/homepage_search_query", (request, response) => {

  // Get Elasticsearch query Promise and package response on Promise
  // resolution.
  query_es.query_es(request.body.value, index_name, es)
    .then(function(es_response) {
      response.send(es_response.hits.hits)
    });
});

// Called when user submits papers.
app.post("/submit_paper", (request, response) => {

  // Set response type to JSON.
  response.contentType("json");

  // Get seeds from request body.
  let seeds = request.body;

  // Create message to send to child process.
  let child_message = {seeds: seeds, index_name: index_name};

  // Fork a child process.
  const fork_randomwalk = fork("extract-subnetwork.js");

  // Send 'message' to child process to run random walk and extract
  // the relevant subnetwork.
  fork_randomwalk.send(child_message);

  // Once the child process has extracted the subnetwork, send to
  // client.
  fork_randomwalk.on("message", function(message) {

    // Get minimum and maximum publication years from "graph".
    let dates = []
    message.subgraph.nodes.forEach(function (node) {

      let pub_year = node.pub_date.Year

      // Make sure publication year is defined.
      if (pub_year) {
        dates.push(pub_year);
      }
    })
    let min_date = Math.min(...dates)
    let max_date = Math.max(...dates)

    function score_to_radius(node) {
      /*
      Given a node, take its score and map it to a radius.
      */
  
      let radius = 75 * Math.pow(node.score, 1 / 3)
  
      return radius
    }

    function date_to_colour(node, D_min, D_max, seeds) {
      /*
      Given a node, map the appropriate colour.
      */

      // If the node is a seed node, colour it differently.
      if (seeds.includes(node.id.toString())) {
        return "#f00"
      }

      // Get publication year.
      let year = node.pub_date.Year

      // If publication year is not available, set node colour to
      // grey.
      if (!year) {
        return "#ccc"
      }

      // Define minimum and maximum lightness.
      L_min = 50
      L_max = 100

      // Get lightness of node colour based on date.
      let m = (L_max - L_min) / (D_min - D_max)
      let b = L_max - m * D_min

      let lightness = m * year + b

      let colour = `hsla(41,100%, ${lightness.toString()}%,1)`

      return colour
    }

    let radii = message.subgraph.nodes.map(node => {
      return score_to_radius(node)
    })

    let colours = message.subgraph.nodes.map(node => {
      return date_to_colour(node, min_date, max_date, seeds)
    })

    response.send({
      subgraph: message.subgraph, 
      seeds: seeds, 
      metadata: {radii, colours}
    })
  });
});

app.listen(port, () => {
  console.log("Server listening on Port " + port);
});