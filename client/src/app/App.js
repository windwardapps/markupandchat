import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Portal } from 'react-portal';
import _ from 'lodash';
import axios from 'axios';
import io from 'socket.io-client';
import randomColor from 'randomcolor';
import Chat from '../chat/Chat';
import Markup from '../markup/Markup';
import store from '../store/store';
import { SketchPicker } from 'react-color';
import Dialog from '../dialog/Dialog';
import backArrow from '../assets/back-arrow.svg';

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
    pickerStyle: {},
    dialogMessage: null
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

    store.set('user', res.data.user);
    store.set('users', res.data.users);
    store.set('room', res.data.room);
    store.set('messages', res.data.messages);
    store.set('shapes', res.data.shapes);

    this.setState(res.data);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onClick = (e) => {
    if (this.state.showPicker) {
      this.hidePicker();
    }
  };

  onKeyDown = (e) => {
    if (this.state.showPicker && (e.code === 'Escape' || e.keyCode === 27 || e.which === 27)) {
      this.hidePicker();
    }
  };

  receiveNewMessage = (message) => {
    this.setState({ messages: this.state.messages.concat(message) });
    store.set('messages', store.get('messages').concat(message));
  };

  receiveUsers = (users) => {
    this.setState({ users });
    store.set('users', users);
  };

  receiveNewShape = (shape) => {
    this.setState({ shapes: this.state.shapes.concat(shape) });
    store.set('shapes', store.get('shapes').concat(shape));
  };

  receiveUpdatedShape = (shape) => {
    this.setState({
      shapes: this.state.shapes.filter((s) => s.id !== shape.id).concat(shape)
    });

    store.set(
      'shapes',
      store
        .get('shapes')
        .filter((s) => s.id !== shape.id)
        .concat(shape)
    );
  };

  receiveDeletedShape = (id) => {
    this.setState({
      shapes: this.state.shapes.filter((s) => s.id !== id)
    });

    store.set('shapes', store.get('shapes').filter((s) => s.id !== id));
  };

  onCreateMessageClick = (text) => {
    this.socket.emit('chatmessage', {
      text,
      userId: this.state.user.id
    });
  };

  onUploadImageClick = async (file) => {
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

  onUpdateShape = (shape) => {
    this.socket.emit('updateshape', shape);
  };

  onDeleteShape = (id) => {
    this.socket.emit('deleteshape', id);
  };

  onColorClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const pickerStyle = {
      position: 'absolute',
      top: rect.bottom + 3,
      left: rect.left - 90
    };

    this.setState({ showPicker: true, pickerStyle });
  };

  onColorChange = (color) => {
    localStorage.color = color.hex;
    this.setState({ color: color.hex });
    this.state.shapes.filter((s) => s.createdBy === this.state.user.id).forEach((shape) => {
      const updatedShape = _.cloneDeep(shape);
      updatedShape.data.stroke = color.hex;
      this.onUpdateShape(updatedShape);
    });
  };

  hidePicker = () => {
    this.setState({ showPicker: false, pickerStyle: {} });
  };

  onDoneClick = () => {
    this.setState({ dialogMessage: 'Saving... Please wait...' });
    this._markupRef.setState({ scale: 1 });
    this._markupRef._svgRef.setState({ activeId: null });
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

      newSvg.setAttribute('viewBox', `0 0 ${img.width} ${img.height}`);
      newSvg.setAttribute('width', `${img.width}px`);
      newSvg.setAttribute('height', `${img.height}px`);
      newSvg.setAttribute('x', '0');
      newSvg.setAttribute('y', '100');
      newSvg.style.width = `${img.width}px`;
      newSvg.style.height = `${img.height}px`;
      newSvg.style.backgroundImage = `url(${url})`;
      newSvg.style.backgroundSize = `contain`;
      newSvg.style.backgroundRepeat = `no-repeat`;
      newSvg.innerHTML = svg.innerHTML;

      const svgPrefix = '<?xml version="1.0" encoding="UTF-8"?>';
      const svgString = new XMLSerializer().serializeToString(newSvg);
      const xmlns = 'xmlns="http://www.w3.org/1999/xhtml"';
      const outerSvg = document.createElement('svg');
      outerSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      outerSvg.setAttribute('viewBox', `0 0 ${img.width} ${img.height + 100}`);
      outerSvg.setAttribute('width', `${img.width}px`);
      outerSvg.setAttribute('height', `${img.height + 100}px`);
      outerSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      const usersHtml = _.uniqBy(this.state.shapes, 'createdBy').map((shape) => {
        const user = this.state.users.find((u) => u.id === shape.createdBy);
        return `
          <div>
            <span style="display:inline-block; margin-right:5px; border-radius:50%; width:8px; height:8px; background:${
              shape.data.stroke
            }"></span>
            <span>${user.name}</span>
          </div>
        `;
      });

      const foreignObjectHtml = `
        <foreignObject width="${img.width}" height="100">
          <body ${xmlns} style="height: 100px; padding: 20px; margin:0; box-sizing:border-box; font-family: 'Lucida Grande', Helvetica, Arial, sans-serif; color: #555;">
            ${usersHtml}
          </body>
        </foreignObject>
      `;

      const s = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${img.width} ${img.height + 100}" width="${img.width}px" height="${img.height +
        100}px">
          ${foreignObjectHtml}
          ${svgString}
        </svg>
      `;

      outerSvg.innerHTML = foreignObjectHtml + svgString;
      const outerSvgString = svgPrefix + new XMLSerializer().serializeToString(outerSvg);

      const blob = new Blob([s], { type: 'image/svg+xml' });
      const formData = new FormData();
      formData.append('image', blob);
      const res = await axios.post(`/api/rooms/${this.state.room.id}/result`, formData);

      this.setState({ room: res.data });

      const iframe = document.createElement('iframe');
      const hostname = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
      iframe.style.display = 'none';
      iframe.src = `${hostname}/api/rooms/${this.state.room.id}/result`;
      document.body.appendChild(iframe);

      setTimeout(() => this.setState({ dialogMessage: 'Your download is complete' }), 500);

      setTimeout(() => this.setState({ dialogMessage: null }), 1500);
    }, 250);
  };

  render() {
    const { room, shapes, user, users, messages, isEditing, name, color, showPicker, pickerStyle, dialogMessage } = this.state;

    return (
      <div className="App flex-col" onClick={this.onClick}>
        <header className="App-header flex-row align-center">
          <div className="back">
            <Link to="/">
              <img src={backArrow} alt="Back" />
            </Link>
          </div>
          <div className="logo">MarkupAndChat</div>
          <div className="flex-main flex-row align-center">
            <div className="username-wrapper">
              <span>Your name: </span>
              {isEditing ? (
                <input
                  value={name}
                  onChange={(e) => this.setState({ name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.keyCode === 13) this.updateUser();
                  }}
                  onBlur={this.updateUser}
                  autoFocus
                />
              ) : (
                <span className="username" onClick={() => this.setState({ isEditing: true, name: user.name })}>
                  {user.name}
                </span>
              )}
            </div>
            <div className="color-wrapper flex-row align-center">
              <div>Your shape color: </div>
              <div className="color" style={{ background: color }} onClick={this.onColorClick} />
              <Portal isOpened={showPicker}>
                <div style={pickerStyle} onClick={(e) => e.stopPropagation()}>
                  {showPicker ? <SketchPicker color={color} onChangeComplete={this.onColorChange} /> : null}
                </div>
              </Portal>
            </div>
          </div>
          <div className="right">
            {room.imageSrc && !room.endDate ? (
              <button className="done" onClick={this.onDoneClick}>
                END SESSION
              </button>
            ) : null}
          </div>
        </header>
        {room.endDate ? (
          <div className="flex-row flex-main align-center justify-center">
            Thanks for using MarkupAndChat! Your session has ended. Feel free to create another room.
          </div>
        ) : (
          <div className="flex-row flex-main">
            <Chat messages={messages} users={users} onCreateMessageClick={this.onCreateMessageClick} />
            <Markup
              ref={(ref) => (this._markupRef = ref)}
              color={color}
              onUploadImageClick={this.onUploadImageClick}
              onCreateShape={this.onCreateShape}
              onUpdateShape={this.onUpdateShape}
              onDeleteShape={this.onDeleteShape}
            />
          </div>
        )}
        {dialogMessage ? <Dialog>{dialogMessage}</Dialog> : null}
      </div>
    );
  }
}

export default App;
