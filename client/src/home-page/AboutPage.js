import React from "react"
import Box from "@material-ui/core/Box"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles({
  root: {
    position: "absolute",
    top: "60px",  // this compensates for Navbar height
    paddingTop: "30px",
    width: "inherit"
  }
})

const Bold = ({ children }) => <Box
  fontWeight="fontWeightBold"
  style={{
    display: "inline-block"
  }}>{children}</Box>

export default function AboutPage({ props }) {

  const classes = useStyles()

  return (
    <div
      className={classes.root}
      style={{
        display: props.page === 1 ?
          "flex" :
          "none"
      }}
    >
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
            Papers are being published as an incredible rate. The ever-increasing body of literature makes sorting through
            irrelevant research a daunting task - while at the same time not missing critically important results. The 
            traditional literature search paradigm is slow, fragmented and difficult to mentally 
            organize (how many browser tabs did you have to open before you found the result you were looking for?).
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