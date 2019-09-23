import React from "react"

import { withRouter } from "react-router-dom"

import Divider from "@material-ui/core/Divider"
import IconButton from "@material-ui/core/IconButton"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer"
import { makeStyles } from "@material-ui/core/styles"

import Icon from "@mdi/react"
import { mdiChevronRight } from "@mdi/js"

const useStyles = makeStyles({
    list: {
        width: 250,
    },
    drawerButton: {
        position: "absolute",
        left: 0,
        top: 0
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

    const handleHomeClick = () => {
        // Switch to view.
        props.history.push("/")
    }

    const drawer = (
        <div 
            className={classes.list}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                <ListItem button
                    onClick={handleHomeClick}
                >
                    <ListItemText primary="Home" />
                </ListItem>
                <ListItem button>
                    <ListItemText primary="Rank View" />
                </ListItem>
                <Divider />
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
                    path={mdiChevronRight}
                    size={1}
                />
            </IconButton>
            <SwipeableDrawer
                open={isOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
            >
                {drawer}
            </SwipeableDrawer>
        </React.Fragment>
    )
})