import React from "react"
import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"

import ViewDialog from "./ViewDialog"
import "./RankView.css"

export default function RankView({ props }) {

  // console.log(props)

  const [selectedPaper, setSelectedPaper] = React.useState(props.searchResults.subgraph.nodes[0])
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

  return (
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

      <Grid item xs>
        <NodeDialog 
          props={{selectedPaper, searchQueue: props.searchQueue, setSearchQueue: props.setSearchQueue}}
          key={+new Date()}  // unique key needed to retrigger animation
        />
      </Grid>
    </Grid>
  )
}


function NodeDialog({ props }) {

  // function handleAddToSearchClick() {
  //   // props.searchQueue.push(props.selectedPaper.id)
  //   if (props.searchQueue.includes(props.selectedPaper.id)) {
      
  //     // https://stackoverflow.com/questions/36326612/delete-item-from-state-array-in-react
  //     let array = [...props.searchQueue]
  //     let index = array.indexOf(props.selectedPaper.id)
  //     if (index !== -1) {
  //       array.splice(index, 1)
  //       props.setSearchQueue(array)
  //     }

  //   } else {
  //     props.setSearchQueue([...props.searchQueue, props.selectedPaper.id])
  //   }
  // }

  return (
    <div style={{overflow: "hidden"}}>
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
            <ViewDialog props={props}/>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}