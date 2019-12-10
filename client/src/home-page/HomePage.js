import React from "react"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"

import theme from "../Theme"
import SearchBar from "./SearchBar"

const useStyles = makeStyles({
  root: {
    position: "absolute",
    flexGrow: 1,
    display: "flex",
    height: "inherit",
    width: "inherit",
  },
  search: {
    marginTop: "10px",
    marginBottom: "10px",
  },
  logo: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "50%",
    height: "auto",
  },
  // tagline: {
  //   color: theme.palette.primary.main,
  //   marginBottom: "15vh"
  // }
})

export default function HomePage({ props }) {

  const classes = useStyles()

  return (
    <React.Fragment>
      <div className={classes.root}>
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
        >

          <Grid item>
            <Logo />
          </Grid>

          <Grid
            container
            className={classes.search}
            justify="center"
            alignItems="center"
          >

            <Grid item xs={8}>
              {/* Paper select bar */}
              <SearchBar props={props} />
            </Grid>

          </Grid>

          <Grid item>
            <Typography 
              style={{
                color: theme.palette.primary.main,
                marginBottom: "15vh"
              }} // This should be in `makeStyles` but it doesn't work...?
            >
              A powerfully intuitive way to search the scientific literature
            </Typography>
          </Grid>

        </Grid>
      </div>
    </React.Fragment>
  )
}

function Logo() {

  const classes = useStyles()

  return (
    <img
      className={classes.logo}
      alt="CiteNet logo"
      src="/images/citenet_logo.png"
    />
  )
}
