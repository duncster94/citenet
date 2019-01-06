const tippy = require("tippy.js");


function createTooltips(nodeObj, isDragging) {
    /*
    Creates a tooltip for each node based on the data it contains and
    sets event listeners to control their display.

    params:
        nodeObj: Object. Contains the node objects as defined in
            'd3-layout'.
        isDragging: Object. Contains a Boolean that specifies whether
            a node is currently being dragged.
    /*
    Creates a tooltip for each node based on the data it contains and
    sets event listeners to control their display.

    params:
        nodeObj: Object. Contains the node objects as defined in
            'd3-layout'.
        isDragging: Object. Contains a Boolean that specifies whether
            a node is currently being dragged.

    returns:
        null
    */

    // Create an object to store tippy tooltip objects, indexed by paper
    // UUIDs.
    const tips = {};

    // Iterate over each node and create a corresponding tooltip containing
    // relevant metadata about the paper (node).
    nodeObj._groups[0].forEach(function(node) {

        let node_data = node.__data__
        let title = node_data.title;
        let authors = node_data.authors;
        let pub_date = node_data.pub_date;

        // Check if publication year is defined.
        let pub_year = "";
        if (pub_date.Year) {
            pub_year = pub_date.Year;
        }

        // Create an author string.
        let authorString;
        if (authors.length === 1) {
            authorString = `${authors[0].LastName}   `;
        } else {
            authorString = `${authors[0].LastName} et al.   `;
        }

        // Define the node specific tooltip, including it's HTML and
        // behaviour.
        let tip = tippy(node.children[0], {
            content: '<div>' +
                '<span>' +
                '<p>' +
                title +
                '</p>' +
                '<p>' +
                authorString + pub_year +
                '</p>' +
                '</span>' +
                '</div>',
            trigger: "manual",
            arrow: true,
            arrowType: "round",
            animation: "scale",
            inertia: true,
            theme: "customLight"
        }).instances[0]

        // Add this tooltip to 'tips', indexing with paper ID.
        tips[node.__data__.id] = tip
    })

    let isOver = false;

    // Add event listeners to nodes.
    nodeObj
        // Show tooltip on mouseover.
        .on("mouseover", function(d) {
            // If the node is not currently being dragged, display
            // the tooltip.
            // TODO: tooltips still displaying on mousedown, D3 zoom/drag
            // consumes mousedown event. Need to find a way to properly
            // hide tooltips on mousedown.
            if (!isDragging.state) {
                tips[d.id].show();
            }
        })
        // Hide tooltip on mouseout.
        .on("mouseout", function(d) {
            tips[d.id].hide();
            isOver = false;
        })

}

module.exports.createTooltips = createTooltips;
