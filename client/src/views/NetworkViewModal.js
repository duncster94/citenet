import React from "react"
import Dialog from "@material-ui/core/Dialog"
import ViewDialog from "./ViewDialog"
import "./NetworkView.css"

export default function NodeModal({ props }) {
    
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