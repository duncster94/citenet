/*
'main.js' wraps all front-end functionality. Here, modules are imported 
and interface with each other. This file is packaged using browserify 
and included in the index HTML page.
*/

// Les Mis data, used for testing purposes.
const graph = require("./les-mis-data.js")
const d3_layout = require("./d3-layout");
const create_tooltips = require("./create-tooltips.js");

// Here a force directed graph is rendered. Rendered nodes and a Boolean
// indicated drag status are returned. Call 'd3_layout' after random 
// walk has run and client recieves response.
const node_and_drag = d3_layout.d3_layout(graph.data);
const node_obj = node_and_drag.node
const is_dragging = node_and_drag.is_dragging

// Tooltips are created for each node.
create_tooltips.create_tooltips(node_obj, is_dragging);