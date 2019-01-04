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
            return nodeSpacing * d.rank + counter;
        }
    }

    // Initial position.
    let currentY = height / 2;

    // Scroll damping factor.
    let dampingFactor = 0.6;

    d3.select("#network").call(d3.zoom()).on("wheel.zoom", function() {

        // Get scroll Y delta.
        let deltaY = dampingFactor * d3.event.deltaY;
        // console.log(deltaY);

        // if (deltaY >= 0) {
        //     simulation
        //         .force("y2", d3.forceY(60 * nodeSpacing).strength(deltaY/10000))
        //         .force("y3", null)
        //         .alpha(0.1)
        //         .restart();
        // } else {
        //     simulation
        //         .force("y2", null)
        //         .force("y3", d3.forceY(-60 *2 * nodeSpacing).strength(-deltaY/10000))
        //         .alpha(0.1)
        //         .restart();
        // }
            
        // console.log('deltaY', deltaY);
        // console.log('currentY', currentY);
        // console.log("currentY", currentY);
        // closestPos = -closest(-currentY, nodePos);
        // console.log("closestPos", closestPos)
        // deltaY = deltaY - 0.1 * Math.abs(closestPos - currentY);
        // console.log(deltaY);
        // prevDeltaY = deltaY;
        // prevprevDeltaY = prevDeltaY;
        // prevprevprevDeltaY = prevprevDeltaY;

        // Specify new position to scroll to, bounded by node collection.
        let newPosition = Math.max(Math.min(currentY - deltaY, height / 2),
            -59 * nodeSpacing + height / 2);
        let closestPos = -closest(-newPosition, nodePos);
        newPosition = closestPos;
        console.log(newPosition);

        // Update node collection position.
        // $(".everything").attr("transform", 
            // "translate(0, " + (newPosition).toString() + ")")
        
        simulation
            .force("y", d3.forceY().strength(0.5).y(function(d) {
                return getForcePositions(d, newPosition, "Y")
            }))
            .velocityDecay(0.3)
            .alpha(0.3)
            .restart();

        // Update current node collection position.
        currentY  = newPosition;
    });

    // d3.select("#network").call(d3.zoom()).on("wheel.zoom", function() {
    //     simulation
    //         .force("y", d3.forceY(nodePos).strength(0.4))
    // });

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


    function closest (num, arr) {
        var mid;
        var lo = 0;
        var hi = arr.length - 1;
        while (hi - lo > 1) {
            mid = Math.floor ((lo + hi) / 2);
            if (arr[mid] < num) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        if (num - arr[lo] <= arr[hi] - num) {
            return arr[lo];
        }
        return arr[hi];
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