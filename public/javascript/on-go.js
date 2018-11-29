const $ = require("jquery");

/*
Specifies behaviour when papers in selectize search bar are submitted.
*/

class OnGo {
    /*
    */

    constructor (d3_layout, create_tooltips, create_modal) {
        
        this.d3_layout = d3_layout;
        this.create_tooltips = create_tooltips;
        this.create_modal = create_modal;
        this.seeds = [];

    }

    create_listeners() {
        /*
        Adds listeners to the 'GO!' button and specifies search behaviour.
        TODO: expand this documentation.
        */

        let self = this;

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
            self.seeds = $("#selectize")[0].value.split(',');

            // Send request.
            self.send_papers();
        }
    }

    send_papers() {
        /*
        POSTs an ajax request to the server and awaits a response.
        */

        let self = this;

        $.ajax({
            url: "/submit_paper",
            method: "POST",
            dataType: "json",
            data: {"seeds": self.seeds},
            cache: false,
            timeout: 0, // set this to a reasonable value for production

            // Before request is sent, hide front page and show loading 
            // page.
            beforeSend: function() {
                self.before_send();
            },

            // Fires when response is recieved, error or timeout.
            complete: function() {
            },

            // Fires on a successful response. Here response is processed
            // and D3 layout is rendered.
            success: function(response) {
                self.process_response(response);
            },

            // Fires if there is an error.
            // TODO: properly handle errors.
            error: function(jqXHR, status, error) {
                console.log(error);
            }
        });
    }

    before_send() {
        /*
        Fades out the front search page and fades in the loading page.
        */

        // Fade out the front page.
        $("#front-page").fadeOut(600, function() {

            // Fade in the loading screen.
            console.log('faded out');
        })
    }

    process_response(response) {
        /*
        */

        let self = this;

        const layout_obj = self.d3_layout.d3_layout(response, 
            self.create_modal);
        const node_obj = layout_obj.node;
        const is_dragging = layout_obj.is_dragging;
        const simulation = layout_obj.simulation;

        self.create_tooltips.create_tooltips(node_obj, is_dragging);

        // After layout is instantiated and begins, fade in the svg canvas.
        $("#post-layout-buttons").show();
        $("#network").fadeIn(300, function() {
        });

    }
}

module.exports.OnGo = OnGo;