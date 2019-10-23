import React from "react"
import { withRouter, Route, Switch, Redirect } from "react-router-dom"
import { TransitionGroup, CSSTransition } from "react-transition-group"
import { MuiThemeProvider } from "@material-ui/core/styles"

import "./App.css"
import theme from "./Theme"
import HomePage from "./home-page/HomePage"
import View from "./views/View"
import GenericNotFound from "./navigation-error/GenericNotFound"


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
    <MuiThemeProvider theme={theme}>
      <TransitionGroup component={null}> {/* `null` component avoids wrapper div */}
        <CSSTransition
          key={props.location.key}
          timeout={1000}
          classNames="fade-transition"
          unmountOnExit
          appear
        >

          <Switch location={props.location}>
            <Route exact path="/" render={() => <HomePage props={homePageProps} />} />
            <Route path="/view/:view" component={View} />
            <Route path="/404" component={GenericNotFound} />
            <Redirect to="/404" />
          </Switch>

        </CSSTransition>
      </TransitionGroup>
    </MuiThemeProvider>
  )
})
