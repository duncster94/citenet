const $ = require("jquery");
const d3_layout = require("./d3-layout");
const create_tooltips = require("./create-tooltips.js");
const create_modal = require("./create-modals.js");

function create_listeners() {
    /*
    Adds listeners to the search button and specifies search behaviour.
    TODO: expand this documentation.
    */

    // Get 'GO!' button element.
    let go = $('#selectize-go-button');
    
    // Set a click listener.
    go.click(function() {
        disable_and_send();
    });

    // Set an 'enter' keypress listener.
    go.keypress(function(event) {
        if(event.which == 13) {
            disable_and_send();
        }
    });

    function disable_and_send() {

        // Disable button to avoid double searching.
        go.prop("disabled", true);

        // Get user inputs and set as object property.
        seeds = $("#selectize")[0].value.split(',');

        // Send request.
        send_papers(seeds, before_send, process_response);
    }
}

function send_papers(seeds, before_send, process_response) {
    /*
    POSTs an ajax request to the server and awaits a response.
    */

    $.ajax({
        url: "/submit_paper",
        method: "POST",
        dataType: "json",
        data: {"seeds": seeds},
        cache: false,
        timeout: 0, // set this to a reasonable value for production

        // Before request is sent, hide front page and show loading 
        // page.
        beforeSend: function() {
            before_send();
        },

        // Fires when response is recieved, error or timeout.
        complete: function() {
        },

        // Fires on a successful response. Here response is processed
        // and D3 layout is rendered.
        success: function(response) {
            process_response(response);
        },

        // Fires if there is an error.
        // TODO: properly handle errors.
        error: function(jqXHR, status, error) {
            console.log(error);
        }
    });
}

function before_send() {
    /*
    Fades out the front search page and fades in the loading page.
    */

    // Fade out the front page.
    $("#front-page").fadeOut(600, function() {

        // Fade in the loading screen.
        console.log('faded out');
    })
}

function process_response(response) {
    /*
    */

    create_layout(response);

    // After layout is instantiated and begins, fade in the svg canvas.
    $("#post-layout-buttons").show();
    $("#network").fadeIn(300, function() {
    });

}

function create_layout(response) {
    /*
    Creates D3 layout in addition to tooltips and modals.
    */

    let layout_obj = d3_layout.d3_layout(response, 
        create_modal);
    let node_obj = layout_obj.node;
    let is_dragging = layout_obj.is_dragging;
    let simulation = layout_obj.simulation;

    create_tooltips.create_tooltips(node_obj, is_dragging);
}

module.exports.create_listeners = create_listeners;
module.exports.send_papers = send_papers;
module.exports.create_layout = create_layout;