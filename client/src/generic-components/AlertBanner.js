import React from 'react'
import Container from '@material-ui/core/Container'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Link from '@material-ui/core/Link'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

const MESSAGE = `CiteNet is currently in development. However, due to the COVID-19 pandemic we have opted
to: 1. make CiteNet available to the public and 2. index bioRxiv and medRxiv on a nightly basis. We hope to provide
a useful, up-to-date literature search tool for the scientific community.`

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    top: theme.spacing(2)
  },
  card: {
    backgroundColor: 'red',
    color: 'white'
  },
  link: {
    color: 'white'
  }

}))

const AlertBanner = () => {
  const classes = useStyles()

  return (
    <Container className={classes.root}>
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom>
            {MESSAGE}
          </Typography>
          <Link href="/covid-disclaimer" className={classes.link} underline="always">
            Please read our disclaimer.
          </Link>
        </CardContent>
      </Card>
    </Container>
  )
}

export default AlertBanner