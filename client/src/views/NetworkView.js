import React from "react"
import * as d3 from "d3"

import NodePopover from "./NetworkViewPopover"
import PopupModal from "./PopupModal"
import "./NetworkView.css"

import theme from "../Theme"
import dateToColour from '../utils/dateToColour'

export default function NetworkView({ props }) {

  const svgRef = React.useRef(null)
  
  const [popoverAnchorEl, setPopoverAnchorEl] = React.useState(null)
  const [paperData, setPaperData] = React.useState(0)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const { readNodes, handleReadNodeClick } = props
  const { seeds } = props.searchResults

  function handleWindowClick() {
    d3.selectAll("line").transition().duration(300)
      .style("opacity", 1)
    d3.selectAll("circle").transition().duration(300)
      .style("opacity", 1)
    d3.selectAll(".hatch").transition().duration(300)
      .style("opacity", "1")
  }

  React.useEffect(() => {

    const { minDate, maxDate } = props.searchResults.metadata
    const colours = dateToColour(
      props.searchResults.subgraph.nodes, 
      minDate, 
      maxDate, 
      seeds
    )

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
      .force("charge", d3.forceManyBody()
        .strength(-1200))
      .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
      .force("collide", d3.forceCollide()
        .radius(function(_, idx) {
          return props.searchResults.metadata.radii[idx] + 3;
        }))
      .force("link", d3.forceLink().id(function(d) {return d.id}))


    const links = g.append("g")
      .selectAll("line")
      .data(props.searchResults.subgraph.links)
      .enter()
      .append("line")
      .attr("stroke", theme.palette.primary.blackLight)
      .attr("stroke-width", "2.5px")
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
      .attr("fill", function(data, idx) {
        return readNodes.has(data.id) && !seeds.includes(data.id)
          ? theme.palette.secondary.dark
          : colours[idx]
      })
      .attr("stroke", function(_, idx) {
        const lightness = colours[idx].split(",")[2]
        if (lightness && 
          parseFloat(lightness.replace("%", "").replace(" ", "")) >= 90) {
          return "#ddd"
        } else {
          return "#fff"
        }
      })
      .attr("stroke-width", "2.5px")
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
        setPaperData(data)
        setIsModalOpen(true)
        d3.event.stopPropagation()
      })
      .on("contextmenu", function(data, idx) {
        d3.event.preventDefault()
        // console.log(d3.select(this).style("fill"))
        // console.log(theme.palette.secondary.dark)
        const status = handleReadNodeClick(data.id)
        if (!seeds.includes(data.id)) {
          d3.select(this).style("fill",
            status === 'added'
            ? theme.palette.secondary.dark
            : colours[idx]
          )
        }
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

    // the following forces ensure disconnected nodes are forced closer to the center
    simulation
      .force('x', d3.forceX().x(function(d) {
        return 3 * window.innerWidth / 4
      })
        .strength( function(d) {return d.hasCitationEdges ? 0 : 0.5})
      )
      .force('y', d3.forceY().y(function(d) {
        return window.innerHeight / 2
      })
        .strength( function(d) {return d.hasCitationEdges ? 0 : 0.5})
      )

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

  // On `searchQueue` change, manually set node hatch display.
  React.useEffect(() => {
    d3.selectAll(".hatch")
      .style("display", function (d) {
        if (props.searchQueue.includes(d.id)) {
          return "inline"
        } else {
          return "none"
        }
      })
  }, [props.searchQueue])

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
      <PopupModal props={{
        isModalOpen,
        setIsModalOpen,
        selectedPaper: paperData,
        searchQueue: props.searchQueue,
        setSearchQueue: props.setSearchQueue
      }} />
    </svg>
  )
}
