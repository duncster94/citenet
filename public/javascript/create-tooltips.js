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
    const tips = {};

    // Iterate over each node and create a corresponding tooltip containing
    // relevant metadata about the paper (node).
    node_obj._groups[0].forEach(function (node) {
        
        let node_data = node.__data__
        let title = node_data.title;
        let authors = node_data.authors;
        let pub_date = node_data.pub_date;

        // Create an author string.
        let author_string;
        if (authors.length == 1) {
            author_string = authors[0].LastName + '   ';
        } else {
            author_string = authors[0].LastName + ' et al.   ';
        }

        // Define the node specific tooltip, including it's HTML and
        // behaviour.
        let tip = tippy(node, {
            content: 
            '<div>' +
                '<span>' +
                    '<p>' + 
                        title + 
                    '</p>' +
                    '<p>' +
                        author_string + pub_date.Year + 
                    '</p>' +
                '</span>' +
            '</div>',
            trigger: "manual",
            arrow: true,
            arrowType: 'round',
            animation: "scale",
            inertia: true,
            theme: "customLight"
        }).instances[0]
        
        // Add this tooltip to 'tips', indexing with paper ID.
        tips[node.__data__.id] = tip
    })

    // Add event listeners to nodes.
    node_obj
        // Show tooltip on mouseover.
        .on("mouseover", function(d) {
            // If the node is not currently being dragged, display
            // the tooltip.
            // TODO: tooltips still displaying on mousedown, D3 zoom/drag 
            // consumes mousedown event. Need to find a way to properly
            // hide tooltips on mousedown.
            if (!is_dragging.state) {
                tips[d.id].show();
            }
        })
        // Hide tooltip on mouseout.
        .on("mouseout", function(d) {
            tips[d.id].hide();
        })

}

module.exports.create_tooltips = create_tooltips;