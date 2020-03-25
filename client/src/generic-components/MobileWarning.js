import React from "react"
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'


const MobileWarning = () => {

  const [open, setOpen] = React.useState(true)

  return (
    <Dialog onClose={() => setOpen(false)} open={open}>
      <DialogContent>
        <DialogContentText>
          We've noticed you're using a mobile device. CiteNet is
          best suited for larger screens so please consider using
          a laptop or desktop.
        </DialogContentText>
      </DialogContent>
    </Dialog>
  )
}

export default MobileWarning