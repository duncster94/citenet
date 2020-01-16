/*
TODO: documentation.
*/

// Connect to Elasticsearch client.
const elasticsearch = require('elasticsearch')
const CONSTANTS = require('./constants')

const es = new elasticsearch.Client({
  host: CONSTANTS.DATABASE_IP,
  log: 'error'
});

class ExtractSubnetwork {

  constructor(source_nodes, n_walks, restart_prob, n_top, es_client, es_index) {
    this.source_nodes = source_nodes;
    this.n_walks = n_walks;
    this.restart_prob = restart_prob;
    this.n_top = n_top;
    this.es_client = es_client;
    this.es_index = es_index;

    this.citation_edge_frequencies = {}
    this.semantic_edge_frequencies = {}

    this.stored_cites = {};
    this.stored_cited_by = {};
    this.stored_citation_neighbours = {};
    this.stored_semantic_neighbours = {};

    this.hasCitationEdges = {}
    this.hasSemanticEdges = {}
  }

  async get_subgraph() {
    /*
    Wrapper function that calls functions to extract a
    subnetwork relevant to the user's query.
        1. First walks are split evenly across source nodes.
        2. The random walk with restart is executed.
        3. The top n resulting nodes are then extracted.
        4. Edge relationships between these nodes are extracted.
        5. Finally, subgraph results are formatted appropriately
           and returned to the master process.
    params:
        None
    returns:
        null
    */

    console.log('Querying source nodes:', this.source_nodes);

    // Split 'n_walks' evenly by the number of source nodes.
    let walks_per_node = this.computeWalkNumber();

    // Perform random walk with restart. Wrapping with `Promise.all`
    // allows both walks to be performed concurrently since the first
    // `randomWalk` call will not block.
    await Promise.all([
      this.randomWalk(walks_per_node, 'citation'),
      this.randomWalk(walks_per_node, 'semantic')
    ])

    // Get top results object.
    let topCitationObj = this.getTop('citation')
    let topSemanticObj = this.getTop('semantic')
    let topObj = await this.combineTop(
      [topCitationObj, topSemanticObj]
    )
    // let topObj = this.getTop('citation')
    // let topObj = this.getTop('semantic')

    // console.log('top results', top_results); // Uncomment to see results

    let subgraph = await this.formatResponse(topObj);

    return subgraph;
  }

  async randomWalk(walks_per_node, type) {
    /*
    The core of the search algorithm. Performs random walk with
    restart over the network.
        1. Iterate over each source node, allocating 'walks_per_node'
           to be executed.
        2. Iterate through 'walks_per_node'.
        3. Step randomly through node neighbours. Each walk ends
           with probability 'restart_prob'.
        4. When a walk ends, increment the termination node in
           'frequencies'.
    params:
        walks_per_node: Integer. Determines how many walks each
            source node gets.
    returns:
        null
    */

    // Iterate over source nodes and perform walks, tracking walk
    // terminations in 'frequencies'.
    let promises = []
    for (let node of this.source_nodes) {
      promises.push(this.walk(node, walks_per_node, type))
    }
    await Promise.all(promises)
  }

  computeWalkNumber() {
    /*
    Computes the number of walks each source node gets by dividing
    'n_walks' by the number of source nodes and taking the floor
    of the results. 'n_walks' is then updated to reflect the flooring
    operation.
    */

    let source_nodes_length = this.source_nodes.length;

    let walks_per_node = Math.floor(
      this.n_walks / source_nodes_length
    );

    this.n_walks = walks_per_node * source_nodes_length

    return walks_per_node;
  }

  async walk(node, walks_per_node, type) {
    /*
    TODO: documentation.
    */

    for (let iii = 0; iii < walks_per_node; iii++) {

      // Node that is currently being walked from.
      let current_node = node;

      // Perform steps.
      current_node = await this.step(current_node, type);

      // On walk end, update 'frequencies' to track the node
      // the walk terminated on. Add the node to 'frequencies'
      // if it is not in 'frequencies'. The frequency is
      // normalized by the total number of walks and multiplied
      // by 100 to give a percentage (readability purposes).
      if (type === 'citation') {
        if (!this.citation_edge_frequencies[current_node]) {
          this.citation_edge_frequencies[current_node] = 1 / this.n_walks;
        } else {
          this.citation_edge_frequencies[current_node] += 1 / this.n_walks;
        }
      } else {
        if (!this.semantic_edge_frequencies[current_node]) {
          this.semantic_edge_frequencies[current_node] = 1 / this.n_walks;
        } else {
          this.semantic_edge_frequencies[current_node] += 1 / this.n_walks;
        }
      }
    }

  }

