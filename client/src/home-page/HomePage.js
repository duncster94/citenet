import React from "react"
import Grid from "@material-ui/core/Grid"
import Link from "@material-ui/core/Link"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"

import SearchBar from "./SearchBar"
import AlertBanner from "../generic-components/AlertBanner"

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    position: "absolute",
    flexGrow: 1,
    height: "inherit",
    width: "inherit",
    overflow: 'hidden'
  },
  aboutLink: {
    position: "absolute",
    top: "15px",
    left: "20px",
    fontSize: "14px",
  },
  versionText: {
    position: "absolute",
    bottom: "15px",
    right: "20px",
    fontSize: "10px",
    // [theme.breakpoints.down('xs')]: {
    //   display: "none"
    // }
  },
  logo: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "50%",
    height: "auto",
  },
  search: {
    marginTop: '30vh',
  }
}))

export default function HomePage({ props }) {

  const classes = useStyles()

  return (
    <React.Fragment>
      <div
        className={classes.root}
      >
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
        >
          <AlertBanner />

          <Grid item xs>
            <Grid
              container
              className={classes.search}
              justify="center"
              alignItems="center"
            >

              <Grid item>
                <Logo />
              </Grid>

              <Grid item xs={8} style={{marginTop: '20px'}}>
                {/* Paper select bar */}
                <SearchBar props={props} />
              </Grid>


            </Grid>
          </Grid>

        </Grid>
      </div>
      {/* <AboutLink /> */}
      <VersionText />
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

function AboutLink() {

  const classes = useStyles()

  return (
    <Typography className={classes.aboutLink}>
      <Link href="/about">
        About
      </Link>
    </Typography>
  )
}

function VersionText() {
  const classes = useStyles()
  return (
    <Typography
      className={classes.versionText}
      color='textSecondary'
    >
      Build 0.1.0-alpha
    </Typography>
  )
}