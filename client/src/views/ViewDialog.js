import React from "react"

import Button from "@material-ui/core/Button"

import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"

import "./NetworkView.css"

export default function ViewDialog({ props }) {

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
            <DialogTitle>{props.selectedPaper.title}</DialogTitle>
            <DialogContent dividers={true}>
                <DialogContentText>{props.selectedPaper.formattedAuthors}</DialogContentText>
                <DialogContentText>{props.selectedPaper.formattedDate}</DialogContentText>
                <DialogContentText>{props.selectedPaper.abstract}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleAddToSearchClick}
                >
                    Add to search
                </Button>
                <a
                    href={props.selectedPaper.id ? "https://www.ncbi.nlm.nih.gov/pubmed/" + props.selectedPaper.id.toString() : ""}
                    target="_blank"
                    style={{ textDecoration: "none" }}
                >
                    <Button>Publisher's site</Button>
                </a>
            </DialogActions>
        </React.Fragment>
    )
}