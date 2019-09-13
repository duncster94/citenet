import React from "react"
import * as d3 from "d3"

import NodePopover from "./NetworkViewPopover"
import NodeModal from "./NetworkViewModal"
import "./NetworkView.css"

export default function NetworkView({ props }) {

  const svgRef = React.useRef(null)
  
  const [popoverAnchorEl, setPopoverAnchorEl] = React.useState(null)
  const [paperData, setPaperData] = React.useState(0)

  const [isModalOpen, setIsModalOpen] = React.useState(false)

  function handleWindowClick() {
    d3.selectAll("line").transition().duration(300)
      .style("opacity", 1)
    d3.selectAll("circle").transition().duration(300)
      .style("opacity", 1)
  }

  React.useEffect(() => {

    const svg = d3.select(svgRef.current)

    const simulation = d3.forceSimulation()
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
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

    const circles = nodes.append("circle")
      .attr("r", 10)
      .on("mouseover", function(data) {
        setPaperData(data)
        setPopoverAnchorEl(this)

        d3.selectAll("line").transition().duration(300)
          .style("opacity", function(other) {
            return other.source === data || other.target === data ? 1 : 0.05
          })
        d3.selectAll("circle").transition().duration(300)
          .style("opacity", function(other) {
            console.log(data, other)
            return neighboring(data, other) ? 1 : 0.15
          })
      })
      .on("mouseout", () => {
        setPopoverAnchorEl(null)
      })
      .on("click", function(data) {
        console.log(data)
        setIsModalOpen(true)
        d3.event.stopPropagation()
      })
    
    nodes
      .call(d3.drag()
        .on("start", dragStart)
        .on("drag", dragging)
        .on("end", dragEnd))

    simulation.nodes(props.subgraph.nodes)
    simulation.force("link").links(props.subgraph.links)

    simulation.on("tick", () => {
      console.log('tick')
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

    const linkedByIndex = {}

    links.each(function(d) {
      linkedByIndex[d.source.index + "," + d.target.index] = 1
      linkedByIndex[d.target.index + "," + d.source.index] = 1
    })

    function neighboring(a, b) {
      return a.index == b.index || linkedByIndex[a.index + "," + b.index]
    }

    function dragStart(d) {
      setPopoverAnchorEl(null)
      d3.event.sourceEvent.stopPropagation();
      if (!d3.event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }
  
    function dragging(d, index) {
      setPopoverAnchorEl(null)
      d.fx = d3.event.x
      d.fy = d3.event.y
    }
  
    function dragEnd(d) {
      setPopoverAnchorEl(null)
      if (!d3.event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

  }, [])

  return (
    <svg
      className="network-root"
      ref={svgRef}
      onClick={handleWindowClick}
    >
      <NodePopover 
        props={{
          popoverAnchorEl,
          data: paperData
        }}
      />
      <NodeModal props={{
        isModalOpen,
        setIsModalOpen,
        data: paperData
      }} />
    </svg>
  )
}
