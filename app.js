var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");

var app = express();

var port = 8001;

// Boilerplate
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(port, () => {
  console.log("Server listening on Port " + port);
});
