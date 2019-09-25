import React from "react"

import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import { Popper } from "@material-ui/core"
import { Paper } from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import Grow from "@material-ui/core/Grow"

import { CSSTransition } from "react-transition-group"

import "./NetworkView.css"

export default function NodePopover({ props }) {

    console.log(props)
    const [arrowRef, setArrowRef] = React.useState(null)
    const isOpen = Boolean(props.popoverAnchorEl)
  
    return (
      <CSSTransition
        in={isOpen}
        timeout={250}
        classNames="popper-transition"
        unmountOnExit
      >
        <Popper
          className="network-node-popover"
          className={useStyles().popper}
          open={true}
          anchorEl={props.popoverAnchorEl}
          placement="top"
          modifiers={{
            arrow: {
              enabled: true,
              element: arrowRef
            }
          }}
        >
          <Grow timeout={350} in={isOpen}>
            <Paper className={useStyles().paper}>
              <span className={useStyles().arrow} ref={setArrowRef} />
              <Grid
                className="network-node-popover-grid"
                direction="column"
                alignItems="center"
                container
              >
                <Grid item xs>
                  <Typography
                    align="center"
                    color="textPrimary"
                    variant="body1"
                    gutterBottom
                  >
                    {props.data.title}
                  </Typography>
                </Grid>
  
                <Grid item xs>
                  <Typography
                    align="center"
                    color="textSecondary"
                    variant="body2"
                    gutterBottom
                  >
                    {props.data.formattedAuthors}
              </Typography>
                </Grid>
  
              </Grid>
            </Paper>
          </Grow>
        </Popper>
      </CSSTransition>
    )
  }
  
  const useStyles = makeStyles(theme => ({
    popper: {
      zIndex: 1,
      '&[x-placement*="bottom"] $arrow': {
        top: 0,
        left: 0,
        marginTop: "-0.9em",
        width: "3em",
        height: "1em",
        "&::before": {
          borderWidth: "0 1em 1em 1em",
          borderColor: `transparent transparent ${theme.palette.background.paper} transparent`,
        },
      },
      '&[x-placement*="top"] $arrow': {
        bottom: 0,
        left: 0,
        marginBottom: "-0.9em",
        width: "3em",
        height: "1em",
        "&::before": {
          borderWidth: "1em 1em 0 1em",
          borderColor: `${theme.palette.background.paper} transparent transparent transparent`,
        },
      },
      '&[x-placement*="right"] $arrow': {
        left: 0,
        marginLeft: "-0.9em",
        height: "3em",
        width: "1em",
        "&::before": {
          borderWidth: "1em 1em 1em 0",
          borderColor: `transparent ${theme.palette.background.paper} transparent transparent`,
        },
      },
      '&[x-placement*="left"] $arrow': {
        right: 0,
        marginRight: "-0.9em",
        height: "3em",
        width: "1em",
        "&::before": {
          borderWidth: "1em 0 1em 1em",
          borderColor: `transparent transparent transparent ${theme.palette.background.paper}`,
        },
      },
    },

    paper: {
      backgroundColor: "rgba(255, 255, 255, 0.95)"
    },

    arrow: {
      position: "absolute",
      fontSize: 7,
      width: "3em",
      height: "3em",
      pointerEvents: "none",
      color: "rgba(255, 255, 255, 0.95)",
      "&::before": {
        content: '""',
        margin: "auto",
        display: "block",
        width: 0,
        height: 0,
        borderStyle: "solid",
      }
    }
  }))