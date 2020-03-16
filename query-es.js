function query_es(query, index_name, es) {
  /*
  Given a query and the Elasticsearch object, query Elasticsearch
  and return a Promise.
  */

  // Fields to query.
  let fields = ['Title', 'Authors.ForeName', 'Authors.LastName', '_id', 'PubDate.Year', 'Journal.Title', 'Journal.ISO']

  // Query Elasticsearch.
  // let queryRes = es.search({
  //   index: index_name,
  //   type: '_doc',
  //   size: 10,
  //   body: {
  //     query: {
  //       bool: {
  //         must: {
  //           multi_match: {
  //             query: query,
  //             fields: fields,
  //             type: 'cross_fields'
  //           }
  //         },
  //         filter: {
  //           term: {
  //             has_edges: true
  //           }
  //         }
  //       }
  //     }
  //   }
  // })

  let queryRes = es.search({
    // index: index_name,
    index: index_name,
    type: '_doc',
    size: 20,
    body: {
      query: {
        bool: {
          must: {
            match: {
              query_field: {
                query: query,
                fuzziness: 'AUTO',
                lenient: true
              }
            },
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

  return queryRes
}

function query_exact(ids, index_name, es) {
  let queryRes = es.search({
    index: index_name,
    type: '_doc',
    body: {
      query: {
        terms: {
          _id: ids
        }
      }
    }
  })

  return queryRes
}

module.exports.query_es = query_es
module.exports.query_exact = query_exact