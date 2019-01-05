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

    // Save the current positions of the nodes.
    let nodePositions = getPositions(node);

    // Get window width and height.
    let width = $("#network").width();
    let height = $("#network").height();

    $(".links").fadeOut(100);
    d3.select("#network")
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", height / 2)
        .attr("y2", height / 2)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Get top two largest radii in order to properly space nodes.
    let topRadii = getTopRadii(node);
    let radiusFirst = topRadii.first;
    let radiusSecond = topRadii.second;

    // Padding between largest two radii.
    let paddingRadii = 20;

    // Spacing between nodes.
    let nodeSpacing = radiusFirst + paddingRadii + radiusSecond;

    // Create array of node positions.
    let nodePos = [];
    for (let pos = 0; pos < 60; pos++) {
        nodePos.push(pos * nodeSpacing);
    }

    d3.select(".everything")
        .transition()
        .duration(600)
        .attr("transform", "translate(0, " + (height/2).toString() + ")");

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
            return nodeSpacing * d.rank + counter;
        }
    }

    // Initial position.
    let currentY = height / 2;

    // Add arrow up (38) and arrow down (40) listeners.
    $(document).on("keydown", function(event) {
        console.log(event.which);

        let newPosition;

        if (event.which === 38) {

            // Specify new position to hop up to, bounded by node collection.
            newPosition = Math.max(
                Math.min(currentY + nodeSpacing, 0),
                -59 * nodeSpacing);
        }

        if (event.which === 40) {
            // Specify new position to hop down to, bounded by node collection.
            newPosition = Math.max(
                Math.min(currentY - nodeSpacing, 0),
                -59 * nodeSpacing);
        }

        console.log(newPosition);

        // Transition to 'newPosition'.
        scrollNodes(newPosition);

        // Update current focused node position.
        currentY  = newPosition;
    })

    d3.select("#network").call(d3.zoom()).on("wheel.zoom", function() {

        // Get scroll Y delta.
        let deltaY = d3.event.deltaY;
        // console.log(deltaY);

        // Specify new position to scroll to, bounded by node collection.
        let newPosition = Math.max(Math.min(currentY - deltaY, 0),
            -59 * nodeSpacing);
        console.log(newPosition);

        // Given the new scroll position, find the closest 'bin' or
        // discrete position.
        let closestPos = closest(newPosition);
        newPosition = closestPos;
        console.log(newPosition);

        // Transition to 'newPosition'.
        scrollNodes(newPosition);

        // Update current focused node position.
        currentY  = newPosition;
    });

    function scrollNodes(newPos) {
        d3.select(".everything")
            .transition()
            .ease(d3.easeExpOut)
            .duration(500)
            .attr("transform", "translate(0, " + (newPos + height / 2).toString() + ")");
    }

    function closest(pos) {
        /*
        */

        let posMagnitude = Math.abs(pos);

        let positionInt = Math.floor(posMagnitude / nodeSpacing);
        let lower = positionInt * nodeSpacing;
        let higher = (positionInt + 1) * nodeSpacing;

        let magnitude;

        if ((posMagnitude - lower) < (higher - posMagnitude)) {
            magnitude = lower;
        } else {
            magnitude = higher;
        }

        if (pos <= 0) {
            return -magnitude;
        } else {
            return magnitude;
        }
    }
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