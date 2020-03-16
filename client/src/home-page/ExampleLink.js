import React from 'react'
import Link from '@material-ui/core/Link'

const ExampleLink = ({ props }) => {

  const {
    setSelectedPapers,
    setSearchBarValue,
    setInputValue,
    setDefaultOptions,
    setMenuOpen,
    setKey
  } = props

  async function fetchExample() {

    // const IDS = ["10.1101/2020.01.29.924100","10.1101/2020.03.07.981928"]
    const INPUT_TEXT = "sars cov 2 protease"
    const IDS = ["10.1101/2020.01.29.924100"]

    const res = await fetch("/fetch_example", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value: IDS
      })
    })
    const data = await res.json()
    const formattedData = data.map(function(element) {
      return {
        value: element._id,
        labels: element._source
      }
    })

    setSelectedPapers(IDS)
    setSearchBarValue(formattedData)
    setInputValue(INPUT_TEXT)
    setDefaultOptions(true)
    setMenuOpen(true)
    setKey(+new Date())
  }

  return (
    <Link component="button" onClick={fetchExample}>Show me an example</Link>
  )
}

export default ExampleLink