import React from "react"
import Select from "react-select"
import Grid from "@material-ui/core/Grid"

import "./HomePage.css"
import SplitSearchButton from "./SplitSearchButton"

function HomePage(props) {

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
              <SearchBar />
            </Grid>

            <Grid item>
              {/* Search button with dropdown view selector */}
              <SplitSearchButton props={props.buttonProps}/>
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

function SearchBar() {

  const components = {
    DropdownIndicator: () => null,
    IndicatorSeparator: () => null
  }

  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ]

  return (
    <Select
      isMulti
      name="colors"
      options={options}
      components={components}
      placeholder="Enter paper titles and/or author names."
    />  
  )
}

export default HomePage