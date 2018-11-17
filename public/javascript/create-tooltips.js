const tippy = require("tippy.js");


function create_tooltips(node_obj, is_dragging) {
    /*
    Creates a tooltip for each node based on the data it contains and
    sets event listeners to control their display.

    params: 
        node_obj: Object. Contains the node objects as defined in
            'd3-layout'.
        is_dragging: Object. Contains a Boolean that specifies whether
            a node is currently being dragged.
    
    returns:
        null
    */

    // Create an object to store tippy tooltip objects, indexed by paper
    // UUIDs.
    let tips = {};

    // Iterate over each node and create a corresponding tooltip containing
    // relevant metadata about the paper (node).
    node_obj._groups[0].forEach(function (node) {
        
        // Define the node specific tooltip, including it's HTML and
        // behaviour.
        let tip = tippy(node, {
            content: '<div><span><p>' + node.__data__.name + '</p></span></div>',
            trigger: "manual",
            arrow: true,
            arrowType: 'round',
            animation: "scale",
            inertia: true,
            theme: "customLight"
        }).instances[0]
        
        // Add this tooltip to 'tips', indexing with paper ID.
        tips[node.__data__.name] = tip
    })

    // Add event listeners to nodes.
    node_obj
        // Show tooltip on mouseover.
        .on("mouseover", function(d) {
            // If the node is not currently being dragged, display
            // the tooltip.
            if (!is_dragging.state) {
                tips[d.name].show();
            }
        })
        // Hide tooltip on mouseout.
        .on("mouseout", function(d) {
            tips[d.name].hide();
        })

}

module.exports.create_tooltips = create_tooltips;