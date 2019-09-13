import React from "react"
import * as d3 from "d3"

import Grid from "@material-ui/core/Grid"

import { makeStyles } from "@material-ui/core/styles"
import { Popper } from "@material-ui/core"
import { Paper } from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import Grow from "@material-ui/core/Grow"

import { CSSTransition } from "react-transition-group"

import "./NetworkView.css"

export default function NetworkView({ props }) {

  const svgRef = React.useRef(null)
  const [popoverAnchorEl, setPopoverAnchorEl] = React.useState(null)
  const [popoverPaperData, setPopoverPaperData] = React.useState(0)

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
        setPopoverPaperData(data)
        setPopoverAnchorEl(this)
      })
      .on("mouseout", () => {
        setPopoverAnchorEl(null)
      })
      .on("click", function(data) {
        console.log(data)
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
    >
      <NodePopover 
        props={{
          popoverAnchorEl,
          data: popoverPaperData
        }}
      />
    </svg>
  )
}


function NodePopover({ props }) {

  const [arrowRef, setArrowRef] = React.useState(null)
  const isOpen = Boolean(props.popoverAnchorEl)

  return (
    <CSSTransition 
      in={isOpen} 
      timeout={350} 
      classNames="popper-transition"
      unmountOnExit
    >
    <Popper
      className="network-node-popover"
      // className="popper"
      className={useStyles().popper}
      open={true}
      anchorEl={props.popoverAnchorEl}
      placement="top"
      // disablePortal={false}
      modifiers={{
            arrow: {
              enabled: true,
              element: arrowRef
          }
        }}
    > 
      <Grow timeout={350} in={isOpen}>
      <Paper>
      <span className={useStyles().arrow} ref={setArrowRef}/>
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

        </Grid>
      </Paper>
      </Grow>
    </Popper>
      </CSSTransition>
  )
}


const useStyles = makeStyles(theme => ({
  popper: {
    zIndex: 1,
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${theme.palette.background.paper} transparent`,
      },
    },
    '&[x-placement*="top"] $arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '1em 1em 0 1em',
        borderColor: `${theme.palette.background.paper} transparent transparent transparent`,
      },
    },
    '&[x-placement*="right"] $arrow': {
      left: 0,
      marginLeft: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: `transparent ${theme.palette.background.paper} transparent transparent`,
      },
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: `transparent transparent transparent ${theme.palette.background.paper}`,
      },
    },
  },
  arrow: {
    position: 'absolute',
    fontSize: 7,
    width: '3em',
    height: '3em',
    pointerEvents: "none",
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    },
  },
}))