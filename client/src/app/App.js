import React, { Component } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Chat from '../chat/Chat';

import './App.css';

class App extends Component {
  state = {
    room: {},
    users: {},
    messages: [],
    user: {}
  };

  async componentDidMount() {
    const { id } = this.props.match.params;
    const res = await axios.get(`/api/rooms/${id}`);

    const socket = (this.socket = io('http://localhost:3002'));
    socket.on('connect', () => {
      socket.emit('joinroom', { roomId: id, userId: res.data.user.id });
      socket.on('chatmessage', this.onChatMessage);
      socket.on('createshape', this.onCreateShape);
      socket.on('updateshape', this.onUpdateShape);
    });

    this.setState(res.data);
  }

  onChatMessage = message => {
    this.setState({ messages: this.state.messages.concat(message) });
  };

  onCreateShape = data => {
    debugger;
  };

  onUpdateShape = data => {
    debugger;
  };

  onCreateMessageClick = text => {
    this.socket.emit('chatmessage', {
      text,
      userId: this.state.user.id
    });
  };

  render() {
    const { room, users, messages } = this.state;
    return (
      <div className="App flex-col">
        <header className="App-header flex-row align-center">
          <div className="logo">MarkupAndChat</div>
          <div className="flex-main">Room ID: {room.id}</div>
        </header>
        <div className="flex-row flex-main">
          <Chat
            messages={messages}
            users={users}
            onCreateMessageClick={this.onCreateMessageClick}
          />
          <div className="flex-main">Markup</div>
        </div>
      </div>
    );
  }
}

export default App;