  async step(passed_node, type) {
    /*
    TODO: documentation
    */

    let end_walk = false;
    let current_node = passed_node;

    // Step until walk randomly ends.
    while (!end_walk) {

      // Get neighbours of 'current_node'.
      let node_neighbours = await this.findNeighbours(current_node, type)
      if (node_neighbours.length === 0) break

      // Randomly select neighbour to jump to.
      let rand_index = Math.floor(Math.random() * node_neighbours.length);
      let sampled_node = node_neighbours[rand_index];

      // Check that `sampled_node` exists in ES.
      let exists = await this.es_client.exists({
        id: sampled_node,
        index: this.es_index
      })
      if (exists) {
        // Update `current_node` if it exists in ES.
        current_node = sampled_node
      } else {
        continue
      }

      // Determine if walk ends.
      end_walk = Math.random() <= this.restart_prob;
    }

    // Return the node that the walk ended on.
    return current_node;
  }

  async findNeighbours(node, type) {
    /*
    Queries Elasticsearch and returns the neighbours of the given
    node. (If necessary, this code can be modified to ensure a
    neighbour dictionary is maintained to prevent duplicate ES
    queries)
    */

    // First check if 'node' neighbours have been added to
    // 'stored_neighbours'. If so, simply use these neighbours
    // instead of querying Elasticsearch and incurring latency.
    if (type === 'citation') {
      if (this.stored_citation_neighbours[node]) {
        return this.stored_citation_neighbours[node];
      }
    } else {
      if (this.stored_semantic_neighbours[node]) {
        return this.stored_semantic_neighbours[node];
      }
    }
    

    // Query Elasticsearch for the neighbour
    // relationships of 'node'.
    let _source
    type === 'citation' ?
      _source = ['cites', 'cited_by'] :
      _source = ['semantic_sim']

    let es_query = await this.es_client.search({
      _source: _source,
      index: this.es_index,
      body: {
        query: {
          ids: {
            type: 'paper',
            values: [node]
          }
        }
      }
    });

    // Extract 'cites' and 'cited_by' relationships or
    // 'semantic_sim' relationships.
    let source
    if (es_query.hits.hits.length === 0) {
      type === 'citation' ?
      source = {
        'cites': [],
        'cited_by': []
      } :
      source = {
        'semantic_sim': []
      }
    } else {
      source = es_query.hits.hits[0]._source;
    }

    let neighbours
    if (type === 'citation') {
      let cites = source.cites;
      if (!cites) {
        cites = []
      }
      let cited_by = source.cited_by;
      if (!cited_by) {
        cited_by = []
      }
      neighbours = cites.concat(cited_by);
      
      // Store node in 'stored_neighbours' object to avoid
      // duplicate Elasticsearch queries in following walks.
      this.stored_citation_neighbours[node] = neighbours;

      // Store 'cites' and 'cited_by' relationships so directionality
      // is preserved when extracting the subnetwork.
      this.stored_cites[node] = cites;
      this.stored_cited_by[node] = cited_by;

    } else {

      neighbours = []
      let semantic_sim = source.semantic_sim
      if (semantic_sim) {
        neighbours = semantic_sim
      }

      this.stored_semantic_neighbours[node] = neighbours
    }

    // Return an array of all relationships.
    return neighbours;
  }

