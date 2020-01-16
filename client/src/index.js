import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from "react-router-dom"
import './index.css';
import App from './App';
import ReactGA from 'react-ga'
import { createBrowserHistory } from 'history'
import * as serviceWorker from './serviceWorker';

ReactGA.initialize('UA-156373378-1', {
  gaOptions: {
    siteSpeedSampleRate: 100
  }
})

// const history = createBrowserHistory()

// history.listen(location => {
//   ReactGA.set({ page: location.pathname })
//   ReactGA.pageview(location.pathname)
// })

ReactGA.pageview(window.location.pathname + window.location.search)

ReactDOM.render(
  <BrowserRouter>
    <Route component={App} />
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
