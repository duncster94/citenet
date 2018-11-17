const d3 = require("d3");
const $ = require("jquery");

function d3_layout(graph) {
    /*
    TODO: add documentation.
    */

    const svg = d3.select("#network"),
    width = svg.attr("width"),
    height = svg.attr("height");

    var radius = 10; 

    var simulation = d3.forceSimulation()
        .nodes(graph.nodes);
                                
    var link_force =  d3.forceLink(graph.links)
        .id(function(d) { return d.name; });            
            
    var charge_force = d3.forceManyBody()
        .strength(-300); 
        
    var center_force = d3.forceCenter(width / 2, height / 2);  
                        
    simulation
        .force("charge_force", charge_force)
        .force("center_force", center_force)
        .force("links",link_force)
    ;
            
    //add tick instructions: 
    simulation.on("tick", tickActions);

    //add encompassing group for the zoom 
    var g = svg.append("g")
        .attr("class", "everything");

    //draw lines for the links 
    var link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", 2)
        .style("stroke", "#aaa");        

    //draw circles for the nodes 
    var node = g.append("g")
        .attr("class", "nodes") 
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("r", radius) // Map PageRank radius here.
        .attr("fill", "#666") // Map date colour here.
        .on("click", function(d) {
            // Call modal here.
            console.log('Modal');
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
    
    var vis = svg
        .call(zoom_handler)
        .call(zoom_handler.transform, d3.zoomIdentity
            .scale(0.25)
            .translate(700, 700));


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
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
            
        //update link positions 
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    } 

    return {'node': node, 'is_dragging': is_dragging}
}

module.exports.d3_layout = d3_layout;