import React from 'react'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles'
import Icon from "@mdi/react"
import { mdiClose } from "@mdi/js"
import theme from '../Theme'

const MESSAGE = `CiteNet is currently in development. However, due to the COVID-19 pandemic we have opted
to: 1. Make CiteNet available to the public and 2. Index bioRxiv and medRxiv on a nightly basis. We hope to provide
a useful, up-to-date literature search tool for the scientific community.`

const useStyles = makeStyles(theme => ({
  root: {
    zIndex: -1
  },
  text: {
    color: '#fff',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.7em'
    }
  }

}))

const AlertBanner = () => {

  const classes = useStyles()
  const [open, setOpen] = React.useState(true);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  return (
    <div className={classes.root}>
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
        open={open}
        onClose={handleClose}
      >
        <Paper style={{ backgroundColor: theme.palette.secondary.main, padding: "10px" }}>
          <div style={{display: 'flex'}}>
          <Typography className={classes.text}>
            {MESSAGE}
          </Typography>
          <IconButton
            size="small"
            aria-label="close"
            onClick={handleClose}
            style={{
              height: '30px',
              width: '30px'
            }}
          >
            <Icon path={mdiClose} size={1} color="#fff"/>
          </IconButton>
          </div>
        </Paper>
      </Snackbar>
    </div>
  )
}

export default AlertBanner