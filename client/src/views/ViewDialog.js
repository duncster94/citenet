import React from "react"
import Chip from "@material-ui/core/Chip"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import { makeStyles } from "@material-ui/core/styles"
import Icon from "@mdi/react"
import Avatar from '@material-ui/core/Avatar';
import { 
  mdiPlusBox,
  mdiMinusBox,
  mdiOpenInNew
} from "@mdi/js"

import theme from "../Theme"
import "./NetworkView.css"

const useStyles = makeStyles({
  title: {
    backgroundColor: theme.palette.primary.black,
    color: "#fff"
  },
  authors: {

  },
  journalChip: {
    "& span": {
      display: "block",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
      maxWidth: "18vw",
    }
  },
  chipDiv: {
    marginBottom: "15px"
  }
})

export default function ViewDialog({ props }) {

  const classes = useStyles()

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

  return (
    <React.Fragment>
      <DialogTitle className={classes.title}>
        {props.selectedPaper.Title}
      </DialogTitle>
      <DialogContent dividers={true}>
        <div
          className={classes.chipDiv}
        > 
          <Chip
            avatar={<Avatar>J</Avatar>}
            color="secondary"
            className={classes.journalChip}
            label={props.selectedPaper.Journal.Title}
            size="medium"
            style={{fontWeight: "bold"}}
            display={
              props.selectedPaper.Journal.Title == null ?
              'none':
              'block'
            }
          />
          <Chip
            avatar={<Avatar>D</Avatar>}
            color="secondary"
            label={props.selectedPaper.formattedDate}
            size="medium"
            style={{marginLeft: "5px", fontWeight: "bold"}}
            display={
              props.selectedPaper.formattedDate == null ?
              'none':
              'block'
            }
          />        
        </div>
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
            href={props.selectedPaper.id ?
              "https://www.ncbi.nlm.nih.gov/pubmed/" +
              props.selectedPaper.id.toString() :
              ""}
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
    </React.Fragment>
  )
}