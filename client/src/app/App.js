import React, { Component } from 'react';
import { Portal } from 'react-portal';
import _ from 'lodash';
import axios from 'axios';
import io from 'socket.io-client';
import randomColor from 'randomcolor';
import Chat from '../chat/Chat';
import Markup from '../markup/Markup';
import store from '../store';
import { SketchPicker } from 'react-color';

import './App.css';

const initialColor = localStorage.color || (localStorage.color = randomColor());

class App extends Component {
  state = {
    room: {},
    shapes: [],
    users: [],
    messages: [],
    user: {},
    name: '',
    isEditing: false,
    color: initialColor,
    showPicker: false,
    pickerStyle: {}
  };

  async componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);

    const { id } = this.props.match.params;
    const res = await axios.get(`/api/rooms/${id}`);

    const socket = (this.socket = io('http://localhost:3002'));
    socket.on('connect', () => {
      socket.emit('joinroom', { roomId: id, userId: res.data.user.id });
      socket.on('chatmessage', this.receiveNewMessage);
      socket.on('updateusers', this.receiveUsers);
      socket.on('createshape', this.receiveNewShape);
      socket.on('updateshape', this.receiveUpdatedShape);
      socket.on('deleteshape', this.receiveDeletedShape);
    });

    store.userId = res.data.user.id;
    this.setState(res.data);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onClick = e => {
    if (this.state.showPicker) {
      this.hidePicker();
    }
  };

  onKeyDown = e => {
    if (
      this.state.showPicker &&
      (e.code === 'Escape' || e.keyCode === 27 || e.which === 27)
    ) {
      this.hidePicker();
    }
  };

  receiveNewMessage = message => {
    this.setState({ messages: this.state.messages.concat(message) });
  };

  receiveUsers = users => {
    this.setState({ users });
  };

  receiveNewShape = shape => {
    this.setState({ shapes: this.state.shapes.concat(shape) });
  };

  receiveUpdatedShape = shape => {
    this.setState({
      shapes: this.state.shapes.filter(s => s.id !== shape.id).concat(shape)
    });
  };

  receiveDeletedShape = id => {
    this.setState({
      shapes: this.state.shapes.filter(s => s.id !== id)
    });
  };

  onCreateMessageClick = text => {
    this.socket.emit('chatmessage', {
      text,
      userId: this.state.user.id
    });
  };

  onUploadImageClick = async file => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axios.put(`/api/rooms/${this.state.room.id}`, formData);
    this.setState({ room: res.data });
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

  onCreateShape = (id, type, data) => {
    this.socket.emit('createshape', {
      id,
      userId: this.state.user.id,
      type,
      data
    });
  };

  onUpdateShape = shape => {
    this.socket.emit('updateshape', shape);
  };

  onDeleteShape = id => {
    this.socket.emit('deleteshape', id);
  };

  onColorClick = e => {
    const rect = e.target.getBoundingClientRect();
    const pickerStyle = {
      position: 'absolute',
      top: rect.bottom + 3,
      left: rect.left - 90
    };

    this.setState({ showPicker: true, pickerStyle });
  };

  onColorChange = color => {
    localStorage.color = color.hex;
    this.setState({ color: color.hex });
    this.state.shapes
      .filter(s => s.createdBy === this.state.user.id)
      .forEach(shape => {
        const updatedShape = _.cloneDeep(shape);
        updatedShape.data.stroke = color.hex;
        this.onUpdateShape(updatedShape);
      });
  };

  hidePicker = () => {
    this.setState({ showPicker: false, pickerStyle: {} });
  };

  onDoneClick = () => {
    this._markupRef.setState({ scale: 1 });
    setTimeout(async () => {
      const svg = document.querySelector('.Svg svg');
      const img = document.querySelector('.Svg img');
      const canvas = document.createElement('canvas');
      const newSvg = document.createElement('svg');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const url = canvas.toDataURL();

      newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      newSvg.setAttribute('viewBox', `0 0 ${img.width} ${img.height}`);
      newSvg.setAttribute('width', `${img.width}px`);
      newSvg.setAttribute('height', `${img.height}px`);
      newSvg.style.width = `${img.width}px`;
      newSvg.style.height = `${img.height}px`;
      newSvg.style.backgroundImage = `url(${url})`;
      newSvg.style.backgroundSize = `contain`;
      newSvg.style.backgroundRepeat = `no-repeat`;
      newSvg.innerHTML = svg.innerHTML;

      const svgString =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        new XMLSerializer().serializeToString(newSvg);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const formData = new FormData();
      formData.append('image', blob);
      const res1 = await axios.post(
        `/api/rooms/${this.state.room.id}/result`,
        formData
      );

      const iframe = document.createElement('iframe');
      const hostname =
        process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
      iframe.style.display = 'none';
      iframe.src = `${hostname}/api/rooms/${this.state.room.id}/result`;
      document.body.appendChild(iframe);
    }, 250);
  };

  render() {
    const {
      room,
      shapes,
      user,
      users,
      messages,
      isEditing,
      name,
      color,
      showPicker,
      pickerStyle
    } = this.state;
    return (
      <div className="App flex-col" onClick={this.onClick}>
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
                  onKeyDown={e => {
                    if (e.keyCode === 13) this.updateUser();
                  }}
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
            <div className="color-wrapper flex-row align-center">
              <div>Your shape color: </div>
              <div
                className="color"
                style={{ background: color }}
                onClick={this.onColorClick}
              />
              <Portal isOpened={showPicker}>
                <div style={pickerStyle} onClick={e => e.stopPropagation()}>
                  {showPicker ? (
                    <SketchPicker
                      color={color}
                      onChangeComplete={this.onColorChange}
                    />
                  ) : null}
                </div>
              </Portal>
            </div>
          </div>
          <div className="right">
            <button className="done" onClick={this.onDoneClick}>
              END SESSION
            </button>
          </div>
        </header>
        <div className="flex-row flex-main">
          <Chat
            messages={messages}
            users={users}
            onCreateMessageClick={this.onCreateMessageClick}
          />
          <Markup
            ref={ref => (this._markupRef = ref)}
            room={room}
            shapes={shapes}
            user={user}
            users={users}
            color={color}
            onUploadImageClick={this.onUploadImageClick}
            onCreateShape={this.onCreateShape}
            onUpdateShape={this.onUpdateShape}
            onDeleteShape={this.onDeleteShape}
          />
        </div>
      </div>
    );
  }
}

export default App;
