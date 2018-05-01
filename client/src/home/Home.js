import React, { Component } from 'react';
import axios from 'axios';
import drawIcon from '../assets/draw.svg';
import plusIcon from '../assets/plus.svg';
import chatIcon from '../assets/chat.svg';

import './Home.css';

class Home extends Component {
  onClick = async () => {
    const res = await axios.post('/api/rooms');
    this.props.history.push(`/rooms/${res.data.id}`);
  };

  render() {
    return (
      <div className="Home">
        <div className="content flex-main">
          <div className="flex-main">
            <h1>
              <div className="flex-row align-center logo">
                <img className="draw" src={drawIcon} />
                <img className="plus" src={plusIcon} />
                <img className="chat" src={chatIcon} />
              </div>
              <span className="name">MarkupAndChat</span>
            </h1>
            <h2>Free, private rooms to chat over images and mark them up</h2>
            <h3>Features and workflow:</h3>
            <p> Create a private room</p>
            <p> Share the link to your room with coworkers</p>
            <p> Upload an image to your room</p>
            <p> Use the chatbox to discuss your image</p>
            <p> Use the drawing tools to collaborate with your team</p>
            <p>Once you're finished, save the results to a file that contains the image with all markup and messages</p>
          </div>
        </div>
        <div className="flex-row align-center justify-center flex-main form">
          <button onClick={this.onClick}>CREATE A ROOM</button>
        </div>
      </div>
    );
  }
}

export default Home;
