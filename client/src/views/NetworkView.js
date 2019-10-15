import React from "react"
import * as d3 from "d3"

import NodePopover from "./NetworkViewPopover"
import NodeModal from "./NetworkViewModal"
import "./NetworkView.css"


export default function NetworkView({ props }) {

  console.log(props.searchQueue)

  const svgRef = React.useRef(null)
  
  const [popoverAnchorEl, setPopoverAnchorEl] = React.useState(null)
  const [paperData, setPaperData] = React.useState(0)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  function handleWindowClick() {
    d3.selectAll("line").transition().duration(300)
      .style("opacity", 1)
    d3.selectAll("circle").transition().duration(300)
      .style("opacity", 1)
    d3.selectAll(".hatch").transition().duration(300)
      .style("opacity", "1")
  }

  React.useEffect(() => {

    const svg = d3.select(svgRef.current)
    const g = svg.append("g") // Group to hold elements

    // Add zoom capabilities
    let zoomHandler = d3.zoom()
      .on("zoom", () => {
        g.attr("transform", d3.event.transform)
      })
      .scaleExtent([0.1, 3])

    svg
      .call(zoomHandler)
      .call(zoomHandler.transform, d3.zoomIdentity
        .translate(window.innerWidth / 6, window.innerHeight / 6)
        .scale(2/3))
      // .on("dblclick.zoom", null) // Uncomment to disable doubleclick zooming.

    // Add an arrow definition to the svg
    g.append("svg:defs").selectAll("marker")
      .data(["end"])
      .enter().append("svg:marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 4)
      .attr("markerHeight", 5)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#000")
      .style("stroke", "none")

    const simulation = d3.forceSimulation()
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
      .force("collide", d3.forceCollide()
        .radius(function(_, idx) {
            return props.searchResults.metadata.radii[idx] + 3;
        }))
      .force("link", d3.forceLink().id(function(d) {return d.id}))

    const links = g.append("g")
      .attr("class", "network-links")
      .selectAll("line")
      .data(props.searchResults.subgraph.links)
      .enter()
      .append("line")
      // .attr("marker-end", "url(#arrowhead)")

    const nodes = g.append("g")
      .attr("class", "network-nodes")
      .selectAll("g")
      .data(props.searchResults.subgraph.nodes)
      .enter()
      .append("g")

    // Define timeout for hover action which prevents overeager
    // popover display and neighbour focusing. 
    let hoverTimeout

    const circles = nodes.append("circle")
      .attr("r", function(_, idx) {
        return props.searchResults.metadata.radii[idx]
      })
      .attr("fill", function(_, idx) {
        return props.searchResults.metadata.colours[idx]
      })
      .attr("stroke", "#222")
      .attr("stroke-width", "2px")
      .on("mouseover", function(data) {

        hoverTimeout = setTimeout(() => {

          setPaperData(data)
          setPopoverAnchorEl(this)

          d3.selectAll("line").transition().duration(300)
            .style("opacity", function(other) {
              return other.source === data || other.target === data ? 1 : 0.05
            })
          d3.selectAll("circle").transition().duration(300)
            .style("opacity", function(other) {
              return neighboring(data, other) ? 1 : 0.15
            })
          
          d3.selectAll(".hatch").transition().duration(300)
            .style("opacity", function(other) {
              return neighboring(data, other) ? "1" : "0.25"
            })

        }, 200)
      })
      .on("mouseout", () => {
        setPopoverAnchorEl(null)
        clearTimeout(hoverTimeout)
      })
      .on("click", function(data) {
        setIsModalOpen(true)
        d3.event.stopPropagation()
      })

    // Add a clip path for any overlaid images so they are clipped
    // to the circle.
    nodes.append("clipPath")
      .attr("id", function (d) {
        return `clip_${d.id}`
      })
      .append("circle")
      .attr("r", function (_, idx) {
        return props.searchResults.metadata.radii[idx] - 1
      })

    // Add image overlay for refined search papers.
    nodes.append("svg:image")
      .attr("class", "hatch")
      .attr("xlink:href", "/hatch.svg") // `/` references `public` 
      .attr("pointer-events", "none") // Won't be hoverable/clickable
      .attr("height", "150")
      .attr("width", "150")
      // .attr("opacity", "0.5")
      .attr("x", function (d) {
        return -75;
      })
      .attr("y", function (d) {
        return -75;
      })
      .attr("clip-path", function (d) {
        return `url(#clip_${d.id})`;
      })
      .attr("id", function (d) {
        return `overlay_${d.id}`;
      })
      .style("display", function (d) {

        // Check if node is in search queue list, if so,
        // display overlay.
        if (props.searchQueue.includes(d.id)) {
          return "inline"
        } else {
          return "none"
        }
      })

    nodes
      .call(d3.drag()
        .on("start", dragStart)
        .on("drag", dragging)
        .on("end", dragEnd))

    simulation.nodes(props.searchResults.subgraph.nodes)
    simulation.force("link").links(props.searchResults.subgraph.links)

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

    const linkedByIndex = {}

    links.each(function(d) {
      linkedByIndex[d.source.index + "," + d.target.index] = true
      linkedByIndex[d.target.index + "," + d.source.index] = true
    })

    function neighboring(a, b) {
      return a.index === b.index || linkedByIndex[a.index + "," + b.index]
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