  getTop(type) {
    /*
    Returns the top 'n_top' scoring nodes in the random walk.
    */

    // Map 'frequencies' object to an array of key, value pairs.
    let frequencies_arr
    if (type === 'citation') {
      frequencies_arr = Object.keys(this.citation_edge_frequencies)
        .map(function (key) {
          return { key: key, value: this[key] };
        }, this.citation_edge_frequencies);
    } else {
      frequencies_arr = Object.keys(this.semantic_edge_frequencies)
        .map(function (key) {
          return { key: key, value: this[key] };
        }, this.semantic_edge_frequencies);
    }
    return this.getTopCore(frequencies_arr)
  }

  getTopCore(frequencies_arr) {

    // Sort the resulting array in descending order.
    frequencies_arr.sort(function (kv1, kv2) {
      return kv2.value - kv1.value
    });

    // Create ID to rank number object.
    let rank = this.source_nodes.length;
    let IDtoRank = {};
    frequencies_arr.slice(0, this.n_top).forEach(function (obj) {
      IDtoRank[obj.key] = rank;
      rank++;
    });

    // Retain the top 'n_top' results and map back to object.
    let maxVal = 0
    let self = this
    let top_n_results = frequencies_arr.slice(0, this.n_top + this.source_nodes.length)
      .reduce(function (obj, prop) {
        obj[prop.key] = prop.value;
        
        // `maxVal` is only relevant to non-seed nodes
        if (prop.value > maxVal && !(self.source_nodes.includes(prop.key))) {
          maxVal = prop.value
        }
        return obj;
      }, {});

    // Add source nodes to result.
    this.source_nodes.forEach((node, idx) => {
      top_n_results[node] = maxVal
      IDtoRank[node] = idx
    })

    return { 'topN': top_n_results, 'IDtoRank': IDtoRank };
  }

  async combineTop(topObjs) {
    /* Given the top scoring nodes in the citation and semantic networks,
    takes the average of node scores and reranks to obtain the final top
    `this.n_top` nodes. In instances where a node has no edges in a network,
    only the score from the network where it has edges is counted.
    */

    let topFinal = {}
    for (let topObj of topObjs) {
      let { topN } = topObj
      for (let key in topN) {
        if (!(key in topFinal)) {
          topFinal[key] = topN[key]
        }
        else {
          // topFinal[key] += topN[key]
          if (topN[key] > topFinal[key]) {
            topFinal[key] = topN[key]
          }

        }
      }
    }

    // TODO: determine which IDs in the keys of `topFinal` have edges in
    // each network type given by `objTypes` and compute average (maybe try max too)
    // score depending on whether the node has edges or not

    // let denominators = {}  // Determines which each score should be divided by
    // let es_query = await this.es_client.search({
    //   index: this.es_index,
    //   body: {
    //     size: Object.keys(topFinal).length,
    //     _source: ['_id', 'cites', 'cited_by', 'semantic_sim'],
    //     query: {
    //       ids: {
    //         type: 'paper',
    //         values: Object.keys(topFinal)
    //       }
    //     }
    //   }
    // })

    // for (let article of es_query.hits.hits) {
    //   if (!(article._id in denominators)) {
    //     denominators[article._id] = 0
    //   }
    //   if (('cites' in article._source) || ('cited_by' in article._source)) {
    //     denominators[article._id] += 1
    //   }
    //   if ('semantic_sim' in article._source && article._source['semantic_sim'].length > 0) {
    //     denominators[article._id] += 1
    //   }
    // }

    // for (let key in topFinal) {
    //   topFinal[key] /= denominators[key]
    // }

    let frequenciesArr = Object.keys(topFinal)
    .map(function (key) {
      return { key: key, value: this[key] };
    }, topFinal)

    return this.getTopCore(frequenciesArr)
  }

  async formatResponse(topResultsObj) {
    /*
    Given a set of top scoring nodes, extract all relevant information
    and format the response.
    */

    let topResults = topResultsObj.topN
    let IDtoRank = topResultsObj.IDtoRank

    // Get an edge-list object containing all edges between nodes in
    // 'top_nodes'.
    let edgeArr = this.extractEdges(topResults);

    // Get all metadata for the top nodes.
    let nodeDataArr = await this.getMetadata(topResults, IDtoRank);

    // Get an id to title mapping object.
    let IDtoTitle = this.getIDtoTitle(nodeDataArr);

    // Construct subgraph.
    let subgraph = {
      nodes: nodeDataArr, links: edgeArr,
      mapping: IDtoTitle
    };

    return subgraph;

  }

