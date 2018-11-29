/*
'main.js' wraps all front-end functionality. Here, modules are imported 
and interface with each other. This file is packaged using browserify 
and included in the index HTML page.
*/

const $ = require("jquery");
const on_start = require("./on-start.js");
const selectize_input = require("./selectize-input.js");
const create_modal = require("./create-modals.js");
const d3_layout = require("./d3-layout");
const create_tooltips = require("./create-tooltips.js");
const on_go = require("./on-go.js");

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
const OnGo = new on_go.OnGo(d3_layout, create_tooltips, create_modal);
OnGo.create_listeners();
