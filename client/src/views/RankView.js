import React from "react"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { makeStyles, useTheme } from "@material-ui/core/styles"

import ViewDialog from "./ViewDialog"
import PopupModal from "./PopupModal"
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
  }
}))

export default function RankView({ props }) {

  const classes = useStyles()
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.down("xs"))
  const [selectedPaper, setSelectedPaper] = React.useState(props.searchResults.subgraph.nodes[0])
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const lhsRef = React.useRef(null)
  const paperInfoHeight = 200 // height of left-hand side paper info cards
  const maxRadius = Math.max(...props.searchResults.metadata.radii)

  // Currently no Javascript hooks exist for CSS snap scroll events so
  // for now the `scrollTop` pixel values must be tracked to determine which
  // paper is currently selected.
  const pixelIntervals = {}
  props.searchResults.subgraph.nodes.forEach((node, i) => {
    pixelIntervals[i * paperInfoHeight] = node
  })

  function handleScroll(e) {
    // should add scroll debouncing here at some point
    // also scroll snapping isn't working on edge, will need to polyfill
    if (e.target.scrollTop in pixelIntervals) {
      setSelectedPaper(pixelIntervals[e.target.scrollTop])
    }
  }

  const handleNodeClick = interval => e => {
    /* Scrolls LHS paper div to clicked paper.
    */
    e.stopPropagation()
    lhsRef.current.scrollTo({top: interval, behavior: "smooth"})

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
          <svg
            style={{
              position: "absolute",
              height: "15px",
              width: "15px",
              top: "calc(50vh - 7.5px)",
              left: "10px"
            }}
          >
            <image xlinkHref="/focus-arrow.svg" height="15px" width="15px" />
          </svg>
          <div
            style={{
              scrollSnapType: "y mandatory",
              overflowY: "scroll",
              maxHeight: "100vh",
              scrollSnapDestination: "50vh",
              paddingLeft: "40px"
            }}
            className="lhs-paper-cards"
            onScroll={handleScroll}
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
              return (
                <div
                  style={{
                    position: "relative",
                    height: `${paperInfoHeight}px`,
                    scrollSnapAlign: "center",
                    marginTop: marginTop,
                    marginBottom: marginBottom,
                    marginRight: "2.5vh"
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
                      r={props.searchResults.metadata.radii[i]}
                      fill={props.searchResults.metadata.colours[i]}
                      stroke="#222"
                      strokeWidth="2px"
                      onClick={handleNodeClick(i * paperInfoHeight)}
                    />
                    <clipPath id={`clip_${i}`}>
                      <circle
                        cx={maxRadius + 2}
                        cy={(paperInfoHeight / 2) + 2}
                        r={props.searchResults.metadata.radii[i] - 1}
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
                        display: props.searchQueue.includes(node.id) ? "inline" : "none"
                      }}
                      onClick={handleNodeClick(i * paperInfoHeight)}
                    />
                  </svg>
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
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                      >
                        {node.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                      >
                        {node.formattedAuthors}
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
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
      }}/>
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
              maxHeight: "90vh",
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