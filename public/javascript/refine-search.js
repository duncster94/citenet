const $ = require("jquery");
const on_go = require("./on-go.js");
const d3 = require("d3");

function add_refine_button_listener(paper_id, node, refined_papers) {
    /*
    Adds a click listener to modal refine button and stores the
    added papers in an object.
    */

    // Get refine button.
    let refine_button = $('#add-to-refine-button')

    // Add a click listener to the refine button.
    refine_button.on("click", function() {
        on_refine_click(paper_id, node, refined_papers);
    })
}

function on_refine_click(paper_id, node, refined_papers) {
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

function add_refine_search_listener(refined_papers) {
    /*
    Adds a click listener to the refine search button.
    */

    // Get the search button.
    refine_button = $('#refine-button');

    // Add a click listener.
    refine_button.on("click", function() {

        console.log("clicked");
        // Get refined papers array.
        let refined_papers_arr = Object.keys(refined_papers);

        // Send paper query.
        on_go.send_papers(refined_papers_arr, 
            before_refined_send, process_refined_response);
    })
}

function before_refined_send() {
    /*
    */

    // Disable the refine button to prevent any double
    // searching.
    $('#refine-button').prop("disabled", true);

    // Fade-out screen.
    $("#post-layout-buttons").removeClass("fadeIn").addClass("fadeOut")

    // Clear the D3 canvas.
    d3.select("svg").selectAll("*").remove();
}

function process_refined_response(response) {
    /*
    */

    // Fade in buttons.
    $("#post-layout-buttons").removeClass("fadeOut").addClass("fadeIn")

    // Re-enable refine button.
    $('#refine-button').prop("disabled", false);

    on_go.create_layout(response)
}

// module.exports.refined_papers = refined_papers;
module.exports.add_refine_button_listener = add_refine_button_listener;
module.exports.add_refine_search_listener = add_refine_search_listener;