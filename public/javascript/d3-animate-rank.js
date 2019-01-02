const d3 = require("d3");
const $ = require("jquery");

function addAnimateRankListener(simulation, node) {
    /*
    Adds a click listener to the 'animate rank' button.
    */

    $("#animate-rank-button").on("click", function() {
        animateRank(simulation, node);
    });
}

function animateRank(simulation, node) {
    console.log('clicked');
    $(".links").fadeOut(100);

    // Save the current positions of the nodes.
    let nodePositions = getPositions(node);

    // Get window width and height.
    let width = $("#network").width();
    let height = $("#network").height();

    console.log(width, height);

    // Specify node spacing parameters.
    

    simulation
        .force("links", null)
        .force("charge", null)
        .force("center", null)
        .force("x", d3.forceX().strength(0.2).x(function(d) {
            return getForcePositions(d, "X")
        }))
        .force("y", d3.forceY().strength(0.2).y(function(d) {
            return getForcePositions(d, "Y")
        }))
        .velocityDecay(0.15)
        .alpha(0.4)
        .restart();
    
    function getForcePositions(d, axis) {
        /*
        Computes the position on screen that a force will be applied to 'd'.
        */
    
        if (axis === "X") {
            return 0;
        }
    
        if (axis === "Y") {
            return d.rank * 100;
        }
    }
}

function getPositions(node) {

}


module.exports.addAnimateRankListener = addAnimateRankListener