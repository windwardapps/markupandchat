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
    user: {},
    name: '',
    isEditing: false
  };

  async componentDidMount() {
    const { id } = this.props.match.params;
    const res = await axios.get(`/api/rooms/${id}`);

    const socket = (this.socket = io('http://localhost:3002'));
    socket.on('connect', () => {
      socket.emit('joinroom', { roomId: id, userId: res.data.user.id });
      socket.on('chatmessage', this.onChatMessage);
      socket.on('updateusers', this.onUpdateUsers);
      socket.on('createshape', this.onCreateShape);
      socket.on('updateshape', this.onUpdateShape);
    });

    this.setState(res.data);
  }

  onChatMessage = message => {
    this.setState({ messages: this.state.messages.concat(message) });
  };

  onUpdateUsers = users => {
    this.setState({ users });
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

  updateUser = async () => {
    const { user, name } = this.state;
    if (!name.trim()) {
      return this.setState({ isEditing: false });
    }

    const res = await axios.put(`/api/users/${user.id}`, {
      name,
      roomId: this.state.room.id
    });
    this.setState({ isEditing: false, name: '', user: res.data });
  };

  render() {
    const { room, user, users, messages, isEditing, name } = this.state;
    return (
      <div className="App flex-col">
        <header className="App-header flex-row align-center">
          <div className="logo">MarkupAndChat</div>
          <div className="flex-main flex-row align-center">
            <div>Room ID: {room.id}</div>
            <div className="username-wrapper">
              <span>Your name: </span>
              {isEditing ? (
                <input
                  value={name}
                  onChange={e => this.setState({ name: e.target.value })}
                  onBlur={this.updateUser}
                  autoFocus
                />
              ) : (
                <span
                  className="username"
                  onClick={() =>
                    this.setState({ isEditing: true, name: user.name })
                  }>
                  {user.name}
                </span>
              )}
            </div>
          </div>
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
