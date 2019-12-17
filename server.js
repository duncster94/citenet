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
// const index_name = "gisample";
const index_name = "papers"

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

  // console.log(request)

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

      // console.log(node)
      let pub_year = node.PubDate.Year

      // Make sure publication year is defined.
      if (pub_year) {
        dates.push(pub_year);
      }
    })
    let min_date = Math.min(...dates)
    let max_date = Math.max(...dates)

    function scoreToRadius(node, maxScore, seeds) {
      /* Given a node, take its score and map it to a radius.
      */

      let radius = 30 * node.score / maxScore

      // Set seed nodes to a fixed size.
      if (seeds.includes(node.id)) {
        radius = 15
      }
      return Math.max(5, radius)
    }

    function dateToColour(node, D_min, D_max, seeds) {
      /* Given a node, map the appropriate colour.
      */

      // If the node is a seed node, colour it differently.
      if (seeds.includes(node.id.toString())) {
        return "#9D0000"
      }

      // Get publication year.
      let year = node.PubDate.Year

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

      let colour = `hsla(0,0%, ${lightness.toString()}%,1)`

      return colour
    }

    function formatAuthors(authors) {
      /* Formats author list for use in modal and popover.
      */

      let authorString = ""

      // Add author names to 'authorString'.
      for (author of authors) {
        let first_name
        if (author.ForeName) {
          first_name = author.ForeName.split(" ").map(str => {
            return str[0]
          }).join("")
        } else {
          first_name = ""
        }

        let last_name = author.LastName

        authorString += `${first_name} ${last_name}, `
      }

      // Remove final comma and space at end of 'authorString'.
      authorString = authorString.slice(0, -2);

      return authorString;
    }

    function formatDate(date) {

      let dateString = ""

      if ("Month" in date) {
        switch (date["Month"]) {
          case "Jan":
            dateString += "January "
            break
          case "Feb":
            dateString += "February "
            break
          case "Mar":
            dateString += "March "
            break
          case "Apr":
            dateString += "April "
            break
          case "Jun":
            dateString += "June "
            break
          case "Jul":
            dateString += "July "
            break
          case "Aug":
            dateString += "August "
            break
          case "Sep":
            dateString += "September "
            break
          case "Oct":
            dateString += "October "
            break
          case "Nov":
            dateString += "November "
            break
          case "Dec":
            dateString += "December "
            break
          case "01":
            dateString += "January "
            break
          case "02":
            dateString += "February "
            break
          case "03":
            dateString += "March "
            break
          case "04":
            dateString += "April "
            break
          case "05":
            dateString += "May"
            break
          case "06":
            dateString += "June "
            break
          case "07":
            dateString += "July "
            break
          case "08":
            dateString += "August "
            break
          case "09":
            dateString += "September "
            break
          case "10":
            dateString += "October "
            break
          case "11":
            dateString += "November "
            break
          case "12":
            dateString += "December "
            break
          default:
            dateString += `${date["Month"]} `
        }
      }

      dateString += date["Year"]

      return dateString
    }

    function formatJournal(journal) {
      let formattedJournal 
      if (journal.length > 20) {
        formattedJournal = journal.substring(0, 20) + '...'
      } else {
        formattedJournal = journal
      }

      return formattedJournal
    }
    
    message.subgraph.nodes.sort((a, b) => (a.score > b.score || seeds.includes(a.id)) ? -1 : 1)
    const maxScore = message.subgraph.nodes[0].score

    const radii = message.subgraph.nodes.map(node => {
      return scoreToRadius(node, maxScore, seeds)
    })

    const colours = message.subgraph.nodes.map(node => {
      return dateToColour(node, min_date, max_date, seeds)
    })


    message.subgraph.nodes.forEach(node => {
      node.formattedAuthors = formatAuthors(node.Authors)
    })

    message.subgraph.nodes.forEach(node => {
      node.formattedDate = formatDate(node.PubDate)
    })

    message.subgraph.nodes.forEach(node => {
      node.formattedJournal = formatJournal(node.Journal)
    })

    console.log(message.subgraph.nodes.length)

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