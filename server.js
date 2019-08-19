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
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Called on page load.
// app.get("/", (request, response) => {
//   response.render("index");
// });

app.post("/test", (request, response) => {
  response.json({res: `POST request proxied to localhost:${port}`})
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

  console.log(request.body);
  // Get seeds from request body.
  let seeds = request.body.seeds;

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
    response.send({subgraph: message.subgraph, seeds: seeds});
  });
});

app.listen(port, () => {
  console.log("Server listening on Port " + port);
});