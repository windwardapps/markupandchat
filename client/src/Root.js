import React, { Component } from 'react';
import App from './app/App';
import Home from './home/Home';
import './Root.css';

class Root extends Component {

  state = {
    room: null
  }

  onCreateRoomClick = () => {
    this.setState({ room: new Room() })
  }

  render() {
    const { room } = this.state;
    return room ? <App room={room} /> : <Home onCreateRoomClick={this.onCreateRoomClick} />
  }
}

export default Root;
