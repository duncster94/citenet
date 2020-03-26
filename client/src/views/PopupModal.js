import React from "react"
import Dialog from "@material-ui/core/Dialog"
import ViewDialog from "./ViewDialog"
import theme from "../Theme"
import useMediaQuery from "@material-ui/core/useMediaQuery"

export default function PopupModal({ props }) {
  /* Paper information dialog that displays on top of content.
  */

  function handleClose() {
    props.setIsModalOpen(false)
  }

  function handleClick(event) {
    event.stopPropagation()
  }

  return (
    <Dialog
      open={props.isModalOpen}
      onClose={handleClose}
      onClick={handleClick}
      scroll={
        useMediaQuery(theme.breakpoints.down('xs')) 
        ? 'body'
        : 'paper'
      }
      fullScreen={
        useMediaQuery(theme.breakpoints.down('xs'))
      }
      aria-labelledby="scroll-dialog-title"
    >
      <ViewDialog props={{...props, handleClose}} />
    </Dialog>
  )
}