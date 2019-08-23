import React from 'react';
import './App.css';

import HomePage from './home-page/HomePage'


export default function App() {

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
    setSelectedPapers
  }

  // Package all props.
  const props = {
    buttonProps,
    searchBarProps
  }

  // Determine which page is displayed
  let page
  if (isSearched) {
    page = <div>loading...</div>
  } else {
    page = <HomePage props={props} />
  }

  return (
    <React.Fragment>
      {page}
    </React.Fragment>
  )
}
