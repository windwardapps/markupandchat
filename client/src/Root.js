import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import App from './app/App';
import Home from './home/Home';

import './Root.css';

class Root extends Component {

  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={Home} />
          <Route path="/rooms/:id" component={App} />
        </div>
      </Router>
    )
  }
}

export default Root;
