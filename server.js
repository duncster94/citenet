const express = require('express');
const { fork } = require('child_process');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto')
const elasticsearch = require('elasticsearch');
const { query_es } = require('./query-es');
const { processSubnetwork } = require('./process-subnetwork')
const seedrandom = require('seedrandom')
const CONSTANTS = require('./constants')
require('dotenv').config()

const saveState = seedrandom('123456', { state: true }).state()

const app = express();
const es = new elasticsearch.Client({
  host: CONSTANTS.DATABASE_IP,
  log: 'error'
});

// Elasticsearch index.
const indexName = 'papers'

// Boilerplate
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/ping', (req, res) => {
  res.json({ res: req.body })
})

// Called on user selectize query.
app.post('/homepage_search_query', (req, res) => {

  // Get Elasticsearch query Promise and package response on Promise
  // resolution.
  query_es(req.body.value, indexName, es)
    .then(function(es_response) {
      res.send(es_response.hits.hits)
    });
});

// Called when user submits papers.
app.post('/submit_paper', wrapAsync(async (req, res) => {

  // Get seeds from req body.
  let seeds = req.body;

  // Create message to send to child process.
  let child_message = {seeds, indexName, saveState};

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

let port

if (process.env.NODE_ENV === 'production') {

  port = process.env.PRODUCTION_PORT

  // if environment is in production, serve the static production build
  app.use(express.static(path.join(__dirname, 'client/build')))

  app.get('*', (req, res) => {
    console.log(req.headers['x-real-ip'])
    res.sendFile(path.join(__dirname, 'client/build/index.html'))
  })
} else {
  port = process.env.DEVELOPMENT_PORT
}

app.post('/payload', (req, res) => {
  try {
    const secret = process.env.WEBHOOK_SECRET
    console.log(secret)
    // https://stackoverflow.com/questions/7480158/how-do-i-use-node-js-crypto-to-create-a-hmac-sha1-hash
    const hashedSecret = `sha1=${crypto.createHmac('sha1', secret)
      .update(JSON.stringify(req.body.payload))
      .digest('hex')}`
    const reqSecret = req.headers['x-hub-signature']
    console.log(hashedSecret)
    console.log(reqSecret)
    console.log(req.body)
    const safe = crypto.timingSafeEqual(Buffer.from(reqSecret), Buffer.from(hashedSecret))
    console.log(safe)
    if (!safe) {
      return res.status(401).send({ message: 'Mismatched signatures' })
    }
    console.log(req.body.action)
    console.log(req.headers['x-github-event'])
    // Execute code here
  } catch (err) {
    console.log(err)
  }
})

app.use(function(err, req, res, next) {
  // error middleware
  console.log(err)
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