import React from 'react'
import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'
import Chip from '@material-ui/core/Chip'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
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

export default function Chips({ props }) {

  const classes = useStyles()
  const {
    journalTitle,
    date
  } = props

  return (
    <div
      className={classes.chipDiv}
    >

      <Box display={
        journalTitle == null || journalTitle === 'undefined' ?
          'none' :
          'inline-flex'
      }>
        <Chip
          avatar={<Avatar>J</Avatar>}
          color="secondary"
          className={classes.journalChip}
          label={journalTitle}
          size="medium"
          style={{ fontWeight: "bold" }}
        />
      </Box>

      <Box display={
        date == null || date === 'undefined' ?
          'none' :
          'inline-flex'
      }>
        <Chip
          avatar={<Avatar>D</Avatar>}
          color="secondary"
          label={date}
          size="medium"
          style={{ marginLeft: "5px", fontWeight: "bold" }}
        />
      </Box>

    </div>
  )
}