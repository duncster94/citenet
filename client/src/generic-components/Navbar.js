import React from "react"
import PropTypes from "prop-types"
import { AppBar } from "@material-ui/core"
import { withStyles } from "@material-ui/core/styles"
import { Tab } from "@material-ui/core"
import { Tabs } from "@material-ui/core"

import theme from "../Theme"

const styles = {
  navbar: {
    position: "absolute",
    height: "60px",
    backgroundColor: theme.palette.primary.black,
    "& div": {
      height: "inherit"
    },
  }
}

function Navbar(props) {

  const { classes } = props

  return (
    <React.Fragment>
      <AppBar
        position="static"
        className={classes.navbar}
      >
        <Tabs
          value={props.props.page}
          onChange={props.props.handleNavbarChange}
        >
          <Tab label="Home" />
          <Tab label="About" />
        </Tabs>
      </AppBar>
    </React.Fragment>
  )
}

Navbar.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Navbar)