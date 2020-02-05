import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'

export default function AlertSnackbar({ status, isOpen, setIsOpen }) {

  function handleClose(event, reason) {
    if (reason === 'clickaway') {
      return
    }

    setIsOpen(false)
  }

  return (
    <Snackbar 
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      autoHideDuration={2500}
      open={isOpen}
      onClose={handleClose}
      message={
        status === 'added'
        ? "Paper marked as read"
        : "Paper marked as unread"
      }
    />
  )
}