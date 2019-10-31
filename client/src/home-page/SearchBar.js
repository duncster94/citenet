import React from "react"
import Typography from "@material-ui/core/Typography"
import AsyncSelect from "react-select/async"
import debounce from "debounce-promise"


const optionStyles = {
  root: {
    display: "flex",
    flexDirection: "column"
  }
}

export default function SearchBar(props) {

  const { setSelectedPapers } = props.props

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

  return (
    <AsyncSelect
      isMulti
      loadOptions={debounce(loadOptions, 250)}
      onChange={handleChange}
      formatOptionLabel={formatOptionLabel}
      components={
        {
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null
        }
      }
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: "#ffae00",
          primary25: "#ffeeca"
        }
      })}
      styles={{
        control: (provided) => ({
          ...provided,
          borderColor: "white",
          minHeight: "5px",
          borderRight: "0px",
          borderRadius: "5px 0 0 5px",
          boxShadow: "1px 0.8px 2.6px 0px hsl(0,0%,50%)",
        })
      }}
    />
  )
}