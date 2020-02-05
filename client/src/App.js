import React from "react"
import { withRouter, Route, Switch, Redirect } from "react-router-dom"
import { MuiThemeProvider } from "@material-ui/core/styles"

import "./App.css"
import theme from "./Theme"
import HomePage from "./home-page/HomePage"
import AboutPage from "./home-page/AboutPage"
import View from "./views/View"
import GenericNotFound from "./navigation-error/GenericNotFound"


export default withRouter(function App(props) {

  // State for whether the user has searched.
  const [isSearched, setIsSearched] = React.useState(false)

  // Props for view selector.
  const [selectedView, setSelectedView] = React.useState(0)
  
  // Props for selected papers.
  const [selectedPapers, setSelectedPapers] = React.useState(null)

  const homePageProps = {
    selectedView,
    setSelectedView,
    setIsSearched,
    selectedPapers,
    isSearched,
    setSelectedPapers
  }

  return (
    <MuiThemeProvider theme={theme}>
      <Switch >
        <Route exact path="/" render={() => <HomePage props={homePageProps} />} />
        <Route path="/about" component={AboutPage} />
        <Route path="/view/:view" component={View} />
        <Route path="/404" component={GenericNotFound} />
        <Redirect to="/404" />
      </Switch>
    </MuiThemeProvider>
  )
})
