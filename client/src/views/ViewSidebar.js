import React from "react"
import Button from "@material-ui/core/Button"
import Divider from "@material-ui/core/Divider"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer"
import { makeStyles } from "@material-ui/core/styles"

const drawerWidth = 240

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

export default function ViewSidebar() {
    const classes = useStyles()
    const [isOpen, setIsOpen] = React.useState(false)

    const toggleDrawer = open => event => {
        if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
            return
        }

        setIsOpen(open)
    }

    const drawer = (
        <div 
            className={classes.list}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                <ListItem button>
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
            <Button
                onClick={toggleDrawer(true)}
                className={classes.drawerButton}
            >
                Open
            </Button>
            <SwipeableDrawer
                open={isOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
            >
                {drawer}
            </SwipeableDrawer>
        </React.Fragment>
    )
}