import React from "react"

import Grid from "@material-ui/core/Grid"
import CircularProgress from "@material-ui/core/CircularProgress"

import { Redirect } from "react-router-dom"

import queryString from "query-string"

import ViewSidebar from "./ViewSidebar"
import AlertSnackbar from '../generic-components/AlertSnackbar'
import RankView from "./RankView"
import NetworkView from "./NetworkView"
import "./View.css"

export default function View(props) {

  const [redirect, setRedirect] = React.useState(false)
  const [searchResults, setSearchResults] = React.useState(null)
  const [searchQueue, setSearchQueue] = React.useState([])
  const [readNodes, setReadNodes] = React.useState(
    new Set(JSON.parse(localStorage.getItem('readNodes')))
  )
  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false)
  const [snackbarStatus, setSnackbarStatus] = React.useState(null)

  // Equivalent to `componentDidMount`.
  React.useEffect(() => {
    let paperIDs = queryString.parse(props.location.search, { arrayFormat: 'comma' })

    // Check if `paperIDs` is empty and if so, redirect to 404.
    if (Object.entries(paperIDs).length === 0) {
      setRedirect(true)

    } else {

      // Put singleton in array.
      if (!Array.isArray(paperIDs.id)) {
        paperIDs = { id: [paperIDs.id] }
      }

      async function submitPaper() {
        const res = await fetch("/submit_paper", {
          method: "POST",
          body: JSON.stringify(paperIDs.id),
          headers: { "Content-Type": "application/json" },
        })
        if (res.status && res.status !== 200) {
          console.log(res)
          // TODO: redirect to more informative error page
          setRedirect(true)
          return
        }
        const data = await res.json()
        setSearchQueue(data.seeds)
        setSearchResults(data)
      }

      submitPaper()
    }
  }, [])

  function handleReadNodeClick(clickedNodeId) {
    // const clickedNodeId = pixelIntervals[interval].id
    let returnStatus
    const readNodes_ = JSON.parse(localStorage.getItem('readNodes'))
    if (!readNodes_) {
      localStorage.setItem('readNodes', JSON.stringify([clickedNodeId]))
      setReadNodes(new Set([clickedNodeId]))
      returnStatus = 'added'
    } else {
      const readNodesSet = new Set(readNodes_)
      if (readNodesSet.has(clickedNodeId)) {
        // remove node from `readNodes`
        readNodesSet.delete(clickedNodeId)
        returnStatus = 'removed'
      } else {
        // add node to `readNodes`
        readNodesSet.add(clickedNodeId)
        returnStatus = 'added'
      }
      localStorage.setItem('readNodes', JSON.stringify(Array.from(readNodesSet)))
      setReadNodes(readNodesSet)
    }
    setSnackbarStatus(returnStatus)
    setIsSnackbarOpen(true)
    return returnStatus
  }

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
    const viewProps = {
      searchResults,
      searchQueue,
      setSearchQueue,
      readNodes,
      handleReadNodeClick
    }
    if (props.match.params.view === "rank") {
      return (
        <React.Fragment>
          <RankView props={viewProps} />
          <ViewSidebar props={{ searchQueue, view: "rank" }} />
          <AlertSnackbar
            status={snackbarStatus}
            isOpen={isSnackbarOpen}
            setIsOpen={setIsSnackbarOpen}
          />
        </React.Fragment>
      )
    } else {
      return (
        <React.Fragment>
          <NetworkView props={viewProps} />
          <ViewSidebar props={{ searchQueue, view: "network" }} />
          <AlertSnackbar
            status={snackbarStatus}
            isOpen={isSnackbarOpen}
            setIsOpen={setIsSnackbarOpen}
          />
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
          <CircularProgress color="secondary"/>
        </Grid>
      </Grid>
    </div>
  )
}