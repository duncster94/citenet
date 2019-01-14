/*
'main.js' wraps all front-end functionality. Here, modules are imported
and interface with each other. This file is packaged using browserify
and included in the index HTML page.
*/
const $ = require("jquery");
const onStart = require("./on-start.js");
const selectizeInput = require("./selectize-input.js");
const onGo = require("./on-go.js");
const refineSearch = require("./refine-search.js");

// Called when the document is ready.
$(document).ready(function() {
    console.log("ready");
    onStart.onStart();
});

// Instantiate selectize search bar.
selectizeInput.instantiate_selectize();

// Define search behaviour. Here, after user query, a D3 force-
// directed graph is rendered. Tooltips are assigned to each
// node as well as modals.
onGo.create_listeners();
const refinedPapers = onGo.refinedPapers;

refineSearch.add_refineSearch_listener(refinedPapers);