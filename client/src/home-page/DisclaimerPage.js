import React from 'react'
import Container from '@material-ui/core/Container'
import Link from "@material-ui/core/Link"
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

import Bold from '../generic-components/Bold'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    width: 'inherit',
    marginTop: theme.spacing(4),
  },
  homeLink: {
    position: "absolute",
    top: "15px",
    left: "20px",
    fontSize: "14px"
  }
}))

const Disclaimer = () => {

  const classes = useStyles()

  return (
    <>
      <div className={classes.root}>
      <Container maxWidth="md">
        <Typography variant="h2" gutterBottom>
          Disclaimer
        </Typography>
        <Typography>
          While we are making considerable efforts to ensure CiteNet indexes all bioRxiv and medRxiv papers and remains up-to-date in light
          of the COVID-19 pandemic, <Bold>we make no guarantees about any aspect of CiteNet or its database therein.</Bold>
        </Typography>
      </Container>
      </div>
      <Typography className={classes.homeLink}>
        <Link href="/">
          Home
        </Link>
      </Typography>
    </>
  )
}

export default Disclaimer