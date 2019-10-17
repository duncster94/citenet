import React from "react"

import Grid from "@material-ui/core/Grid"
import CircularProgress from "@material-ui/core/CircularProgress"

import { Redirect } from "react-router-dom"

import queryString from "query-string"

import ViewSidebar from "./ViewSidebar"
import RankView from "./RankView"
import NetworkView from "./NetworkView"
import "./View.css"

export default function View(props) {

    const [redirect, setRedirect] = React.useState(false)
    const [searchResults, setSearchResults] = React.useState(null)
    const [searchQueue, setSearchQueue] = React.useState([])

    // Equivalent to `componentDidMount`.
    React.useEffect(() => {
      let paperIDs = queryString.parse(props.location.search, {arrayFormat: 'comma'})

      // Check if `paperIDs` is empty and if so, redirect to 404.
      if (Object.entries(paperIDs).length === 0) {
        setRedirect(true)
  
      } else {
  
        // Put singleton in array.
        if (!Array.isArray(paperIDs.id)) {
          paperIDs = {id: [paperIDs.id]}
        }
  
        fetch("/submit_paper", { 
          method: "POST",
          body: JSON.stringify(paperIDs.id),
          headers: {"Content-Type": "application/json"},
        })
          .then(response => response.json())
          .then(function(response) {
            setSearchQueue(response.seeds)
            setSearchResults(response)
            console.log(response)
          })
      }
    }, [])
  
    // Redirect to 404 if no query string is passed.
    if (redirect) {
      return <Redirect to="/404" />
    
    // Render loading screen if `fetch` promise has not yet resolved.
    } else if (!searchResults) {
      return (
        <LoadingIndicator />
      )

    // Render appropriate view when `fetch` resolves.
    } else {
      if (props.match.params.view === "rank") {
        return (
          <React.Fragment>
            <RankView props={{searchResults, searchQueue, setSearchQueue}} />
            <ViewSidebar props={{searchQueue, view: "rank"}}/>
          </React.Fragment>
        )
      } else {
        return (
          <React.Fragment>
            <NetworkView props={{searchResults, searchQueue, setSearchQueue}}/>
            <ViewSidebar props={{searchQueue, view: "network"}}/>
          </React.Fragment>
        )
      }
    }
  }

function LoadingIndicator() {
  return (
    <div className="loading-indicator">
      <Grid
        container
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <CircularProgress />
        </Grid>
      </Grid>
    </div>
  )
}