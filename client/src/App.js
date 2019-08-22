import React from 'react';
import './App.css';

import HomePage from './home-page/HomePage'


export default function App() {

  // Props for view selector.
  const [selectedView, setSelectedView] = React.useState(0)
  const buttonProps = {
    selectedView,
    setSelectedView
  }

  // Props for selected papers.
  const [selectedPapers, setSelectedPapers] = React.useState([])
  const searchBarProps = {
    selectedPapers,
    setSelectedPapers
  }

  // Package all props.
  const props = {
    buttonProps,
    searchBarProps
  }

  return (
    <React.Fragment>
      <HomePage props={props}/>
    </React.Fragment>
  )
}
