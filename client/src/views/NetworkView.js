import React from "react"
import * as d3 from "d3"
import ResizeObserver from "@juggle/resize-observer"

import Grid from "@material-ui/core/Grid"

import Popover from "@material-ui/core/Popover"
import Typography from "@material-ui/core/Typography"

import Button from "@material-ui/core/Button"
import ButtonGroup from "@material-ui/core/ButtonGroup"

import "./NetworkView.css"

export default function NetworkView({ props }) {

  const svgRef = React.useRef(null)
  const [popoverAnchorEls, setPopoverAnchorEls] = React.useState(() => {
    return props.subgraph.nodes.map(function(node) {return null})
  })
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(() => {
    return props.subgraph.nodes.map(function(node) {return false})
  })

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
      .on("mouseover", function(_, index) {
        setIsPopoverOpen(function() {
          const newIsPopoverOpen = [...isPopoverOpen]
          newIsPopoverOpen[index] = true
          return newIsPopoverOpen
        })
      })
      .on("mouseout", function(_, index) {
        setIsPopoverOpen(function() {
          const newIsPopoverOpen = [...isPopoverOpen]
          newIsPopoverOpen[index] = false
          return newIsPopoverOpen
        })
      })
      .on("click", function(data) {
        console.log(data)
      })
    
    nodes
      .call(d3.drag()
        .on("start", dragStart)
        .on("drag", dragging)
        .on("end", dragEnd))

    let circleEls = []
    circles
      .each(function(data) {
        circleEls.push(this)
      })
    setPopoverAnchorEls(circleEls)

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
      d3.event.sourceEvent.stopPropagation();
      if (!d3.event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }
  
    function dragging(d, index) {
      setIsPopoverOpen(function() {
        const newIsPopoverOpen = [...isPopoverOpen]
        newIsPopoverOpen[index] = false
        return newIsPopoverOpen
      })
      d.fx = d3.event.x
      d.fy = d3.event.y
    }
  
    function dragEnd(d) {
      if (!d3.event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    const resizeObserver = new ResizeObserver(() => {
      // May want to add debouncing in the future.
      simulation
        .force("center")
          .x(window.innerWidth / 2)
          .y(window.innerHeight / 2)

      simulation.alpha(0.3).restart()
    })

    resizeObserver.observe(svgRef.current)

  }, [])

  return (
    <svg
      className="network-root"
      ref={svgRef}
    >
      {popoverAnchorEls.map((anchorEl, index) => {
        const popoverProps = {
          anchorEl,
          data: props.subgraph.nodes[index],
          isOpen: isPopoverOpen[index]
        }
        return <NodePopover props={popoverProps} key={`popover-${index}`}/>
      })}
    </svg>
  )
}

// `React.memo` is implementing the functional equivalent
// of a `React.PureComponent`. Here `NodePopover` only 
// rerenders if the actual value of the `isOpen` prop changes.
const NodePopover = React.memo(({ props }) => {

  console.log('rednered')

  return (
    <Popover
      className="network-node-popover"
      open={props.isOpen}
      anchorEl={props.anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center"
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center"
      }}
      disableRestoreFocus
    >
      <Grid
        className="network-node-popover-grid"
        direction="column"
        alignItems="center"
        container
      >
        <Grid item xs>
          <Typography
            align="center"
            color="textPrimary"
            variant="body1"
            gutterBottom
          >
            {props.data.title}
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography 
            align="center" 
            color="textSecondary" 
            variant="body2"
            gutterBottom
          >
            authors (need to format)
          </Typography>
        </Grid>

        <Grid item xs>
          <ButtonGroup size="small" aria-label="small outlined button group">
            <Button>Modal</Button>
            <Button>Paper View</Button>
          </ButtonGroup>
        </Grid>

      </Grid>
    </Popover>
  )
}, (prevProps, nextProps) => {
  // Equivalent to `componentShouldUpdate`. `React.memo` makes a
  // shallow comparison to check if `isOpen` prop has changed and
  // prevents unnecessary rendering.
  return prevProps.props.isOpen === nextProps.props.isOpen
})