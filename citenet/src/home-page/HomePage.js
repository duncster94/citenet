import React from "react"
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"

import "./HomePage.css"

class HomePage extends React.Component {
    constructor() {
        super()
    }

    render() {

        const styles = {
            root: {
            flexGrow: 1,
            display: "flex",
            height: "inherit"
            },
            paper: {
            // paper style in here
            }
        }

        return (
            <React.Fragment>
                <div style={styles.root}>
                    <Grid 
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                    >
                        <Grid item >
                            <img 
                                className="HomePage" 
                                alt="CiteNet logo" 
                                src="/images/citenet_logo.png"
                            />
                        </Grid>
                    </Grid>
                </div>
            </React.Fragment>
        )
    }
}

export default HomePage