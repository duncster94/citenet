import React from "react"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { makeStyles, useTheme } from "@material-ui/core/styles"
import { debounce } from 'debounce'

import Icon from "@mdi/react"
import {
  mdiChevronRight,
} from "@mdi/js"

import ViewDialog from "./ViewDialog"
import PopupModal from "./PopupModal"
import dateToColour from '../utils/dateToColour'
import "./RankView.css"

const useStyles = makeStyles(theme => ({
  nodeDialog: {
    overflow: "hidden"
  },
  dialogGrid: {
    [theme.breakpoints.down("xs")]: {
      display: "none"
    }
  },
  popupModal: {
    [theme.breakpoints.up("md")]: {
      display: "none"
    }
  },
  lhsText: {
    display: "block",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden"
  },
  lhsAuthors: {
    display: "block",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden"
  },
  selectedPaperArrow: {
    position: "absolute",
    top: "calc(50vh - 10px)",
    left: "10px"
  }
}))

export default function RankView({ props }) {

  const classes = useStyles()
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.down("xs"))
  const [selectedPaper, setSelectedPaper] = React.useState(props.searchResults.subgraph.nodes[0])
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const lhsRef = React.useRef(null)
  const paperInfoHeight = 175.0 // height of left-hand side paper info cards
  const maxRadius = Math.max(...props.searchResults.metadata.radii)

  const { minDate, maxDate } = props.searchResults.metadata
  const colours = dateToColour(
    props.searchResults.subgraph.nodes,
    minDate,
    maxDate,
    props.searchQueue
  )

  // Currently no Javascript hooks exist for CSS snap scroll events so
  // for now the `scrollTop` pixel values must be tracked to determine which
  // paper is currently selected.
  const pixelIntervals = {}
  props.searchResults.subgraph.nodes.forEach((node, i) => {
    pixelIntervals[i * paperInfoHeight] = node
  })

  function handleScroll() {

    const position = lhsRef.current.scrollTop
    // determines which paper the center select icon is closest to
    const nearest = Math.floor((position + maxRadius) / paperInfoHeight) * paperInfoHeight

    if (nearest in pixelIntervals) {
      setSelectedPaper(pixelIntervals[nearest])
    }
  }

  const handleNodeClick = interval => e => {
    /* Scrolls LHS paper div to clicked paper.
    */
    e.stopPropagation()
    setSelectedPaper(pixelIntervals[interval])
    lhsRef.current.scrollTo({ top: interval, behavior: "smooth" })

    // media query to detect if modal should be displayed
    if (matches) {
      setIsModalOpen(true)
    }
  }

  React.useEffect(() => {
    /* Detects if the window size is larger than xs and sets
    the popup modal to closed.
    */
    if (!matches) {
      setIsModalOpen(false)
    }
  }, [matches])

  return (
    <React.Fragment>
      <Grid
        container
      >
        <Grid item xs>
          <Icon
            path={mdiChevronRight}
            size={1}
            color="black"
            className={classes.selectedPaperArrow}
          />
          <div
            style={{
              overflowY: "scroll",
              maxHeight: "100vh",
              paddingLeft: "40px",
              transform: 'scaleX(-1)' // ensure scroll bar is on LHS
            }}
            className="lhs-paper-cards"
            onScroll={debounce(handleScroll, 200)}
            ref={lhsRef}
          >
            {props.searchResults.subgraph.nodes.map((node, i) => {
              let marginTop
              let marginBottom
              const halfPaperInfoHeight = paperInfoHeight / 2
              if (i === 0) {
                marginTop = `calc(50vh - ${halfPaperInfoHeight}px)`
                marginBottom = "0vh"
              } else if (i + 1 === props.searchResults.subgraph.nodes.length) {
                marginTop = "0vh"
                marginBottom = `calc(50vh - ${halfPaperInfoHeight}px)`
              } else {
                marginTop = "0vh"
                marginBottom = "0vh"
              }

              // Put darker border around light coloured nodes.
              const lightness = colours[i].split(",")[2]
              let stroke
              if (lightness &&
                parseFloat(lightness.replace("%", "").replace(" ", "")) >= 90) {
                stroke = "#ddd"
              } else {
                stroke = "#fff"
              }
              return (
                <LHSDetails props={{ 
                  maxRadius,
                  paperInfoHeight,
                  node,
                  handleNodeClick,
                  i,
                  marginTop,
                  marginBottom,
                  radius: props.searchResults.metadata.radii[i],
                  colour: colours[i],
                  stroke,
                  inSearchQueue: props.searchQueue.includes(node.id),
                }}/>
              )
            })}
          </div>
        </Grid>

        <Grid item xs className={classes.dialogGrid}>
          <NodeDialog
            props={{
              selectedPaper,
              searchQueue: props.searchQueue,
              setSearchQueue: props.setSearchQueue
            }}
            key={+new Date()}  // unique key needed to retrigger animation
          />
        </Grid>
      </Grid>
      {/* Dialog that pops up on small screens */}
      <PopupModal props={{
        isModalOpen,
        setIsModalOpen,
        selectedPaper,
        searchQueue: props.searchQueue,
        setSearchQueue: props.setSearchQueue
      }} />
    </React.Fragment>
  )
}


