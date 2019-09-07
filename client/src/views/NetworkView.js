import React from "react"
import * as d3 from "d3"

import "./NetworkView.css"

export default function NetworkView({ props }) {

  const svgRef = React.useRef(null)
  const width = window.innerWidth, height = window.innerHeight

  function onResize() {
    // debounce then
    return window.innerWidth, window.innterHeight
  }

  React.useEffect(() => {

    const svg = d3.select(svgRef.current)

    const simulation = d3.forceSimulation()
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", d3.forceLink().id(function(d) {return d.id}))

    const links = svg.append("g")
      .attr("class", "network-links")
      .selectAll("line")
      .data(props.subgraph.links)
      .enter()
      .append("line")

    const nodes = svg.append("g")
      .attr("class", "network-nodes")
      .selectAll("g")
      .data(props.subgraph.nodes)
      .enter()
      .append("g")
      .append("circle")
      .attr("r", 10)
      .call(d3.drag()
        .on("start", dragStart)
        .on("drag", dragging)
        .on("end", dragEnd))

    simulation.nodes(props.subgraph.nodes)
    simulation.force("link").links(props.subgraph.links)

    simulation.on("tick", () => {
      links
        .attr("x1", function(d) {return d.source.x})
        .attr("y1", function(d) {return d.source.y})
        .attr("x2", function(d) {return d.target.x})
        .attr("y2", function(d) {return d.target.y})
      
      nodes
        .attr("transform", function(d) {
          return `translate(${d.x},${d.y})`
        })
    })

    function dragStart(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }
  
    function dragging(d) {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }
  
    function dragEnd(d) {
      if (!d3.event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

  }, [])

  return (
    <svg
      className="network-root"
      ref={svgRef}
    >
    </svg>
  )
}
