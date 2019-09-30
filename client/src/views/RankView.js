import React from "react"
import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import Divider from "@material-ui/core/Divider"
import Typography from "@material-ui/core/Typography"
import Grid from "@material-ui/core/Grid"

import "./RankView.css"

export default function RankView({ props }) {

  console.log(props)

  const paperInfoHeight = 200 // height of left-hand side paper info cards
  const maxRadius = Math.max(...props.metadata.radii)

  function handleScroll(e) {
    console.log(e.target.scrollTop)
  }

  return (
    <Grid
      container
    >
      <Grid item xs>
        <div style={{
          scrollSnapType: "y mandatory",
          overflowY: "scroll",
          maxHeight: "100vh",
          scrollSnapDestination: "50vh",
          paddingLeft: "40px"
        }}
          onScroll={handleScroll}
        >

          <div style={{
            position: "absolute",
            height: "0px",
            width: "10vw",
            top: "50vh",
            borderStyle: "solid"
          }}>
          </div>
          {props.subgraph.nodes.map((node, i) => {
            let marginTop
            let marginBottom
            if (i === 0) {
              marginTop = "50vh"
              marginBottom = "0vh"
            } else if (i + 1 === props.subgraph.nodes.length) {
              marginTop = "0vh"
              marginBottom = "50vh"
            } else {
              marginTop = "0vh"
              marginBottom = "0vh"
            }
            return (
              <div
                style={{
                  position: "relative",
                  height: `${paperInfoHeight}px`,
                  // borderStyle: "solid",
                  scrollSnapAlign: "center",
                  marginTop: marginTop,
                  marginBottom: marginBottom
                }}
                key={`paper-metadata-${i}`}
              >
                <svg
                  height="100%"
                  width="100%"
                  style={{ position: "absolute" }}
                >
                  <circle
                    cx={maxRadius}
                    cy={paperInfoHeight/2}
                    r={props.metadata.radii[i]}
                    fill={props.metadata.colours[i]}
                  />
                </svg>
                <Card
                  style={{
                    position: "absolute",
                    top: paperInfoHeight/2,
                    left: maxRadius,
                    height: `calc(100% - ${maxRadius}px)`,
                    width: `calc(100% - ${maxRadius}px - 5px)`
                  }}
                >
                  <CardContent>
                    <Typography>
                      {node.title}
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            )
          })}

        </div>
      </Grid>

      <Grid item xs>
        <NodeDialog props={props.subgraph.nodes[0]}/>
      </Grid>
    </Grid>
  )
}


function NodeDialog({ props }) {
  console.log(props)
  return (
    <Card 
      style={{
        display: "flex", 
        flexDirection: "column", 
        height: "90vh", 
        margin: "5vh"
      }}
    >
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent 
        dividers={true}
        style={{
          overflowY: "auto"
        }}
      >
        <DialogContentText>{props.formattedAuthors}</DialogContentText>
        <DialogContentText>{props.formattedDate}</DialogContentText>
        <DialogContentText>{props.abstract}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button>Add to search</Button>
        <a
          href={props.id ? "https://www.ncbi.nlm.nih.gov/pubmed/" + props.id.toString() : ""}
          target="_blank"
          style={{ textDecoration: "none" }}
        >
          <Button>Publisher's site</Button>
        </a>
      </DialogActions>
    </Card>
  )
}