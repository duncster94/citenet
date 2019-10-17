import React from "react"

import Button from "@material-ui/core/Button"

import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"

import ViewDialog from "./ViewDialog"
import "./NetworkView.css"

const NodeModal = React.memo(({ props }) => {
    
    console.log(props.isModalOpen)
    
    function handleClose() {
        props.setIsModalOpen(false)
    }

    function handleClick(event) {
        event.stopPropagation()
    }

    console.log(props)

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
}, function(prevProps, nextProps) {
    return prevProps.props.isModalOpen === nextProps.props.isModalOpen
})

export default NodeModal