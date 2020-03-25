import React from "react"
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'


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