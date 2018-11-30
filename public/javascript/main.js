/*
'main.js' wraps all front-end functionality. Here, modules are imported 
and interface with each other. This file is packaged using browserify 
and included in the index HTML page.
*/

const $ = require("jquery");
const on_start = require("./on-start.js");
const selectize_input = require("./selectize-input.js");
const on_go = require("./on-go.js");
const refine_search = require("./refine-search.js")

// Called when the document is ready.
$(document).ready(function() {
    console.log('ready');
    on_start.on_start();
})

// Instantiate selectize search bar.
selectize_input.instantiate_selectize();

// Define search behaviour. Here, after user query, a D3 force-
// directed graph is rendered. Tooltips are assigned to each
// node as well as modals.
on_go.create_listeners();

refine_search.add_refine_search_listener();
