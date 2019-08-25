import React from "react"

import { withRouter } from "react-router-dom"

import Button from "@material-ui/core/Button"
import ButtonGroup from "@material-ui/core/ButtonGroup"

import Divider from "@material-ui/core/Divider"
import ListSubheader from "@material-ui/core/ListSubheader"

import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"

const viewOptions = [
  "Ranked List",
  "Network"
]

export default withRouter(function SplitSearchButton(props) {

  // State for dropdown anchor element.
  const [anchorEl, setAnchorEl] = React.useState(null)

  // Passed down state for currently selected view.
  const { selectedView, setSelectedView, setIsSearched, selectedPapers } = props.props

  function handleClick() {
    setIsSearched(true)
    fetch("/submit_paper", { method: "POST",
                     body: JSON.stringify(selectedPapers),
                     headers: {"Content-Type": "application/json"},
                    })
      .then(r => r.json())
      .then(r => {console.log(r)})
    
    // Switch to view.
    if (selectedView === 0) {
      props.history.push("/rank")
    } else {
      props.history.push("/network")
    }
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
          \/{/* arrow icon here */}
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
