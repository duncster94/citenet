import React from "react"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"

import theme from "../Theme"
import "./HomePage.css"
import SearchBar from "./SearchBar"

export default function HomePage({ props }) {

  return (
    <React.Fragment>
      <div className="homepage-root">
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
            className="homepage-search"
            justify="center"
            alignItems="center"
          >

            <Grid item xs={8}>
              {/* Paper select bar */}
              <SearchBar props={props} />
            </Grid>

          </Grid>

          <Grid item>
            <Typography style={{color: theme.palette.primary.main}}>
              A powerfully intuitive way to search the scientific literature
            </Typography>
          </Grid>

        </Grid>
      </div>
    </React.Fragment>
  )
}

function Logo() {
  return (
    <img
      className="homepage-logo"
      alt="CiteNet logo"
      src="/images/citenet_logo.png"
    />
  )
}
