import React from 'react'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Container from '@material-ui/core/Container'
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
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"


const useStyles = makeStyles(theme => ({
  textField: {
    marginBottom: theme.spacing(2)
  }
}))

const ContactForm = ({ props }) => {

  const classes = useStyles()

  // reCaptcha
  const { executeRecaptcha } = useGoogleReCaptcha()

  const { contactOpen, setContactOpen } = props
  const [emailValue, setEmailValue] = React.useState("")
  const [textValue, setTextValue] = React.useState("")
  const [disabled, setDisabled] = React.useState(true)

  const handleEmailChange = (event) => {
    setEmailValue(event.target.value)
  }

  const handleTextChange = (event) => {
    setTextValue(event.target.value)
  }

  const handleSubmit = async () => {
    setDisabled(true)
    const token = await executeRecaptcha('contact_us')
    await fetch("/contact_us", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        email: emailValue,
        text: textValue
      })
    })
    setEmailValue("")
    setTextValue("")
    setContactOpen(false)
  }

  React.useEffect(() => {
    emailValue === "" || textValue === ""
    ? setDisabled(true)
    : setDisabled(false)
  }, [emailValue, textValue])

  return (
    <Dialog onClose={() => setContactOpen(false)} open={contactOpen}>
      <DialogTitle>Contact us</DialogTitle>
      <DialogContent>
        <TextField
          className={classes.textField}
          autoFocus
          autoComplete="email"
          margin="dense"
          label="Email Address"
          type="email"
          value={emailValue}
          onChange={handleEmailChange}
          variant="outlined"
          required
          fullWidth
        />
        <TextField 
          className={classes.textField}
          multiline
          rows="5"
          label="Questions or comments"
          type="text"
          value={textValue}
          onChange={handleTextChange}
          inputProps={{maxLength: 1000}}
          variant="outlined"
          required
          fullWidth
        />
        <DialogContentText>
          <ReCaptchaText />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} disabled={disabled}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const ContactLink = ({ props }) => {

  const { setContactOpen } = props
  const handleClick = () => {
    setContactOpen(true)
  }

  return (
    <Link component="button" onClick={handleClick}>
      Contact us
    </Link>
  )
}

const ReCaptchaText = () => {
  // This is throwing a warning for some reason
  return (
    <Box fontWeight="fontWeightLight" fontSize={12}>
      This site is protected by reCAPTCHA and the Google{' '}
      <Link href="https://policies.google.com/privacy">Privacy Policy</Link> and{' '}
      <Link href="https://policies.google.com/terms">Terms of Service</Link> apply.
    </Box>
  )
}

export { ContactLink }
export default ContactForm