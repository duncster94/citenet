const d3 = require("d3");
const $ = require("jquery");

function addAnimateRankListener(simulation, node, zoomHandler) {
    /*
    Adds a click listener to the 'animate rank' button.
    */

    $("#animate-rank-button").on("click", function() {
        animateRank(simulation, node, zoomHandler);
    });
}

function animateRank(simulation, node, zoomHandler) {
    /*
    */

    
    $(".links").fadeOut(100);

    // Save the current positions of the nodes.
    let nodePositions = getPositions(node);

    // Get window width and height.
    let width = $("#network").width();
    let height = $("#network").height();

    console.log(width, height);
    // Get top two largest radii in order to properly space nodes.
    let topRadii = getTopRadii(node);
    let radiusFirst = topRadii.first;
    let radiusSecond = topRadii.second;

    // Padding between largest two radii.
    let paddingRadii = 20;

    // Spacing between nodes.
    let nodeSpacing = radiusFirst + paddingRadii + radiusSecond;

    $(".everything").attr("transform", "translate(0, " + (height/2).toString() + ")");

    // Remove old forces and add new centering forces to each node
    // based on rank.
    simulation
        .force("links", null)
        .force("charge", null)
        .force("center", null)
        .force("x", d3.forceX().strength(0.4).x(function(d) {
            return getForcePositions(d, 0, "X")
        }))
        .force("y", d3.forceY().strength(0.4).y(function(d) {
            return getForcePositions(d, 0, "Y")
        }))
        .velocityDecay(0.15)
        .alpha(0.3)
        .restart();
    
    function getForcePositions(d, counter, axis) {
        /*
        Computes the position on screen that a force will be applied to 'd'.
        
        d: (object) Data point.
        counter: (integer) Corresponds to the node that is centered.
        axis: (string) Axis to apply force to. One of 'X' or 'Y'.
        */
    
        if (axis === "X") {
            // return (d.rank * 600) % 2400;
            return width / 4
        }
    
        if (axis === "Y") {
            return nodeSpacing * d.rank + (counter * nodeSpacing);
        }
    }

    // Track centered node.
    let counter = 0;
    let currentY = height / 2;

    d3.select("#network").call(d3.zoom()).on("wheel.zoom", function() {
        console.log(d3.event);

        // Get scroll Y delta.
        let deltaY = d3.event.deltaY;

        if (Math.abs(deltaY) > 0) {
            if (deltaY < 0) {
                counter++;
            } else {
                counter--;
            }
    
            // simulation
            //     .force("y", d3.forceY().strength(0.4).y(function(d) {
            //         return getForcePositions(d, counter, "Y")
            //     }))
            //     .velocityDecay(0.15)
            //     .alpha(0.3)
            //     .restart();

            let newPosition = Math.max(Math.min(currentY - deltaY, height / 2),
                -59 * nodeSpacing + height / 2);
            console.log(newPosition)
            console.log('everything height', $(".everything").height());
            console.log(59 * nodeSpacing);

            $(".everything").attr("transform", 
                "translate(0, " + (newPosition).toString() + ")")

            // Update current Y position.
            currentY  = newPosition;
        }

    });


    // // Event listener.
    // zoomHandler.on("start", function() {

    //     console.log(d3.event);
    //     counter++;

    //     simulation
    //         .force("y", d3.forceY().strength(0.4).y(function(d) {
    //             return getForcePositions(d, counter, "Y")
    //         }))
    //         .velocityDecay(0.15)
    //         .alpha(0.3)
    //         .restart();
    // })

    // zoomHandler.on("end", function() {
    //     console.log("end");
    // })
}

function getPositions(node) {

}

function getTopRadii(node) {
    /*
    */

    // Object to hold top two node radii.
    topRadii = {}

    // Get radii of top two scoring nodes.
    node.data().forEach(function(d) {
        if (d.rank === 0) {
            topRadii["first"] = scoreToRadius(d.score);
        }

        if (d.rank === 1) {
            topRadii["second"] = scoreToRadius(d.score);
        }
    });

    // Local function that maps score to radius.
    function scoreToRadius(score) {
        return 100 * Math.pow(score, 1 / 3);
    }

    return topRadii;
}

module.exports.addAnimateRankListener = addAnimateRankListener