import React from "react"

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

export default function SplitSearchButton(props) {

  // State for dropdown anchor element.
  const [anchorEl, setAnchorEl] = React.useState(null)

  // Passed down state for currently selected view.
  const { selectedView, setSelectedView } = props.props

  function handleClick() {
    // alert("clicked")
    fetch('/test', { method: "POST" })
      .then(r => r.json())
      .then(r => alert(r.res))
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
        <Button onClick={handleClick}>search</Button>
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
}
