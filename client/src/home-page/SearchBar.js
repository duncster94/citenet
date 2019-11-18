import React from "react"

import { withRouter } from "react-router-dom"

import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import ButtonGroup from "@material-ui/core/ButtonGroup"
import ListSubheader from "@material-ui/core/ListSubheader"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import Typography from "@material-ui/core/Typography"

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

const optionStyles = {
  root: {
    display: "flex",
    flexDirection: "column"
  }
}

export default withRouter(function SearchBar(props) {

  const { 
    selectedView, 
    setSelectedView, 
    selectedPapers, 
    setSelectedPapers
  } = props.props

  function formatOptionLabel(values) {
    // Custom option component

    const authorString = values.labels.authors.map(function (element) {
      return `${element.Initials} ${element.LastName}`
    }).join(", ")
    return (
      <div style={optionStyles.root}>
        <Typography
          variant="subtitle2"
          color="textPrimary"
        >
          {values.labels.title}
        </Typography>
        <Typography
          variant="caption"
          color="textSecondary"
        >
          {authorString}
        </Typography>
      </div>
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
    } else {
      setSelectedPapers(null)
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

  return (
    <AsyncSelect
      isMulti
      loadOptions={debounce(loadOptions, 250)}
      onChange={handleChange}
      formatOptionLabel={formatOptionLabel}
      components={{IndicatorsContainer}}
      placeholder="Enter paper title or author name(s)."
      theme={(theme_) => ({
        ...theme_,
        colors: {
          ...theme_.colors,
          primary: theme.palette.primary.main,
          primary25: theme.palette.primary.mainLight
        }
      })}
      // styles={{
      //   control: (provided) => ({
      //     ...provided,
      //     borderColor: "white",
      //     minHeight: "5px",
      //     borderRight: "0px",
      //     borderRadius: "5px 0 0 5px",
      //     boxShadow: "1px 0.8px 2.6px 0px hsl(0,0%,50%)",
      //     marginTop: "2px",
      //     marginBottom: "1px"
      //   })
      // }}
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
    >
      <ButtonGroup
        variant="text"
        size="small"
        style={{boxShadow: "0px 0px 0px 0px"}}
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
        <Button
          onClick={handleClick}
          // Check if `selectedPapers` is an array (default is null)
          disabled={!Boolean(props.selectedPapers)}
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
