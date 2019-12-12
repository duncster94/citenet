import React from "react"

import Typography from "@material-ui/core/Typography"
import Box from "@material-ui/core/Box"
import Grid from "@material-ui/core/Grid"

import "./GenericNotFound.css"

export default function GenericNotFound() {
    return (
        <div className="error404-root">
            <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
            >
                <Grid item>
                    <Typography variant="h1">
                        404
                    </Typography>
                </Grid>

                <Grid item>
                    <Box
                        fontStyle="italic"
                        m={1}
                        textAlign="center"
                    >
                        <Typography variant="body2">
                            I'm sorry Dave, I'm afraid I can't do that.
                        </Typography>
                    </Box>
                </Grid>

            </Grid>
        </div>
    )
}