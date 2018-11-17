const d3 = require("d3");

function drag_zoom(node) {

    const svg = d3.select("#network")

    //add drag capabilities  
    var drag_handler = d3.drag()
        .on("start", drag_start)
        .on("drag", drag_drag)
        .on("end", drag_end);	
        
    drag_handler(node);

    //add zoom capabilities 
    var zoom_handler = d3.zoom()
        .on("zoom", zoom_actions)
        .scaleExtent([0.1, 3]);

    zoom_handler(svg);
    
    var vis = svg
        .call(zoom_handler)
        .call(zoom_handler.transform, d3.zoomIdentity
            .scale(0.25)
            .translate(700, 700));

    //Drag functions 
    function drag_start(d) {
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
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        }
    
        //Zoom functions 
        function zoom_actions(){
            g.attr("transform", d3.event.transform)
        }

}

module.exports.drag_zoom = drag_zoom;