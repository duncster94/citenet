import React from "react"
import { withRouter, Route, Switch } from "react-router-dom"
import { TransitionGroup, CSSTransition } from "react-transition-group"

import "./App.css"
import HomePage from "./home-page/HomePage"


export default withRouter(function App(props) {

  // State for whether the user has searched.
  const [isSearched, setIsSearched] = React.useState(false)

  // Props for view selector.
  const [selectedView, setSelectedView] = React.useState(0)
  
  // Props for selected papers.
  const [selectedPapers, setSelectedPapers] = React.useState(null)

  const buttonProps = {
    selectedView,
    setSelectedView,
    setIsSearched,
    selectedPapers
  }

  const searchBarProps = {
    isSearched,
    setSelectedPapers
  }

  // Package all props.
  const homePageProps = {
    buttonProps,
    searchBarProps
  }

  return (
    // `null` component avoids wrapper div
    <TransitionGroup component={null}>
      <CSSTransition
        key={props.location.key}
        timeout={1000}
        classNames="fade-transition"
        unmountOnExit
        appear
      >

        <Switch location={props.location}>
          <Route exact path="/" render={() => <HomePage props={homePageProps} />} />
          <Route path="/rank" component={rankTest}/>
          <Route path="/network" component={networkTest}/>
        </Switch>

      </CSSTransition>
    </TransitionGroup>
  )
})

function rankTest() {
  return (
    <div style={{position: "absolute"}}>rank view</div>
  )
}

function networkTest() {
  return (
    <div style={{position: "absolute"}}>network view</div>
  )
}