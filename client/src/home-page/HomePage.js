import React from "react"
import Grid from "@material-ui/core/Grid"
import Hidden from "@material-ui/core/Hidden"
import Link from "@material-ui/core/Link"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"

import SearchBar from "./SearchBar"
import ContactForm, { ContactLink } from "../generic-components/ContactForm"
import ExampleLink from "./ExampleLink"
import MobileWarning from "../generic-components/MobileWarning"
import AlertBanner from "../generic-components/AlertBanner"

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    position: "absolute",
    flexGrow: 1,
    height: "inherit",
    width: "inherit",
    overflow: 'hidden'
  },
  aboutLink: {
    position: "absolute",
    top: "15px",
    left: "20px",
    fontSize: "14px",
  },
  versionText: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    fontSize: "10px",
    // [theme.breakpoints.down('xs')]: {
    //   display: "none"
    // }
  },
  logo: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "50%",
    [theme.breakpoints.down('xs')]: {
      maxWidth: "95%"
    },
    height: "auto",
  },
  search: {
    marginTop: '30vh',
  },
  searchBarRoot: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: "5px",
      paddingRight: "5px"
    }
  },
  contactLinkRoot: {
    position: "absolute",
    bottom: theme.spacing(2),
    left: theme.spacing(2)
  }
}))

export default function HomePage({ props }) {

  const classes = useStyles()

  // search bar state
  const [searchBarValue, setSearchBarValue] = React.useState(null)
  const [inputValue, setInputValue] = React.useState("")
  const [defaultOptions, setDefaultOptions] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [contactOpen, setContactOpen] = React.useState(false)
  const [key, setKey] = React.useState(+new Date())

  const searchProps = {
    searchBarValue,
    setSearchBarValue,
    inputValue,
    setInputValue,
    defaultOptions,
    setDefaultOptions,
    menuOpen,
    setMenuOpen,
    key,
    setKey
  }
  const { setSelectedPapers } = props

  return (
    <>
      <div className={classes.root}>

        <Hidden smUp>
          <MobileWarning />
        </Hidden>

        <Grid container direction="column" justify="center" alignItems="center">
          <AlertBanner />

          <Grid item xs>
            <Grid
              container
              className={classes.search}
              justify="center"
              alignItems="center"
            >
              <Grid item>
                <Logo />
              </Grid>

              <Grid item xs={12} sm={8} className={classes.searchBarRoot}>
                {/* Paper select bar */}
                <SearchBar props={{...props, ...searchProps}} />
              </Grid>

              <Grid item xs={8} style={{ marginTop: "20px" }}>
                <Grid container justify="center">
                  <ExampleLink props={{ setSelectedPapers, ...searchProps }} />
                </Grid>
              </Grid>

            </Grid>
          </Grid>
        </Grid>
      </div>
      {/* <AboutLink /> */}
      <ContactForm props={{contactOpen, setContactOpen}}/>
      <div className={classes.contactLinkRoot}>
        <ContactLink props={{setContactOpen}}/>
      </div>
      <VersionText />
    </>
  );
}

function Logo() {

  const classes = useStyles()

  return (
    <img
      className={classes.logo}
      alt="CiteNet logo"
      src="/images/citenet_logo.png"
    />
  )
}

function AboutLink() {

  const classes = useStyles()

  return (
    <Typography className={classes.aboutLink}>
      <Link href="/about">
        About
      </Link>
    </Typography>
  )
}

function VersionText() {
  const classes = useStyles()
  return (
    <Typography
      className={classes.versionText}
      color='textSecondary'
    >
      Build 0.1.0-alpha
    </Typography>
  )
}