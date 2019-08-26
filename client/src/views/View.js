import React from "react"

import { Redirect } from "react-router-dom"

import queryString from "query-string"

export default function View(props) {

    const [redirect, setRedirect] = React.useState(false)
  
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
  
        fetch("/submit_paper", { method: "POST",
                                body: JSON.stringify(paperIDs.id),
                                headers: {"Content-Type": "application/json"},
        })
          .then(r => r.json())
          .then(r => {console.log(r)})
      }
    }, [])
  
    if (redirect) {
      return <Redirect to="/404" />
    } else {
      return (
        <div style={{position: "absolute"}}>view</div>
      )
    }
  }