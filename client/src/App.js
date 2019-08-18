import React from 'react';
import './App.css';

import HomePage from './home-page/HomePage'


export default function App() {

  // State for view selector.
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const buttonProps = {
    selectedIndex,
    setSelectedIndex
  }

  return (
    <React.Fragment>
      <HomePage buttonProps={buttonProps}/>
    </React.Fragment>
  )
}
