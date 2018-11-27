const $ = require("jquery");

// Object to store refined papers.
let refined_papers = {};

function add_refine_button_listener(paper_id, node) {
    /*
    Adds a click listener to modal refine button and stores the
    added papers in an object.
    */

    // Get refine button.
    let refine_button = $('#add-to-refine-button')

    // Add a click listener to the refine button.
    refine_button.on("click", function() {
        on_refine_click(paper_id, node);
    })
}

function on_refine_click(paper_id, node) {
    /*
    */

    // Check if 'paper_id' is already in the refined search
    // object. If so, remove it, if not, add it.
    if (paper_id in refined_papers) {
        delete refined_papers[paper_id];
    } else {
        refined_papers[paper_id] = true;
    }

    console.log(refined_papers);
    console.log(node);
}

module.exports.refined_papers = refined_papers;
module.exports.add_refine_button_listener = add_refine_button_listener;