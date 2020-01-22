import React from "react"
import Dialog from "@material-ui/core/Dialog"
import ViewDialog from "./ViewDialog"

export default function PopupModal({ props }) {
  /* Paper information dialog that displays on top of content.
  */

  console.log(props)

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
      scroll="paper"
      aria-labelledby="scroll-dialog-title"
    >
      <ViewDialog props={props} />
    </Dialog>
  )
}