const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const elasticsearch = require("elasticsearch");
const extractSubnetwork = require("./random-walk.js");

const app = express();
const es = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

const port = 8001;

// Boilerplate
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {

    extSub = new extractSubnetwork(["21966264", "26004540"], 10000, 0.25, 100, es, 'gisample');
    console.time('Get subgraph time')
    let subgraph = extSub.get_subgraph();
    subgraph.then(() => {
      console.timeEnd('Get subgraph time');
      res.render("index");
    });

});

app.listen(port, () => {
  console.log("Server listening on Port " + port);
});
