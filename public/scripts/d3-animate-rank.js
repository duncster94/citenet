const d3 = require("d3");
const $ = require("jquery");
const createModal = require("./create-modals.js");

function addAnimateRankListener(layoutObj, tips, refinedPapers) {
    /*
    Adds a click listener to the 'animate rank' button.
    */

    $("#animate-rank-button").on("click", function() {

        // Remove node tooltips.
        Object.keys(tips).forEach(function(nodeID) {
            tip = tips[nodeID];
            tip.destroy();
        })

        // Add rank animation functionality.
        animateRank(layoutObj, refinedPapers);
    });
}

function animateRank(layoutObj, refinedPapers) {
    /*
    */

    // $(".modal-button-text").hide();

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

    // Check size of screen to determine if modal size should be
    // modified. For small devices modal is only shown on click/tap,
    // so the original modal size is not modified.
    if (width >= 768) {
        $("#abstract-modal-dialog")
        .css("display", "inline-block")
        .css("position", "fixed")
        .css("right", "2.5vw")
        .css("width", "40vw")

        // Hide modal close button.
        $("#modal-close").hide();
    }

    // Add a line through center of screen (for debugging purposes).
    $(".links").fadeOut(100);
    d3.select("#network")
        .append("image")
        .attr("xlink:href", "images/FocusArrow.svg")
        .attr("height", "15")
        .attr("width", "15")
        .attr("x", "5vw")
        .attr("y", height / 2 - 7.5);

    // Get top two largest radii in order to properly space nodes.
    let topRadii = getTopRadii(node);
    let radiusFirst = topRadii.first;
    let radiusSecond = topRadii.second;

    // Padding between largest two nodes. This determines overall vertical
    // node spacing on the screen.
    let nodePadding = width / 3;

    // Minimum vertical node padding.
    let minVerticalPadding = 50;

    // Spacing between nodes.
    let nodeSpacing = radiusFirst + 
        Math.max(10000/nodePadding, minVerticalPadding) + radiusSecond;

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

    // Object to track rank to node.
    let rankToNode = {};

    // Track currently focused rank.
    let currentRank = 0;

    // Translate each node based on rank.
    d3.selectAll(".node")
        .transition()
        .ease(d3.easeElastic)
        .duration(1600)
        .attr("transform", function(d) {

            // Update 'rankToNode'.
            rankToNode[d.rank] = d;

            return "translate("+ leftPadding + ", " 
            + nodeSpacing * d.rank + ")"
        })

    // Set initial modal.
    updateModal();

    // Add paper details to right of each node.
    node.append("foreignObject")
        .attr("height", 1)
        .attr("width", "100%")
        .append("xhtml:div")
        .attr("class", "animate-rank-details")
        .html(function(d) {

            // Create author string.
            let authorString = parseAuthors(d.authors, width);

            // NOTE: may need to use 'xhtml:div' instead of 'div'.
            let htmlString = 
                "<div class=animate-rank-details-title>" +
                    d.title +
                "</div>" + 
                "<div class=animate-rank-details-authors>" +
                    authorString +
                "</div>"
            return htmlString
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
    
    node.on("click", function(d) {
        /*
        On node click, snap to clicked node.
        */

        // Get node position to snap to.
        let pos = -d.rank * nodeSpacing

        // Update current y position.
        currentY = pos;

        // Snap to position.
        scrollNodes(pos);

        // If screen is small, display modal.
        if (width < 767.98) {

            let modal = $("#abstract-modal-dialog");
            modal.removeClass("fade-out");
            
            // Modify modal information to clicked node.
            createModal.createModal(d, refinedPapers);
            
            modal.addClass("fade-in");

            modal.show();

        }
    });

    // Add scroll listener.
    d3.select("#network")
        .call(d3.zoom()).on("wheel.zoom", function() {
        /*
        Translates node collection based on scroll strength. 
        */

        // Removes timer on new scroll event.
        clearTimeout(timer);

        // Get scroll Y delta.
        let deltaY = d3.event.deltaY;

        // Avoid retriggering scroll snapping if the user tries scrolling
        // below minimum or above maximum scroll extent.
        if ((currentY === 0 && deltaY < 0) || 
            (currentY + ((nNodes - 1) * nodeSpacing)) < 0.001 && deltaY > 0) {
            return
        }

        // Specify new position to scroll to, bounded by node collection.
        let newPosition = Math.max(Math.min(currentY - deltaY, 0),
            -(nNodes - 1) * nodeSpacing);

        // Scroll nodes.
        d3.select(".everything")
            .transition()
            .ease(d3.easeLinear)
            .duration(50)
            .attr("transform", "translate(0, " + 
                (newPosition + height / 2).toString() + ")")

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
        let endTime;

        // If scrolling goes past top and bottom boundaries, snap to
        // node immediately. This is to avoid waiting for the end of
        // an intertial scroll to show modal.
        if (pos === 0 || (pos + ((nNodes - 1) * nodeSpacing)) < 0.001) {
            endTime = 0;
        } else {
            endTime = 150;
        }

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

        // Translate node collection to snap point.
        d3.select(".everything")
            .transition()
            .ease(easing)
            .duration(duration)
            .attr("transform", "translate(0, " + 
                (pos + height / 2).toString() + ")");

        // Update current rank position.
        currentRank = Math.round(Math.abs(pos / nodeSpacing));

        // Change displayed modal.
        updateModal();
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
        width = $(window).width();

        // Compute horizontal padding.
        nodePadding = width / 3;

        // Compute vertical padding.
        let resizedNodeSpacing = radiusFirst + 
            Math.max(10000/nodePadding, minVerticalPadding) + radiusSecond;

        // Determine new y position based on 'resizedNodeSpacing'.
        let newPos = Math.round(currentY / nodeSpacing) * resizedNodeSpacing

        // Update 'nodeSpacing'.
        nodeSpacing = resizedNodeSpacing;

        // Translate nodes.
        d3.selectAll(".node")
            .attr("transform", function(d) {
                return "translate("+ width / 10 + ", " 
                + nodeSpacing * d.rank + ")"
            })
        
        // Translate node collection to keep selected node centered.
        d3.select(".everything")
            .attr("transform", "translate(0, " + (newPos + height / 2).toString() + ")");

            
        // Update author string for each node to compensate for new screen size.
        d3.selectAll(".animate-rank-details")
            .html(function(d) {

                // Create author string.
                let authorString = parseAuthors(d.authors, width);

                // NOTE: may need to use 'xhtml:div' instead of 'div'.
                let htmlString = 
                    "<div class=animate-rank-details-title>" +
                        d.title +
                    "</div>" + 
                    "<div class=animate-rank-details-authors>" +
                        authorString +
                    "</div>"
                return htmlString
            })

        // Update modal size, position and display.
        if (width >= 768) {
            $("#abstract-modal-dialog")
                .css("display", "inline-block")
                .css("position", "fixed")
                .css("right", "2.5vw")
                .css("width", "40vw")

            // Hide modal close button.
            $("#modal-close").hide();

            updateModal();

        } else {
            $("#abstract-modal-dialog")
                .css("display", "none")
                .css("width", "auto")

            // Show modal close button.
            $("#modal-close").show();
        }

        // Update y position.
        currentY = newPos;
    })

    // Add a listener to modal to allow retriggering of bounce animation.
    $("#abstract-modal-dialog").on("animationend", function() {
        $("#abstract-modal-dialog").removeClass("bounce");
    })

    function updateModal() {
        /*
        Modifies the content of the modal to display currently focused
        node paper information.
        */

       let modal = $("#abstract-modal-dialog");

        // If screen width is below tablet width, do not show modal.
        if (width < 767.98) {

            modal.hide();

        } else {

            // Get current node.
            let currNode = rankToNode[currentRank];

            modal.removeClass("fade-in");
            modal.removeClass("fade-out");

            // Add bounce animation to modal.
            modal.addClass("bounce");

            // Replace modal fields with 'currNode' fields.
            createModal.createModal(currNode, refinedPapers);
        }
    }
}

function savePos(node) {

}

function saveFixedPos(node) {

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

function parseAuthors(authorArr, viewWidth) {
    /*
    Creates an author list string, given an array of authors 
    and the viewport width.
    */

    let authorString;

    if (authorArr.length === 1) {

        authorString = authorArr[0].LastName;

        return authorString
    }

    if (viewWidth < 767.98) {
            
        if (authorArr.length === 2) {
            authorString = authorArr[0].LastName + 
                " and " + authorArr[1].LastName;
        } else {
            authorString = authorArr[0].LastName + 
                ", ..., " + authorArr[authorArr.length-1].LastName;
        }

    } else if (viewWidth < 991.98) {

        if (authorArr.length === 2) {
            authorString = authorArr[0].LastName + 
                " and " + authorArr[1].LastName;
        } else if (authorArr.length <= 6) {
            authorString = "";
            authorArr.forEach(function(author) {
                authorString += author.LastName + ", "
            });
            authorString = authorString.slice(0, -2);
        } else {
            authorString = authorArr[0].LastName + ", " +
                authorArr[1].LastName + ", " + authorArr[2].LastName +
                ", ..., " + authorArr[authorArr.length-3].LastName + ", " +
                authorArr[authorArr.length-2].LastName + ", " + 
                authorArr[authorArr.length-1].LastName;
        }

    } else {

        if (authorArr.length === 2) {
            authorString = authorArr[0].LastName + 
                " and " + authorArr[1].LastName;
        } else {
            authorString = "";
            authorArr.forEach(function(author) {
                authorString += author.LastName + ", "
            });
            authorString = authorString.slice(0, -2);
        }
    }
    
    return authorString;
}

module.exports.addAnimateRankListener = addAnimateRankListener