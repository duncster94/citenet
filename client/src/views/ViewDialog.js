import React from "react"
import Box from '@material-ui/core/Box'
import Chip from "@material-ui/core/Chip"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import { makeStyles } from "@material-ui/core/styles"
import Avatar from '@material-ui/core/Avatar'
import queryString from 'query-string'

import Icon from "@mdi/react"
import { 
  mdiPlusBox,
  mdiMinusBox,
  mdiOpenInNew,
  mdiThumbUp,
  mdiThumbDown
} from "@mdi/js"

import { withRouter } from "react-router-dom"

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

export default withRouter(function ViewDialog(props) {

  const classes = useStyles()
  const seeds = queryString.parse(props.location.search)['id'].split(',')
  const { selectedPaper, searchQueue, setSearchQueue } = props.props
  const { id } = selectedPaper

  function handleAddToSearchClick() {

    if (searchQueue.includes(id)) {
      // https://stackoverflow.com/questions/36326612/delete-item-from-state-array-in-react
      let array = [...searchQueue]
      let index = array.indexOf(id)
      if (index !== -1) {
        array.splice(index, 1)
        setSearchQueue(array)
      }
    } else {
      setSearchQueue([...searchQueue, id])
    }
  }

  const handleCurateClick = isRelevant => () => {
    
  }

  return (
    <React.Fragment>
      <DialogTitle className={classes.title}>
        {selectedPaper.Title}
      </DialogTitle>
      <DialogContent dividers={true}>
        <div
          className={classes.chipDiv}
        >

          <Box display={
            selectedPaper.Journal.Title == null  || selectedPaper.Journal.Title === 'undefined'?
            'none':
            'inline-flex'
          }> 
            <Chip
              avatar={<Avatar>J</Avatar>}
              color="secondary"
              className={classes.journalChip}
              label={selectedPaper.Journal.Title}
              size="medium"
              style={{fontWeight: "bold"}}
            />
          </Box>

          <Box display={
            selectedPaper.formattedDate == null || selectedPaper.formattedDate === 'undefined'?
            'none':
            'inline-flex'
          }>
            <Chip
              avatar={<Avatar>D</Avatar>}
              color="secondary"
              label={selectedPaper.formattedDate}
              size="medium"
              style={{marginLeft: "5px", fontWeight: "bold"}}
            />        
          </Box>

        </div>
        <DialogContentText
          variant="caption"
          // classes={classes.authors}
        >
          {selectedPaper.formattedAuthors ? 
           selectedPaper.formattedAuthors :
           ''}
        </DialogContentText>
        <DialogContentText>
          {selectedPaper.Abstract ?
           selectedPaper.Abstract :
           ''}
        </DialogContentText>
      </DialogContent>
      <DialogActions>

        {/* Add to refine */}
        <Tooltip 
          title={searchQueue.includes(id) ?
            "Remove from search queue" :
            "Add to search queue"}
          placement="top"
          enterDelay={600}
          leaveDelay={100}
        >
          <IconButton
            onClick={handleAddToSearchClick}
            aria-label={searchQueue.includes(id) ?
              "Remove from search queue" :
              "Add to search queue"}
          >
            <Icon
              path={searchQueue.includes(id) ?
                mdiMinusBox :
                mdiPlusBox} 
              size={1.25}
              color={theme.palette.primary.main}
            />       
          </IconButton>
        </Tooltip>

        {/* Link out */}
        <Tooltip 
          title="Go to publisher's site"
          placement="top"
          enterDelay={600}
          leaveDelay={100}
        >
          <a
            href={id ?
              "https://www.ncbi.nlm.nih.gov/pubmed/" +
              id.toString() :
              ""}
            target="_blank"
            rel='noopener noreferrer'
            style={{ textDecoration: "none" }}
          >
            <IconButton
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

        {/* Thumbs up */}
        <Box display={seeds.includes(id) ? 'none' : 'flex'}>
          <Tooltip 
            title="This is a relevant paper"
            placement="top"
            enterDelay={400}
            leaveDelay={100}
          >
            <IconButton
              onClick={handleCurateClick(true)}
              aria-label="This is a relevant paper"
            >
              <Icon
                path={mdiThumbUp} 
                size={1.25}
                color={theme.palette.primary.main}
              />       
            </IconButton>
          </Tooltip>
        </Box>

        {/* Thumbs down */}
        <Box display={seeds.includes(id) ? 'none' : 'flex'}>
          <Tooltip 
            title="This is not a relevant paper"
            placement="top"
            enterDelay={400}
            leaveDelay={100}
          >
            <IconButton
              onClick={handleCurateClick(false)}
              aria-label="This is not a relevant paper"
            >
              <Icon
                path={mdiThumbDown} 
                size={1.25}
                color={theme.palette.primary.main}
              />       
            </IconButton>
          </Tooltip>
        </Box>

        <div style={{flex: "1 0 0"}} /> {/* added so buttons float left */}
      </DialogActions>
    </React.Fragment>
  )
})