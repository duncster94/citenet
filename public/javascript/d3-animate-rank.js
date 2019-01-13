const d3 = require("d3");
const $ = require("jquery");

function addAnimateRankListener(layoutObj) {
    /*
    Adds a click listener to the 'animate rank' button.
    */

    $("#animate-rank-button").on("click", function() {
        animateRank(layoutObj);
    });
}

function animateRank(layoutObj) {
    /*
    */

    let simulation = layoutObj.simulation
    let node = layoutObj.node
    let zoomHandler = layoutObj.zoomHandler
    let dragHandler = layoutObj.dragHandler

    // Save the current positions of the nodes.
    let nodePos = savePos(node);

    // Get fixed positions of the nodes.
    let nodeFixedPos = saveFixedPos(node);

    // Remove any fixed node positions.
    // TODO: maybe remove fixed positions all together?

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

    // Padding between largest two nodes. This determines overall vertical
    // node spacing on the screen.
    let nodePadding = width / 3;

    // Spacing between nodes.
    let nodeSpacing = radiusFirst + 10000/nodePadding + radiusSecond;

    // Translate node collection.
    d3.select(".everything")
        .transition()
        .ease(d3.easeSinOut)
        .duration(1200)
        .attr("transform", "translate(0, " + (height/2).toString() + ")");

    
    // Padding to add between node and paper details.
    let detailsPadding = 20;

    // Padding to add between left edge of screen and nodes.
    let leftPadding = width / 10;

    // Width of foreignObject.
    let foWidth = width - leftPadding;

    // Remove forces.
    simulation
        .force("links", null)
        .force("charge", null)
        .force("center", null)
        .on("tick", null)

    // Translate each node based on rank.
    d3.selectAll(".node")
        .transition()
        .ease(d3.easeElastic)
        .duration(1600)
        .attr("transform", function(d) {
            return "translate("+ leftPadding + ", " 
            + nodeSpacing * d.rank + ")"
        })
        
    // Add paper details to right of each node.
    node.append("foreignObject")
        .attr("height", 100)
        .attr("width", "100%")
        .append("xhtml:div")
        .attr("class", "animate-rank-details")
        .html(function(d) {
            return d.title
        })


    // Get number of nodes in collection.
    let nNodes = d3.selectAll(".node").size()

    // Initial position.
    let currentY = 0;

    // Add arrow up (38) and arrow down (40), page up (33), 
    // page down (34) and home (36) and end (35) listeners.
    $(document).on("keydown", function(event) {
        
        let newPosition;

        // Up arrowkey.
        if (event.which === 38) {

            // Specify new position to hop up to, bounded by node collection.
            newPosition = Math.max(
                Math.min(currentY + nodeSpacing, 0),
                -(nNodes - 1) * nodeSpacing);

            // Transition to 'newPosition'.
            scrollNodes(newPosition);
        }

        // Down arrowkey.
        else if (event.which === 40) {
            
            newPosition = Math.max(
                Math.min(currentY - nodeSpacing, 0),
                -(nNodes - 1) * nodeSpacing);

            scrollNodes(newPosition);
        }

        // Page up.
        else if (event.which === 33) {

            newPosition = Math.max(
                Math.min(currentY + 5 * nodeSpacing, 0),
                -(nNodes - 1) * nodeSpacing);

            scrollNodes(newPosition, d3.easeSinOut);
        }

        // Page down.
        else if (event.which === 34) {

            newPosition = Math.max(
                Math.min(currentY - 5 * nodeSpacing, 0),
                -(nNodes - 1) * nodeSpacing);

            scrollNodes(newPosition, d3.easeSinOut);
        }

        // Home.
        else if (event.which === 36) {

            newPosition = 0;

            scrollNodes(newPosition, d3.easeSinOut);
        }

        // End.
        else if (event.which === 35) {

            newPosition = -(nNodes - 1) * nodeSpacing;

            scrollNodes(newPosition, d3.easeSinOut);
        }

        // Any other keypress.
        else {
            return;
        }

        // Update current focused node position.
        currentY = newPosition;
    })

    // Remove node drag behaviour.
    let nullDrag = d3.drag()
        .on("start", null)
        .on("drag", null)
        .on("end", null)

    nullDrag(node);
    

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

    function scrollNodes(pos, easing=d3.easeBounce, duration=500) {
        /*
        Translates node collection to a snap position given by 'pos'.
        */

        console.log(pos);

        d3.select(".everything")
            .transition()
            .ease(easing)
            .duration(duration)
            .attr("transform", "translate(0, " + (pos + height / 2).toString() + ")");
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

    // On window resize, translate nodes to ensure responsiveness.
    $(window).resize(function() {

        // Update current window width.
        width = $(window).width()

        // Compute horizontal padding.
        nodePadding = width / 3;

        // Compute vertical padding.
        let resizedNodeSpacing = radiusFirst + 10000/nodePadding + radiusSecond;

        let newPos = Math.round(currentY / nodeSpacing) * resizedNodeSpacing

        nodeSpacing = resizedNodeSpacing;

        // Translate nodes.
        d3.selectAll(".node")
            .attr("transform", function(d) {
                return "translate("+ width / 10 + ", " 
                + nodeSpacing * d.rank + ")"
            })
        
        // scrollNodes(newPos);

        d3.select(".everything")
            .attr("transform", "translate(0, " + (newPos + height / 2).toString() + ")");

        currentY = newPos;
    })
}

function savePos(node) {

}

function saveFixedPos(node) {

}

function posToRank(pos, nodeSpacing) {
    /*
    Determines node number (equivalent to rank) given a position
    and the node spacing.
    */

    return 
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