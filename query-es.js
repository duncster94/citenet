function query_es(query, index_name, es) {
    /*
    Given a query and the Elasticsearch object, query Elasticsearch
    and return a Promise.
    */

    // Fields to query.
    let fields = ["Title", "Authors.ForeName", "Authors.LastName^3", "_id"]

    // Query Elasticsearch.
    let es_query = es.search({
        index: index_name,
        type: "paper",
        size: 10,
        body: {
            query: {
                bool: {
                    must: {
                        multi_match: {
                            query: query,
                            fields: fields,
                        }
                    },
                    filter: {
                        term: {
                            has_edges: true
                        }
                    }
                }
            }
        }
    })

    return es_query
}

module.exports.query_es = query_es