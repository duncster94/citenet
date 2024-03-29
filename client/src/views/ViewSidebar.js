import React from "react"

import { withRouter } from "react-router-dom"

import Avatar from "@material-ui/core/Avatar"
import Divider from "@material-ui/core/Divider"
import IconButton from "@material-ui/core/IconButton"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer"
import { makeStyles } from "@material-ui/core/styles"

import Icon from "@mdi/react"
import { 
  mdiChevronLeft, 
  mdiHomeOutline, 
  mdiGraphOutline,
  mdiFormatListBulleted,
  mdiRedoVariant
} from "@mdi/js"

import queryString from "query-string"
import theme from "../Theme"

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  drawerButton: {
    position: "absolute",
    right: 0,
    top: 0
  },
  avatarMain: {
    color: "#fff",
    backgroundColor: theme.palette.primary.main
  },
  avatarRefine: {
    color: "#fff",
    backgroundColor: theme.palette.secondary.main
  }
})

export default withRouter(function ViewSidebar(props) {
  const classes = useStyles()
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleDrawer = open => event => {
    if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return
    }
    setIsOpen(open)
  }

  function handleHomeClick() {
    // Switch to view.
    props.history.push("/")
  }

  function handleViewSwitchClick() {
    if (props.props.view === "rank") {
      props.history.push(`/view/network${props.location.search}`)
    } else {
      props.history.push(`/view/rank${props.location.search}`)
    }
  }

  function handleRefineClick() {
    // Refine search
    const query = queryString.stringify(
      { id: props.props.searchQueue },
      { arrayFormat: 'comma' }
    )
    props.history.push(`/view/${props.props.view}?${query}`)
  }

  const drawer = (
    <div
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem
          button
          onClick={handleHomeClick}
        >
          <ListItemIcon>
            <Avatar className={classes.avatarMain}>
              <Icon
                path={mdiHomeOutline}
                size={1}
                color="white"
              />
            </Avatar>
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem
          button
          onClick={handleViewSwitchClick}
        >
          <ListItemIcon>
            <Avatar className={classes.avatarMain}>
              <Icon
                path={props.props.view === "rank" ? 
                  mdiGraphOutline :
                  mdiFormatListBulleted
                }
                size={1}
                color="white"
              />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={props.props.view === "rank" ?
              "Network View" :
              "Rank View"}
          />
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={handleRefineClick}
          disabled={props.props.searchQueue.length === 0 ?
            true :
            false}
        >
          <ListItemIcon>
            <Avatar className={classes.avatarRefine}>
              <Icon
                path={mdiRedoVariant}
                size={1}
                color="white"
              />
            </Avatar>
          </ListItemIcon>
          <ListItemText primary="Refine Search" />
        </ListItem>
      </List>
    </div>
  )

  return (
    <React.Fragment>
      <IconButton
        onClick={toggleDrawer(true)}
        className={classes.drawerButton}
        aria-label="Open sidebar"
      >
        <Icon
          path={mdiChevronLeft}
          size={1}
        />
      </IconButton>
      <SwipeableDrawer
        open={isOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        anchor="right"
      >
        {drawer}
      </SwipeableDrawer>
    </React.Fragment>
  )
})