function NodeDialog({ props }) {

  const classes = useStyles()

  return (
    <div
      className={classes.nodeDialog}
    // style={{ overflow: "hidden" }}
    >
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              height: "90vh",
              margin: "5vh",
              marginLeft: "2.5vh"
            }}
            className="changed"
          >
            <ViewDialog props={props} />
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

function LHSDetails({ props }) {

  const classes = useStyles()
  const { 
    maxRadius,
    paperInfoHeight,
    node,
    handleNodeClick,
    i,
    marginTop,
    marginBottom,
    radius,
    colour,
    stroke,
    inSearchQueue
  } = props

  return (
    <div
      style={{
        position: "relative",
        height: `${paperInfoHeight}px`,
        marginTop: marginTop,
        marginBottom: marginBottom,
        marginRight: "2.5vh",
        transform: 'scaleX(-1)' // ensure card content is not reversed
      }}
      key={`paper-metadata-${i}`}
    >
      <svg
        height="100%"
        width="100%"
        style={{ position: "absolute" }}
      >
        <circle
          cx={maxRadius + 2}
          cy={(paperInfoHeight / 2) + 2}
          r={radius}
          fill={colour}
          stroke={stroke}
          strokeWidth="2.5px"
          onClick={handleNodeClick(i * paperInfoHeight)}
        />
        <clipPath id={`clip_${i}`}>
          <circle
            cx={maxRadius + 2}
            cy={(paperInfoHeight / 2) + 2}
            r={radius - 1}
          />
        </clipPath>
        <image
          xlinkHref="/hatch.svg"
          width="150px"
          height="150px"
          x={-75 + maxRadius + 2}
          y={-75 + (paperInfoHeight / 2) + 2}
          style={{
            clipPath: `url(#clip_${i})`,
            display: inSearchQueue ? "inline" : "none"
          }}
          onClick={handleNodeClick(i * paperInfoHeight)}
        />
      </svg>
      <LHSCard props={{
        maxRadius,
        paperInfoHeight,
        node,
        handleNodeClick,
        i
      }} />
    </div>
  )
}

function LHSCard({ props }) {

  const classes = useStyles()
  const { 
    maxRadius,
    paperInfoHeight,
    node,
    handleNodeClick,
    i
  } = props

  return (
    <Card
      style={{
        position: "absolute",
        top: paperInfoHeight / 2,
        left: maxRadius,
        maxHeight: `calc(100% - ${maxRadius}px)`,
        width: `calc(100% - ${maxRadius}px - 5px)`
      }}
      onClick={handleNodeClick(i * paperInfoHeight)}
    >
      <CardContent>
        <Typography
          className={classes.lhsText}
          variant="subtitle1"
          color="textPrimary"
          gutterBottom
        >
          {node.Title}
        </Typography>
        <Typography
          className={classes.lhsText}
          variant="body1"
          color="textSecondary"
        >
          {node.formattedAuthors ?
            node.formattedAuthors :
            ""}
        </Typography>
      </CardContent>
    </Card>
  )
}