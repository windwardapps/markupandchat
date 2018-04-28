import React, { Component } from 'react';
import axios from 'axios';

import './Home.css';

class Home extends Component {
  onClick = async () => {
    const res = await axios.post('/api/rooms');
    this.props.history.push(`/rooms/${res.data.id}`);
  };

  render() {
    return (
      <div className="Home flex-row">
        <div className="content flex-main">
          <div className="flex-main">
            <h1>MarkupAndChat</h1>
            <h2>Free, private rooms to chat over images and mark them up</h2>
            <h3>Features</h3>
            <p> Create a private room with a shareable link</p>
            <p> Upload an image to your room</p>
            <p> Use the chatbox to discuss your image</p>
            <p> Use the drawing tools to collaborate with your team</p>
            <p>Once you're finished, save the results to a new image that contains all messages and markup</p>
          </div>
        </div>
        <div className="flex-row align-center justify-center flex-main">
          <button onClick={this.onClick}>CREATE A ROOM</button>
        </div>
      </div>
    );
  }
}

export default Home;
