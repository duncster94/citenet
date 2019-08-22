import React from "react"
import Grid from "@material-ui/core/Grid"

import "./HomePage.css"
import SplitSearchButton from "./SplitSearchButton"
import SearchBar from "./SearchBar"

export default function HomePage(props) {

  const {buttonProps, searchBarProps} = props.props

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
              <SearchBar props={searchBarProps}/>
            </Grid>

            <Grid item>
              {/* Search button with dropdown view selector */}
              <SplitSearchButton props={buttonProps}/>
            </Grid>

          </Grid>

          <Grid item>
            <span>sexy CiteNet tagline here</span>
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
