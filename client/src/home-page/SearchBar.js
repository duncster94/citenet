import React from "react"

import { withRouter } from "react-router-dom"

import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import ButtonGroup from "@material-ui/core/ButtonGroup"
import Grid from "@material-ui/core/Grid"
import Hidden from "@material-ui/core/Hidden"
import ListSubheader from "@material-ui/core/ListSubheader"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"
import { makeStyles } from "@material-ui/core/styles"


import AsyncSelect from "react-select/async"
import debounce from "debounce-promise"
import Icon from "@mdi/react"
import { 
  mdiChevronDown, 
  mdiMagnify,
  mdiGraphOutline,
  mdiFormatListBulleted, 
} from "@mdi/js"
import queryString from "query-string"
import theme from "../Theme"

const viewOptions = [
  "Ranked List",
  "Network"
]

const useStyles = makeStyles(theme => ({
  optionTitle: {
    textOverflow: 'ellipsis',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1em'
    }
  },
  optionAuthors: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.9em'
    }
  },

}))

export default withRouter(function SearchBar(props) {

  const {
    selectedView,
    setSelectedView,
    selectedPapers,
    setSelectedPapers,
    searchBarValue,
    setSearchBarValue,
    inputValue,
    setInputValue,
    defaultOptions,
    setDefaultOptions,
    menuOpen,
    setMenuOpen,
    key
  } = props.props
  const classes = useStyles()

  function formatOptionLabel(values) {
    // Custom option component

    const authorString = values.labels.Authors.map(function (element) {
      if (element.Initials === undefined) {
        return element.LastName
      }
      return `${element.Initials} ${element.LastName}`
    }).join(", ")
    return (
      <Grid container>
        <Grid item xs={values.labels.is_preprint ? 10 : 12}>
          <Typography
            variant="body1"
            color="textPrimary"
            className={classes.optionTitle}
          >
            {values.labels.Title}
          </Typography>
        </Grid>

        <Grid
          item
          xs={2}
          style={{
            display: values.labels.is_preprint ? "block" : "none"
          }}
        >
          <Box fontStyle="italic" color={theme.palette.secondary.main}>
            <Hidden xsDown>
              <Typography
                align="right"
                variant="subtitle2"
              >
                Preprint
              </Typography>
            </Hidden>
            <Hidden smUp>
              <Typography
                align="right"
                variant="subtitle2"
                style={{
                  fontSize: '0.9em'
                }}
              >
                P
              </Typography>
            </Hidden>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            className={classes.optionAuthors}
          >
            {authorString}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  function loadOptions(input) {

    return (
      fetch("/homepage_search_query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: input })
      })
        .then(response => response.json())
        .then(function (response) {
          return (
            response.map(function (element) {
              return {
                "value": element._id,
                "labels": element._source
              }
            })
          )
        })
    )
  }

  function handleChange(event) {
    if (event) {
      // Extract unique identifiers from `event` array.
      setSelectedPapers(event.map(paper => paper.value))
      setSearchBarValue(event.map(paper => paper))
    } else {
      setSelectedPapers(null)
      setSearchBarValue(null)
    }
  }

  function IndicatorsContainer() {
    /* A `react-select` specific container that wraps the
    view select button and menu and search button. This is necessary
    to properly render `material-ui` components inside the
    `react-select` searchbar.
    */
    props = {
      selectedView,
      setSelectedView,
      selectedPapers,
      history: props.history
    }
    return <MenuSearchButtons props={props}/>
  }

  function handleInputChange(value, action) {
    if (action.action !== 'input-blur' && action.action !== 'menu-close') {
      setInputValue(value)
    }
    setDefaultOptions(false)
  }

  function handleFocus() {
    setMenuOpen(true)
    // setDefaultOptions(false)
  }

  function handleBlur(event) {
    event.preventDefault()
    setMenuOpen(false)
    // setDefaultOptions(false)
  }

  return (
    <AsyncSelect
      isMulti
      value={searchBarValue}
      loadOptions={debounce(loadOptions, 250)}

      defaultOptions={defaultOptions}
      menuIsOpen={menuOpen}
      key={JSON.stringify(key)}

      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      formatOptionLabel={formatOptionLabel}
      components={{IndicatorsContainer}}
      placeholder="Search for papers"
      
      onInputChange={handleInputChange}
      inputValue={inputValue}

      theme={(theme_) => ({
        ...theme_,
        colors: {
          ...theme_.colors,
          primary: theme.palette.secondary.main,
          primary25: "#eeeeee"
        }
      })}
      styles={{
        menuList: base => ({
          ...base,
          maxHeight: "40vh",
        }),
        option: base => ({
          ...base,
          borderBottom: `0.5px solid #eee`,
          paddingTop: '15px',
          paddingBottom: '15px',
          [theme.breakpoints.down('xs')]: {
            fontSize: '0.7em'
          }
        }),
        placeholder: base => ({
          ...base,
          [theme.breakpoints.down('xs')]: {
            fontSize: '0.7em'
          }
        })
      }}
    />
  )
})

function MenuSearchButtons({ props }) {
  /* Component containing view option dropdown and search button.
  NOTE: This component MUST be kept separate from the `SearchBar`
  component, otherwise the `Menu` subcomponent will not anchor to
  drop down button. 
  See https://github.com/mui-org/material-ui/issues/8090#issuecomment-391648314
  */

  const [anchorEl, setAnchorEl] = React.useState(null)

  function handleToggle(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleMenuItemClick(_, index) {
    props.setSelectedView(index)
    setAnchorEl(null)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  function handleClick() {

    // Create query string.
    const query = queryString.stringify({ id: props.selectedPapers }, 
      { arrayFormat: "comma" })
    let view
    if (props.selectedView === 0) {
      view = "rank"
    } else {
      view = "network"
    }
    // Switch to view.
    props.history.push(`/view/${view}?${query}`)
  }

  return (
    <div
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
    >
      <ButtonGroup
        variant="text"
        size="large"
      >
        <Tooltip
          title="Select view"
          placement="top"
          enterDelay={500}
          leaveDelay={100}
        >
          <Button
            aria-haspopup="true"
            onClick={handleToggle}
          >
            <Icon
              path={mdiChevronDown}
              size={1}
              color={theme.palette.primary.black}
            />
          </Button>
        </Tooltip>
        <Button
          onClick={handleClick}
          // Check if `selectedPapers` is an array (default is null)
          disabled={!Boolean(props.selectedPapers) || props.selectedPapers.length === 0}
        >
          <Icon
            path={mdiMagnify}
            size={1}
            color={
              !Boolean(props.selectedPapers) ?
              "#ccc" :
              theme.palette.primary.black
            }
          />
        </Button>
      </ButtonGroup>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
      >
        <ListSubheader>
          <Box fontWeight="fontWeightBold">
            Views
          </Box>
        </ListSubheader>

        {viewOptions.map((option, index) => (
          <MenuItem
            key={option}
            onClick={event => handleMenuItemClick(event, index)}
            selected={index === props.selectedView}
          >
            <ListItemIcon>
              <Icon
                path={option === "Ranked List" ?
                  mdiFormatListBulleted :
                  mdiGraphOutline}
                size={1}
              />
            </ListItemIcon>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}