  extractEdges(top_results) {
    /*
    Given the top results, extract all edge relationships between
    these nodes.
    */

    // Array to store edges.
    let edge_arr = [];

    
    for (let node of Object.keys(top_results)) {
      this.hasCitationEdges[node] = false
      this.hasSemanticEdges[node] = false
    }
    
    // 'stored_neighbours' already contains the edge information, so
    // this object can be parsed to extract edges.
    // for (let type of ['citation', 'semantic']) {
    for (let type of ['citation']) {
      for (let node of Object.keys(top_results)) {
  
        // Get node edges.
        let node_neighbours
        if (type === 'citation') {
          node_neighbours = this.stored_citation_neighbours[node];
        } else {
          node_neighbours = this.stored_semantic_neighbours[node];
        }

        // Ensure 'node_neighbours' exists.
        if (node_neighbours) {
  
          // Iterate over node neighbours and add any edge
          // relationships with nodes that are in 'top_results'.
          for (let neighbour of node_neighbours) {
            if (top_results[neighbour]) {
              if (type === 'citation') {
                this.hasCitationEdges[parseInt(node)] = true
                this.hasCitationEdges[neighbour] = true
              } else {
                this.hasSemanticEdges[parseInt(node)] = true
                this.hasSemanticEdges[neighbour] = true
              }
              edge_arr.push({ source: parseInt(node), target: neighbour, type });
            }
          }
        }
      }
    }

    return edge_arr;
  }

  async getMetadata(top_results, IDtoRank) {
    /*
    Extract the metadata for all nodes.
    */

    // Query Elasticsearch for the metadata of all nodes in
    // 'top_results'.
    let es_query = await this.es_client.search({
      index: this.es_index,
      body: {
        size: this.n_top + this.source_nodes.length,
        query: {
          ids: {
            type: 'paper',
            values: Object.keys(top_results)
          }
        }
      }
    });

    // Array containing parsed metadata.
    let metadata = []

    // Parse 'es_query' results.
    for (let node_data of es_query.hits.hits) {
      let id = node_data._id;
      let source = node_data._source;
      let Title = source.Title;
      let PubDate = source.PubDate;
      let Journal = source.Journal;
      let Authors = source.Authors;
      let Abstract = source.Abstract;
      let score = top_results[id];
      let hasCitationEdges = this.hasCitationEdges[id]
      let hasSemanticEdges = this.hasSemanticEdges[id]

      // Add node metadata to 'metadata' object.
      metadata.push({
        id,
        Title,
        PubDate,
        Journal,
        Authors,
        Abstract,
        score,
        hasCitationEdges,
        hasSemanticEdges,
        rank: IDtoRank[id]
      })
    }

    return metadata;
  }

  getIDtoTitle(nodeDataArr) {
    /*
    */

    // Object to store id to title mapping.
    let idToTitle = {};

    // Iterate over 'nodeDataArr' and add mappings to 'idToTitle'.
    for (let metadata of nodeDataArr) {
      let id = metadata.id;
      let title = metadata.title;

      idToTitle[id] = title;
    }

    return idToTitle;
  }

  getIDtoRank(nodeDataArr) {
    /*
    */

    // Object to store id to rank mapping.
    let idToRank = {};

    // Get
  }
}

process.on('message', function (message) {
  // console.log('parent', message);

  let seeds = message.seeds;
  let index_name = message.index_name;

  // Create new 'ExtractSubnetwork' object.
  extSub = new ExtractSubnetwork(
    seeds, 5000, 0.6, 30, es, index_name
  );

  // Pass 'extSub' to function to await subgraph computation and send
  // extracted subgraph.
  send_subgraph(extSub);
})

async function send_subgraph(extSub) {
  /*
  Awaits subgraph computation and sends the results to parent process.
  TODO: Log seeds and computation time.
  */

  // Run random walk and extract subgraph.
  let subgraph = await extSub.get_subgraph();

  // Send subgraph back to parent process.
  process.send({ subgraph: subgraph })
}