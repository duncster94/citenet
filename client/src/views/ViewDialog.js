import React from "react"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import Hidden from "@material-ui/core/Hidden"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"
import Icon from "@mdi/react"
import {
  mdiClose,
  mdiPlusBox,
  mdiMinusBox,
  mdiOpenInNew
} from "@mdi/js"

import theme from '../Theme'
import Chips from '../generic-components/Chips'
import './NetworkView.css'

console.log(theme)

const useStyles = makeStyles(theme => ({
  title: {
    backgroundColor: theme.palette.primary.black,
    color: "#fff"
  },
  titleText: {
    fontSize: '1.5rem',
    lineHeight: '1.5rem',
    fontWeight: theme.typography.fontWeightRegular,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.3rem'
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.1rem'
    }
  }
}))

export default function ViewDialog({ props }) {

  const classes = useStyles()
  const { handleClose } = props

  function handleAddToSearchClick() {

    if (props.searchQueue.includes(props.selectedPaper.id)) {
      // https://stackoverflow.com/questions/36326612/delete-item-from-state-array-in-react
      let array = [...props.searchQueue]
      let index = array.indexOf(props.selectedPaper.id)
      if (index !== -1) {
        array.splice(index, 1)
        props.setSearchQueue(array)
      }
    } else {
      props.setSearchQueue([...props.searchQueue, props.selectedPaper.id])
    }
  }

  let href
  if (props.selectedPaper.id && props.selectedPaper.isPreprint) {
    href = `https://doi.org/${props.selectedPaper.id}`
  } else if (props.selectedPaper.id) {
    href = `https://www.ncbi.nlm.nih.gov/pubmed/${props.selectedPaper.id}`
  } else {
    href = ''
  }

  return (
    <>
      <DialogTitle className={classes.title} disableTypography>
        <Typography className={classes.titleText} variant='h2'>
          {props.selectedPaper.Title}
        </Typography>

        {/* close button for fullscreen modal */}
        <Hidden smUp>
          <IconButton
            size="small"
            aria-label="close"
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              height: '30px',
              width: '30px'
            }}
          >
            <Icon path={mdiClose} size={1} color="#fff"/>
          </IconButton>
        </Hidden>

      </DialogTitle>
      <DialogContent dividers={true}>
        <Chips props={{
          journalTitle: props.selectedPaper.Journal.Title,
          date: props.selectedPaper.formattedDate
        }}/>
        <DialogContentText
          variant="caption"
          // classes={classes.authors}
        >
          {props.selectedPaper.formattedAuthors ? 
           props.selectedPaper.formattedAuthors :
           ''}
        </DialogContentText>
        <DialogContentText>
          {props.selectedPaper.Abstract ?
           props.selectedPaper.Abstract :
           ''}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Tooltip 
          title={props.searchQueue.includes(props.selectedPaper.id) ?
            "Remove from search queue" :
            "Add to search queue"}
          placement="top"
          enterDelay={600}
          leaveDelay={100}
        >
          <IconButton
            onClick={handleAddToSearchClick}
            aria-label="Add to search queue"
          >
            <Icon
              path={props.searchQueue.includes(props.selectedPaper.id) ?
                mdiMinusBox :
                mdiPlusBox} 
              size={1.25}
              color={theme.palette.primary.main}
            />       
          </IconButton>
        </Tooltip>
        <Tooltip 
          title="Go to publisher's site"
          placement="top"
          enterDelay={600}
          leaveDelay={100}
        >
          <a
            href={href}
            target="_blank"
            rel='noopener noreferrer'
            style={{ textDecoration: "none" }}
          >
            <IconButton
              // onClick={handleAddToSearchClick}
              aria-label="To publisher's site"
            >
              <Icon
                path={mdiOpenInNew}
                size={1.25}
                color={theme.palette.primary.main}
              />       
            </IconButton>
          </a>
        </Tooltip>
        <div style={{flex: "1 0 0"}} /> {/* added so buttons float left */}
      </DialogActions>
    </>
  )
}