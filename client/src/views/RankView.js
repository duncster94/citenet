import React from "react"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Typography from "@material-ui/core/Typography"
import Grid from "@material-ui/core/Grid"

import "./RankView.css"

export default function RankView({ props }) {

  console.log(props)

  const paperInfoHeight = "150px" // height of left-hand side paper info cards
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
                  height: paperInfoHeight,
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
                    cx={`${maxRadius}px`}
                    cy={`${maxRadius}px`}
                    r={props.metadata.radii[i]}
                    fill={props.metadata.colours[i]}
                  />
                </svg>
                <Card
                  style={{
                    position: "absolute",
                    top: maxRadius,
                    left: maxRadius
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
        <div>test</div>
      </Grid>
    </Grid>
  )
}