const express = require('express');
const { fork } = require('child_process');
const path = require('path');
const bodyParser = require('body-parser');
const elasticsearch = require('elasticsearch');
const { query_es } = require('./query-es');
const { processSubnetwork } = require('./process-subnetwork')
const CONSTANTS = require('./constants')

const app = express();
const es = new elasticsearch.Client({
  host: CONSTANTS.DATABASE_IP,
  log: 'error'
});

// Elasticsearch index.
const index_name = 'papers'

// Boilerplate
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Called on page load.
// app.get('/', (request, response) => {
//   response.status(200).send({ message: `Server running on port ${port}` })
// });

app.post('/ping', (request, response, next) => {
  response.json({res: request.body})
  next(err)
})

// Called on user selectize query.
app.post('/homepage_search_query', (request, response) => {

  // console.log(request)

  // Get Elasticsearch query Promise and package response on Promise
  // resolution.
  query_es(request.body.value, index_name, es)
    .then(function(es_response) {
      response.send(es_response.hits.hits)
    });
});

// Called when user submits papers.
app.post('/submit_paper', wrapAsync(async (req, res) => {

  // Get seeds from req body.
  let seeds = req.body;

  // Create message to send to child process.
  let child_message = {seeds: seeds, index_name: index_name};

  // Fork a child process.
  const fork_randomwalk = fork('extract-subnetwork.js');

  // Send 'message' to child process to run random walk and extract
  // the relevant subnetwork.
  fork_randomwalk.send(child_message)

  // Once the child process has extracted the subnetwork, send to
  // client.
  fork_randomwalk.on('message', function(message) {
    // get metadata from network

    try {
      const data = processSubnetwork(message, seeds)
      res.status(200).json(data)
    } catch (err) {
      res.status(500).send({ message: err.message })
    }
  })
}))

// async function validateSeeds (req, res, next) {
//   /* Ensures user specified seeds are valid and exist in the database
//   */

//   const queryRes = await query_es(req.body, index_name, es)
//   if (req.body.length !== queryRes.hits.hits.length)
//   .then(function(es_response) {
//     response.send(es_response.hits.hits)
//   });
// }

let port

if (process.env.NODE_ENV === 'production') {

  port = 3001

  // if environment is in production, serve the static production build
  app.use(express.static(path.join(__dirname, 'client/build')))

  app.get('*', (req, res) => {
    console.log(req.headers['x-real-ip'])
    res.sendFile(path.join(__dirname, 'client/build/index.html'))
  })
} else {
  port = 3002
}



app.use(function(err, req, res, next) {
  // error middleware
  // console.log(err)
  res.status(500).send({ message: err.message })
})

app.listen(port, () => {
  console.log(`Server listening on Port ${port}`);
});

function wrapAsync(fn) {
  // this function ensures error middleware works for async functions
  // details here: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
  return function(req, res, next) {
    fn(req, res, next).catch(next)
  }
}