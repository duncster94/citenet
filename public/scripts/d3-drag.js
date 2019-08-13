const d3 = require("d3");
const $ = require("jquery");

/*
Defines drag behaviour for D3 nodes in network view.
*/

// Object specifying whether dragging is currently happening. This
// gets passed to "create-tooltips" and ensures tooltips do not
// display during drag.
let isDragging = {
    "state": false
};

// Add drag capabilities.
let dragHandler = d3.drag()
    .on("start", drag_start)
    .on("drag", drag_drag)
    .on("end", drag_end);

// Specify drag functions.
function drag_start(d) {
    isDragging.state = true;
    // if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

// Make sure you can't drag the circle outside the box.
function drag_drag(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function drag_end(d) {
    isDragging.state = false;
    // if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;

    // // Set fixed position of node to where user dragged it.
    // d.fx = d3.event.x;
    // d.fy = d3.event.y;
}

module.exports.isDragging = isDragging;
module.exports.dragHandler = dragHandler;