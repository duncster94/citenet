const d3 = require("d3");
const $ = require("jquery");

function d3_layout(response, create_modal) {
    /*
    TODO: add documentation.
    */

    // Define display colours.
    let link_colour = "#ccc";
    let node_stroke_colour = "#888";

    // Get subgraph from response.
    let graph = response.subgraph;

    // Get seeds from response.
    let seeds = response.seeds;

    // Get minimum and maximum publication years from 'graph'.
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

    console.log('mindate', min_date, 'maxdate', max_date);

    // Get SVG canvas to draw layout on.
    const svg = d3.select("#network");

    // Get SVG width and height (which is window width and height).
    let width = $("#network").width();
    let height = $("#network").height();

    // Assign width and height attributes to SVG canvas.
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Define the D3 layout object.
    const simulation = d3.forceSimulation()
        .nodes(graph.nodes);
                                
    // Define link physics.
    const link_force =  d3.forceLink(graph.links)
        .id(function(d) { return d.id; });            
            
    // Define node charge physics.
    const charge_force = d3.forceManyBody()
        .strength(-200); 
        
    // Define attrictive center to keep graph in one place.
    const center_force = d3.forceCenter(width / 2, height / 2);

    // Define collision physics between nodes to avoid overlaps.
    const collision_force = d3.forceCollide()
        .radius(function(d) { 
            return score_to_radius(d) + 3; 
        })
       
    // Add forces and tick behaviour to force simulation.
    simulation
        .force("collide", collision_force)
        .force("charge_force", charge_force)
        .force("center_force", center_force)
        .force("links", link_force)
        .on("tick", tickActions)

    //add encompassing group for the zoom 
    var g = svg.append("g")
        .attr("class", "everything");

    //draw lines for the links 
    var link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", "5px")
        .style("stroke", link_colour);        

    //draw circles for the nodes 
    var node = g.append("g")
        .attr("class", "nodes") 
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("id", function(d) {
            return d.id;
        })
        .attr("r", function(d) {
            return score_to_radius(d);
        })
        .attr("fill", function(d) {
            return date_to_colour(d, min_date, max_date, seeds);
        }) // Map date colour here.
        .attr("stroke", node_stroke_colour)
        .attr("stroke-width", "5px")
        .on("click", function(d) {
            // Call modal here.
            create_modal.create_modal(d);

        })

    // Object specifying whether dragging is currently happening. This
    // gets passed to 'create-tooltips' and ensures tooltips do not
    // display during drag.
    let is_dragging = {'state': false};

    //add drag capabilities  
    var drag_handler = d3.drag()
        .on("start", drag_start)
        .on("drag", drag_drag)
        .on("end", drag_end);	
        
    drag_handler(node);

    //add zoom capabilities 
    var zoom_handler = d3.zoom()
        .on("zoom", zoom_actions)
        .scaleExtent([0.1, 3])

    zoom_handler(svg);
    
    let vis = svg
        .call(zoom_handler)
        .call(zoom_handler.transform, d3.zoomIdentity
            .translate(width / 4, height / 4)
            .scale(0.5))

    /** Functions **/

    //Drag functions 
    //d is the node 
    function drag_start(d) {
        is_dragging.state = true;
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
        is_dragging.state = false;
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    //Zoom functions 
    function zoom_actions(){
        g.attr("transform", d3.event.transform);
    }

    function tickActions() {
        //update circle positions each tick of the simulation 
        node
            .attr("cx", function(d) {return d.x; })
            .attr("cy", function(d) {return d.y; });
            
        //update link positions 
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    } 

    return {'node': node, 'is_dragging': is_dragging, 'simulation': simulation}
}

function score_to_radius(node) {
    /*
    Given a node, take its score and map it to a radius.
    */

    let radius = 100 * Math.pow(node.score, 1/3);

    return radius;
}

function date_to_colour(node, D_min, D_max, seeds) {
    /*
    Given a node, map the appropriate colour.
    */

    // If the node is a seed node, colour it differently.
    if (seeds.includes(node.id.toString())) {
        return '#f00'
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

    let colour = 'hsla(41,100%,' + lightness.toString() + '%,1)';

    return colour;
}

module.exports.d3_layout = d3_layout;