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

    // Add a line through center of screen (for debugging purposes).
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

    // Translate node collection 
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
            return getForcePositions(d, "X")
        }))
        .force("y", d3.forceY().strength(0.4).y(function(d) {
            return getForcePositions(d, "Y")
        }))
        .velocityDecay(0.15)
        .alpha(0.3)
        .restart();


    function getForcePositions(d, axis) {
        /*
        Computes the position on screen that a force will be applied to 'd'.
        
        d: (object) Data point.
        axis: (string) Axis to apply force to. One of 'X' or 'Y'.
        */
    
        if (axis === "X") {
            return width / 4
        }
    
        if (axis === "Y") {
            return nodeSpacing * d.rank;
        }
    }

    // Get number of nodes in collection.
    let nNodes = d3.selectAll(".node").size()

    // Initial position.
    let currentY = height / 2;

    // Add arrow up (38) and arrow down (40) listeners.
    $(document).on("keydown", function(event) {
        
        let newPosition;

        // Up arrowkey.
        if (event.which === 38) {

            // Specify new position to hop up to, bounded by node collection.
            newPosition = Math.max(
                Math.min(currentY + nodeSpacing, 0),
                -(nNodes - 1) * nodeSpacing);
        }

        // Down arrowkey.
        if (event.which === 40) {
            // Specify new position to hop down to, bounded by node collection.
            newPosition = Math.max(
                Math.min(currentY - nodeSpacing, 0),
                -(nNodes - 1) * nodeSpacing);
        }

        // Transition to 'newPosition'.
        scrollNodes(newPosition);

        // Update current focused node position.
        currentY  = newPosition;
    })

    // Defines scroll-end timer.
    let timer;

    function translateTimeout(pos) {
        /*
        Waits for the end of a scroll event before computing nearest
        node to snap to.
        */

        // Time to wait until the end of a scroll event is detected.
        let endTime = 150 

        // Waits for 'endTime' after being triggered by scroll event
        // and snaps nodes to nearest node position.
        timer = setTimeout(function() {

            // Given the new scroll position, find the closest 'bin' or
            // discrete position.
            let closestPos = closest(pos);
            newPosition = closestPos;

            // Transition to 'newPosition'.
            scrollNodes(newPosition);

            // Update current focused node position.
            currentY = newPosition;

        }, endTime);
    }

    // Add scroll listener.
    d3.select("#network").call(d3.zoom()).on("wheel.zoom", function() {
        /*
        Translates node collection based on scroll strength. 
        */

        // Removes timer on new scroll event.
        clearTimeout(timer);

        // Get scroll Y delta.
        let deltaY = d3.event.deltaY;

        // Specify new position to scroll to, bounded by node collection.
        let newPosition = Math.max(Math.min(currentY - deltaY, 0),
            -(nNodes - 1) * nodeSpacing);

        // Scroll nodes.
        d3.select(".everything")
            .transition()
            .ease(d3.easeLinear)
            .duration(50)
            .attr("transform", "translate(0, " + (newPosition + height / 2).toString() + ")")

        // Update current focused node position.
        currentY = newPosition;

        // Add scroll-end listener.
        translateTimeout(newPosition);
        
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
        Computes the closest scroll snap position to 'pos'.
        */

        // Take magnitude of 'pos'.
        let posMagnitude = Math.abs(pos);

        // Integer corresponding to node rank behind the current
        // position.
        let positionInt = Math.floor(posMagnitude / nodeSpacing);
        
        // Snap position behind current position.
        let lower = positionInt * nodeSpacing;

        // Snap position ahead of current position.
        let higher = (positionInt + 1) * nodeSpacing;

        // Magnitude of new scroll snap position.
        let magnitude;

        // Determine which scroll snap position (lower or higher) is
        // closest to the current position.
        if ((posMagnitude - lower) < (higher - posMagnitude)) {
            magnitude = lower;
        } else {
            magnitude = higher;
        }

        // Determine sign of scroll snap position.
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
    Determines the top two radii of the nodes.
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