import React from "react"
import Box from "@material-ui/core/Box"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles({
  root: {
    display: "flex",
    position: "absolute",
    paddingTop: "30px",
    width: "inherit"
  }
})

const Bold = ({ children }) => <Box
  fontWeight="fontWeightBold"
  style={{
    display: "inline-block"
  }}>{children}</Box>

export default function AboutPage() {

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Grid
        justify="center"
        container
      >
        <Grid item xs={8}>
          <Typography
            variant="h4"
            style={{
              textAlign: "center"
            }}
            gutterBottom
          >
            CiteNet is an interactive <Bold>search</Bold> and <Bold>visualization</Bold> tool for biomedical literature.
          </Typography>
        </Grid>
          {/* <hr /> */}
        <Grid item xs={6}>
          <Typography gutterBottom>
            Papers are being published at an incredible rate. The ever-increasing body of literature makes sorting through
            irrelevant research while at the same time not missing critically important results a daunting task. The 
            traditional literature search paradigm is slow, fragmented and difficult to mentally 
            organize (so many browser tabs!).
          </Typography>
          <Typography gutterBottom>
            We've developed <Bold>CiteNet</Bold> in an attempt to alleviate the time-consuming and often frustrating 
            process of finding relevant papers for your research.
          </Typography>
        </Grid>
      </Grid>
    </div>
  )
}