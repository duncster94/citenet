/*
TODO: documentation.
*/

// Connect to Elasticsearch client.
const elasticsearch = require("elasticsearch");
const es = new elasticsearch.Client({
  host: "localhost:9200",
  log: "error"
});

class ExtractSubnetwork {
    
    constructor(source_nodes, n_walks, restart_prob, n_top, es_client, es_index) {
        this.source_nodes = source_nodes;
        this.n_walks = n_walks;
        this.restart_prob = restart_prob;
        this.n_top = n_top;
        this.es_client = es_client;
        this.es_index = es_index;
        this.frequencies = {};

        this.stored_cites = {};
        this.stored_cited_by = {};
        this.stored_neighbours = {};
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
        let walks_per_node = this.compute_walk_number();

        // Perform random walk with restart.
        await this.random_walk(walks_per_node);

        // Gets the 'n_top' number of results.
        let top_results = this.get_top();
        // console.log('top results', top_results); // Uncomment to see results

        let subgraph = await this.format_response(top_results);

        return subgraph;
    }

    async random_walk(walks_per_node) {
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
        for (let node of this.source_nodes) {
            await this.walk(node, walks_per_node)
        }
    }

    compute_walk_number() {
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

        return walks_per_node
    }

    async walk(node, walks_per_node) {
        /*
        TODO: documentation.
        */

        for (let iii=0; iii < walks_per_node; iii++) {

            // Node that is currently being walked from.
            let current_node = node;

            // Perform steps.
            current_node = await this.step(current_node);

            // On walk end, update 'frequencies' to track the node
            // the walk terminated on. Add the node to 'frequencies'
            // if it is not in 'frequencies'. The frequency is
            // normalized by the total number of walks and multiplied
            // by 100 to give a percentage (readability purposes).
            if (!this.frequencies[current_node]) {
                this.frequencies[current_node] = 1 / this.n_walks;
            } else {
                this.frequencies[current_node] += 1 / this.n_walks;
            }
        }

    }

    async step(passed_node) {
        /*
        TODO: documentation
        */

        let end_walk = false;
        let current_node = passed_node;

        // Step until walk randomly ends.
        while (!end_walk) {

            // Get neighbours of 'current_node'. 
            let node_neighbours = await this.find_neighbours(current_node)

            // Randomly select neighbour to jump to.
            let rand_index = Math.floor(Math.random() * node_neighbours.length);

            // Update current node.
            current_node = node_neighbours[rand_index];

            // Determine if walk ends.
            end_walk = Math.random() <= this.restart_prob;
        }

        // Return the node that the walk ended on.
        return current_node;
    }

    async find_neighbours(node) {
        /*
        Queries Elasticsearch and returns the neighbours of the given
        node. (If necessary, this code can be modified to ensure a
        neighbour dictionary is maintained to prevent duplicate ES 
        queries)
        */

        // First check if 'node' neighbours have been added to 
        // 'stored_neighbours'. If so, simply use these neighbours
        // instead of querying Elasticsearch and incurring latency.
        if (this.stored_neighbours[node]) {
            return this.stored_neighbours[node];
        }

        // Query Elasticsearch for the 'cited' and 'cited_by'
        // relationships of 'node'.
        let es_query = await this.es_client.search({
            _source: ['cites', 'cited_by'],
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

        // Extract 'cites' and 'cited_by' relationships.
        let source = es_query.hits.hits[0]._source;
        let cites = source.cites;
        let cited_by = source.cited_by;
        let neighbours = cites.concat(cited_by);

        // Store node in 'stored_neighbours' object to avoid
        // duplicate Elasticsearch queries in following walks.
        this.stored_neighbours[node] = neighbours;

        // Store 'cites' and 'cited_by' relationships so directionality
        // is preserved when extracting the subnetwork.
        this.stored_cites[node] = cites;
        this.stored_cited_by[node] = cited_by;

        // Return an array of all relationships.
        return neighbours;
    }

    get_top() {
        /*
        Returns the top 'n_top' scoring nodes in the random walk.
        */

        // Map 'frequencies' object to an array of key, value pairs.
        let frequencies_arr = Object.keys(this.frequencies)
            .map(function (key) {
                return {key: key, value: this[key]};
            }, this.frequencies);

        // Sort the resulting array in descending order.
        frequencies_arr.sort(function(kv1, kv2) {
            return kv2.value - kv1.value
        });

        // Retain the top 'n_top' results and map back to object.
        let top_n_results = frequencies_arr.slice(0, this.n_top)
            .reduce(function(obj, prop) {
                obj[prop.key] = prop.value;
                return obj;
            }, {});

        return top_n_results;
    }

    async format_response(top_results) {
        /*
        Given a set of top scoring nodes, extract all relevant information
        and format the response.
        */

        // Get an edge-list object containing all edges between nodes in
        // 'top_nodes'.
        let edge_arr = this.extract_edges(top_results);

        // Get all metadata for the top nodes.
        let node_data_arr = await this.get_metadata(top_results);

        // Get an id to title mapping object.
        let id_to_title = this.get_id_to_title(node_data_arr);

        // Construct subgraph.
        let subgraph = {nodes: node_data_arr, links: edge_arr, 
            mapping: id_to_title};

        return subgraph;

    }

    extract_edges(top_results) {
        /*
        Given the top results, extract all edge relationships between
        these nodes.
        */

        // Array to store edges.
        let edge_arr = [];

        // 'stored_neighbours' already contains the edge information, so
        // this object can be parsed to extract edges.
        for (let node of Object.keys(top_results)) {

            // Get node 'cites' edges.
            let node_neighbours = this.stored_cites[node];

            // Ensure 'node_neighbours' exists.
            if (node_neighbours) {

                // Iterate over node neighbours and add any edge 
                // relationships with nodes that are in 'top_results'.
                for (let neighbour of node_neighbours) {
                    if (top_results[neighbour]) {
                        edge_arr.push({source: node, target: neighbour});
                    }
                }
            }
        }
        return edge_arr;
    }

    async get_metadata(top_results) {
        /*
        Extract the metadata for all nodes.
        */

        // Query Elasticsearch for the metadata of all nodes in
        // 'top_results'.
        let es_query = await this.es_client.search({
            index: this.es_index,
            body: {
                size: this.n_top,
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
            let title = source.title;
            let pub_date = source.pub_date;
            let journal = source.journal;
            let authors = source.authors;
            let abstract = source.abstract;
            let score = top_results[id];

            // Add node metadata to 'metadata' object.
            metadata.push({id: id, title: title, pub_date: pub_date, 
                journal: journal, authors: authors, abstract: abstract, 
                score: score})
        }

        return metadata;
    }

    get_id_to_title(node_data_arr) {
        /*
        */

        // Object to store id to title mapping.
        let id_to_title = {};

        // Iterate over 'node_data_obj' and add mappings to 'id_to_title'.
        for (let metadata of node_data_arr) {
            let id = metadata.id;
            let title = metadata.title;

            id_to_title[id] = title;
        }

        return id_to_title;
    }
}

process.on("message", function(message) {
    console.log('parent', message);

    let seeds = message.seeds;
    let index_name = message.index_name;

    // Create new 'ExtractSubnetwork' object.
    extSub = new ExtractSubnetwork(seeds, 10000, 
        0.25, 100, es, index_name);

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
    process.send({subgraph: subgraph})
}