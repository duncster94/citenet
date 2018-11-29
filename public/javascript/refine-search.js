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
    Specifies behaviour when the user clicks to add or remove a
    paper from the refined search list.
    */

    // Check if 'paper_id' is already in the refined search
    // object. If so, remove it, if not, add it.
    if (paper_id in refined_papers) {
        delete refined_papers[paper_id];
    } else {
        refined_papers[paper_id] = true;
    }

    // Check if 'refined_papers' is empty. If so, disable
    // the refine search button, if not, enable it.
    if (Object.keys(refined_papers).length === 0) {
        $('#refine-button').prop("disabled", true);
    } else {
        $('#refine-button').prop("disabled", false);
    }

    console.log(refined_papers);
    console.log(node);
}

function add_refine_search_listener() {
    /*
    Adds a click listener to the refine search button.
    */

    // Get the search button.
    refine_button = $('#refine-button');

    // Add a click listener.
    refine_button.on("click", function() {

        // Disable the refine button to prevent any double
        // searching.
        refine_button.prop("disabled", true);

        // Fade out screen.

        // Create new 'OnGo' object.

        // Call search.
    })
}

module.exports.refined_papers = refined_papers;
module.exports.add_refine_button_listener = add_refine_button_listener;