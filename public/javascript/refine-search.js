const $ = require("jquery");
const onGo = require("./on-go.js");
const d3 = require("d3");

function add_refine_button_listener(paperId, node, refinedPapers) {
    /*
    Adds a click listener to modal refine button and stores the
    added papers in an object.
    */

    // Get refine button.
    let refine_button = $("#add-to-refine-button")

    // Add a click listener to the refine button.
    refine_button.on("click", function() {
        on_refine_click(paperId, node, refinedPapers);
    })
}

function on_refine_click(paperId, node, refinedPapers) {
    /*
    Specifies behaviour when the user clicks to add or remove a
    paper from the refined search list.
    */

    // Check if "paperId" is already in the refined search
    // object. If so, remove it, if not, add it. Add or remove
    // image overlay accordingly.
    if (paperId in refinedPapers) {
        delete refinedPapers[paperId];
        $("#overlay_" + paperId).hide();
    } else {
        refinedPapers[paperId] = true;
        $("#overlay_" + paperId).show();
    }

    // Check if "refinedPapers" is empty. If so, disable
    // the refine search button, if not, enable it.
    if (Object.keys(refinedPapers).length === 0) {
        $("#refine-button").prop("disabled", true);
    } else {
        $("#refine-button").prop("disabled", false);
    }

    console.log(refinedPapers);
    console.log(node);
}

function add_refineSearch_listener(refinedPapers) {
    /*
    Adds a click listener to the refine search button.
    */

    // Get the search button.
    refine_button = $("#refine-button");

    // Add a click listener.
    refine_button.on("click", function() {

        console.log("clicked");
        // Get refined papers array.
        let refinedPapersArr = Object.keys(refinedPapers);

        console.log("refined send", refinedPapersArr);

        // Send paper query.
        onGo.send_papers(refinedPapersArr,
            before_refined_send, process_refined_response);
    });
}

function before_refined_send() {
    /*
     */

    // Disable the refine button to prevent any double
    // searching.
    $("#refine-button").prop("disabled", true);

    // Fade-out screen.
    $("#post-layout-buttons").removeClass("fadeIn").addClass("fadeOut");

    // Clear the D3 canvas.
    d3.select("svg").selectAll("*").remove();
}

function process_refined_response(response) {
    /*
     */

    // Fade in buttons.
    $("#post-layout-buttons").removeClass("fadeOut").addClass("fadeIn");

    // Re-enable refine button.
    $("#refine-button").prop("disabled", false);

    onGo.create_layout(response);
}

// module.exports.refinedPapers = refinedPapers;
module.exports.add_refine_button_listener = add_refine_button_listener;
module.exports.add_refineSearch_listener = add_refineSearch_listener;
