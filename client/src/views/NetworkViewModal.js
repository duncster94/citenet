import React from "react"

import Button from "@material-ui/core/Button"

import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"

import "./NetworkView.css"

const NodeModal = React.memo(({ props }) => {
    
    console.log(props.isModalOpen)
    
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
            <DialogTitle>{props.data.title}</DialogTitle>
            <DialogContent dividers={true}>
                <DialogContentText>authors (need to format)</DialogContentText>
                <DialogContentText>{props.data.abstract}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button>Add to search</Button>
                <Button>Publisher's site</Button>
            </DialogActions>

        </Dialog>
    )
}, function(prevProps, nextProps) {
    return prevProps.props.isModalOpen === nextProps.props.isModalOpen
})

export default NodeModal