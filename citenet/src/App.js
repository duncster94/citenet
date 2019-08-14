import React from 'react';
import logo from './logo.svg';
import './App.css';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import HomePage from './components/HomePage'

class App extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (
      <HomePage />
    )
  }
}

export default App
