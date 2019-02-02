const d3 = require("d3");
const $ = require("jquery");

function d3Layout(response, createModal, refinedPapers) {
    /*
    TODO: add documentation.
    */

    // Define display colours.
    let linkColour = "#ccc";
    let nodeStrokeColour = "#fff";
    let linkStrokeWidth = "5px";
    let nodeStrokeWidth = "5px";
    let nodeStrokeWidthNum = 5;

    // Specify a variable that is set on a click event and
    // disabled on a double click event. This ensures the
    // click listener is not triggered on a doubleclick.
    let isSingleClick = false;

    // Get subgraph from response.
    let graph = response.subgraph;

    // Get seeds from response.
    let seeds = response.seeds;

    // Get minimum and maximum publication years from "graph".
    let dates = [];
    graph.nodes.forEach(function(node) {

        let pub_year = node.pub_date.Year;

        // Make sure publication year is defined.
        if (pub_year) {
            dates.push(node.pub_date.Year);
        }
    });
    let min_date = Math.min(...dates);
    let max_date = Math.max(...dates);

    // Get SVG canvas to draw layout on.
    const svg = d3.select("#network");

    // Get SVG width and height (which is window width and height).
    let width = $("#network").width();
    let height = $("#network").height();

    // Assign width and height attributes to SVG canvas.
    // preserveAspectRatio allows for responsive sizing of canvas.
    // svg.attr("viewBox", "0 0 " + width + " " + height)
        // .attr("preserveAspectRatio", "xMidYMid meet");

    // Define the D3 layout object.
    const simulation = d3.forceSimulation()
        .nodes(graph.nodes);

    // Define link physics.
    const link_force = d3.forceLink(graph.links)
        .id(function(d) {
            return d.id;
        });

    // Define node charge physics.
    const charge_force = d3.forceManyBody()
        .strength(-200);

    // Define attrictive center to keep graph in one place.
    const center_force = d3.forceCenter(width / 2, height / 2);
    // const center_force = d3.forceCenter(0, 0);

    // Define collision physics between nodes to avoid overlaps.
    const collision_force = d3.forceCollide()
        .radius(function(d) {
            return score_to_radius(d) + 3;
        })

    // Add forces and tick behaviour to force simulation.
    simulation
        .force("collide", collision_force)
        .force("charge", charge_force)
        .force("center", center_force)
        .force("links", link_force)
        .on("tick", tickActions)

    //add encompassing group for the zoom
    var g = svg.append("g")
        .attr("class", "everything")
        .attr("transition", "translate 3s ease");

    //draw lines for the links
    var link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", linkStrokeWidth)
        .style("stroke", linkColour);

    // Add a group for each node object.
    let node = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("g")
        .attr("id", function(d) {
            return `group_${d.id}`;
        })
        .attr("class", "node")
        .attr("cx", 0)
        .attr("cy", 0)
        .on("click", function(d) {

            // Set click variable to true.
            isSingleClick = true;

            // Set a timeout. If the click event is still a
            // single click at the end of the timeout, create
            // the modal.
            setTimeout(function() {
                if (isSingleClick) {
                    createModal.createModal(d, refinedPapers)
                    $("#abstract-modal-dialog").removeClass("fade-out");
                    $("#abstract-modal-dialog").addClass("fade-in");
                    $("#abstract-modal-dialog").show();
                }
            }, 300)
        })
        .on("dblclick", function(d) {

            // Set click variable to false.
            isSingleClick = false;

            // Set fixed positions of node to null.
            d.fx = null;
            d.fy = null;
        })

    // Draw circles representing the nodes.
    node.append("circle")
        .attr("id", function(d) {
            return `circle_${d.id}`;
        })
        .attr("r", function(d) {
            return score_to_radius(d);
        })
        .attr("fill", function(d) {
            return date_to_colour(d, min_date, max_date, seeds);
        })
        .attr("stroke", nodeStrokeColour)
        .attr("stroke-width", nodeStrokeWidth);

    // Add a clip path for any overlaid images so they are clipped
    // to the circle.
    node.append("clipPath")
        .attr("id", function(d) {
            return `clip_${d.id}`;
        })
        .append("circle")
        .attr("r", function(d) {
            return score_to_radius(d) - nodeStrokeWidthNum / 2;
        })

    // Add image overlay for refined search papers.
    node.append("image")
        .attr("xlink:href", "images/hatch.svg")
        .attr("pointer-events", "none") // Won't be hoverable/clickable
        .attr("height", "150")
        .attr("width", "150")
        .attr("x", function(d) {
            return -75;
        })
        .attr("y", function(d) {
            return -75;
        })
        .attr("clip-path", function(d) {
            return `url(#clip_${d.id})`;
        })
        .attr("id", function(d) {
            return `overlay_${d.id}`;
        })
        .style("display", function(d) {

            // Check if node is in refine list, if so,
            // display overlay.
            if (seeds.includes(d.id)) {
                return "inline";
            } else {
                return "none";
            }
        })

    // Object specifying whether dragging is currently happening. This
    // gets passed to "create-tooltips" and ensures tooltips do not
    // display during drag.
    let isDragging = {
        "state": false
    };

    //add drag capabilities
    let dragHandler = d3.drag()
        .on("start", drag_start)
        .on("drag", drag_drag)
        .on("end", drag_end);

    dragHandler(node);

    //add zoom capabilities
    let zoomHandler = d3.zoom()
        .on("zoom", zoom_actions)
        .scaleExtent([0.1, 3])

    // zoomHandler(svg);

    let vis = svg
        .call(zoomHandler)
        .call(zoomHandler.transform, d3.zoomIdentity
            .translate(width / 4, height / 4)
            .scale(0.5))
            .on("dblclick.zoom", null); // Disable doubleclick zooming.

    /** Functions **/

    //Drag functions
    //d is the node
    function drag_start(d) {
        isDragging.state = true;
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    //make sure you can't drag the circle outside the box
    function drag_drag(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function drag_end(d) {
        isDragging.state = false;
        if (!d3.event.active) simulation.alphaTarget(0);
        // d.fx = null;
        // d.fy = null;

        // Set fixed position of node to where user dragged it.
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    //Zoom functions
    function zoom_actions() {
        g.attr("transform", d3.event.transform);
    }

    function tickActions() {
        // Update group (circle and image) positions for each simulation tick.
        node
            .attr("transform", function(d) {
                return `translate(${d.x.toString()}, ${d.y.toString()})`;
            })

        // Update link positions for each simulation tick.
        link
            .attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });
    }

    return {
        "node": node,
        "linkForce": link_force,
        "chargeForce": charge_force,
        "centerForce": center_force,
        "tickActions": tickActions,
        "isDragging": isDragging,
        "simulation": simulation,
        "zoomHandler": zoomHandler,
        "dragHandler": dragHandler
    };
}

function score_to_radius(node) {
    /*
    Given a node, take its score and map it to a radius.
    */

    let radius = 100 * Math.pow(node.score, 1 / 3);

    return radius;
}

function date_to_colour(node, D_min, D_max, seeds) {
    /*
    Given a node, map the appropriate colour.
    */

    // If the node is a seed node, colour it differently.
    if (seeds.includes(node.id.toString())) {
        return "#f00";
    }

    // Get publication year.
    let year = node.pub_date.Year;

    // If publication year is not available, set node colour to
    // grey.
    if (!year) {
        return "#ccc"
    }

    // Define minimum and maximum lightness.
    L_min = 50
    L_max = 100

    // Get lightness of node colour based on date.
    let m = (L_max - L_min) / (D_min - D_max);
    let b = L_max - m * D_min;

    let lightness = m * year + b;

    let colour = `hsla(41,100%, ${lightness.toString()}%,1)`;

    return colour;
}

module.exports.d3Layout = d3Layout;