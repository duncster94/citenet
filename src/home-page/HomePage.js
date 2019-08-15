import React from "react"
import Select from "react-select";
import Grid from "@material-ui/core/Grid"
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import "./HomePage.css"

class HomePage extends React.Component {

  render() {

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
                <SplitSearch />
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

class SplitSearch extends React.Component {
  constructor() {
    super()
    this.state = {
      open: false
    }
  }

  render() {
    return (
      <ButtonGroup 
        variant="contained" 
        color="primary" 
        // ref={anchorRef} 
        aria-label="split button"
      >
        <Button
          color="primary"
          size="small"
          // aria-owns={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={null}
        >
          \/{/* arrow icon here */}
        </Button>
        <Button onClick={null}>search</Button>
      </ButtonGroup>
    )
  }
}

export default HomePage