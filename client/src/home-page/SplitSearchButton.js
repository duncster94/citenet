import React from "react"

import { withRouter } from "react-router-dom"

import Button from "@material-ui/core/Button"
import ButtonGroup from "@material-ui/core/ButtonGroup"

import Divider from "@material-ui/core/Divider"
import ListSubheader from "@material-ui/core/ListSubheader"

import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"

import queryString from "query-string"

const viewOptions = [
  "Ranked List",
  "Network"
]

export default withRouter(function SplitSearchButton(props) {

  // State for dropdown anchor element.
  const [anchorEl, setAnchorEl] = React.useState(null)

  // Passed down state for currently selected view.
  const { selectedView, setSelectedView, selectedPapers } = props.props

  function handleClick() {
    
    // Create query string.
    const query = queryString.stringify({id: selectedPapers}, {arrayFormat: 'comma'})
    let view
    if (selectedView === 0) {
      view = 'rank'
    } else {
      view = 'network'
    }
    // Switch to view.
    props.history.push(`/view/${view}?${query}`)
  }

  function handleToggle(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleMenuItemClick(event, index) {
    setSelectedView(index)
    setAnchorEl(null)
  }

  function handleClose(event) {
    setAnchorEl(null)
  }

  return (
    <React.Fragment>
      <ButtonGroup
        variant="contained"
        color="primary" 
        aria-label="split button"
      >
        <Button
          color="primary"
          size="small"
          aria-haspopup="true"
          onClick={handleToggle}
        >
          \/
        </Button>
        <Button
          onClick={handleClick}
          // Check if `selectedPapers` is an array (default is null)
          disabled={!Boolean(selectedPapers)}
        >
          search</Button>
      </ButtonGroup>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
      >
        <ListSubheader color="primary">Views</ListSubheader>
        <Divider />

        {viewOptions.map((option, index) => (
          <MenuItem
            key={option}
            onClick={event => handleMenuItemClick(event, index)}
            selected={index===selectedView}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  )
})
