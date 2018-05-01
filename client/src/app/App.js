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
import storeListener from '../store/storeListener';

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

    const socket = (this.socket = io(`http://${window.location.hostname}:3002`));
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
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
    this.socket.close();
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
    store.set('messages', store.get('messages').concat(message));
  };

  receiveUsers = (users) => {
    store.set('users', users);
  };

  receiveNewShape = (shape) => {
    store.set('shapes', store.get('shapes').concat(shape));
  };

  receiveUpdatedShape = (shape) => {
    store.set(
      'shapes',
      store
        .get('shapes')
        .filter((s) => s.id !== shape.id)
        .concat(shape)
    );
  };

  receiveDeletedShape = (id) => {
    store.set('shapes', store.get('shapes').filter((s) => s.id !== id));
  };

  onCreateMessageClick = (text) => {
    this.socket.emit('chatmessage', {
      text,
      userId: this.props.user.id
    });
  };

  onUploadImageClick = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axios.put(`/api/rooms/${this.props.room.id}`, formData);
    store.set('room', res.data);
  };

  updateUser = async () => {
    const { user, room } = this.props;
    const { name } = this.state;
    if (!name.trim()) {
      return this.setState({ isEditing: false });
    }

    const res = await axios.put(`/api/users/${user.id}`, {
      name,
      roomId: room.id
    });

    this.setState({ isEditing: false, name: '' });
    store.set('user', res.data);
  };

  onCreateShape = (id, type, data) => {
    this.socket.emit('createshape', {
      id,
      userId: this.props.user.id,
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
    this.props.shapes.filter((s) => s.createdBy === this.props.user.id).forEach((shape) => {
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
    store.set('scale', 1);
    store.set('activeShapeId', null);

    // Convert room image to dataUrl
    setTimeout(() => {
      const svg = document.querySelector('.Svg svg');
      const rect = svg.getBoundingClientRect();
      const canvas = document.createElement('canvas');
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL();
        svg.style.backgroundImage = `url(${dataUrl})`;
        store.set('isSaving', true);
      };

      img.src = `/${this.props.room.imageSrc}`;
    }, 1000);

    // Show messages under svg image, serialize svg document, create
    // image from svg string, draw image to canvas, convert canvas data
    // to png, upload png, download png via iframe, end session.
    setTimeout(() => {
      const svg = document.querySelector('.Svg svg');
      const rect = svg.getBoundingClientRect();
      const canvas = document.createElement('canvas');
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');

      const svgString = new XMLSerializer().serializeToString(svg);
      const encodedSvgString = encodeURIComponent(svgString);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(async (pngBlob) => {
          const formData = new FormData();
          formData.append('image', pngBlob);
          const res = await axios.post(`/api/rooms/${this.props.room.id}/result`, formData);

          store.set('room', res.data);

          const iframe = document.createElement('iframe');
          const hostname = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
          iframe.style.display = 'none';
          iframe.src = `${hostname}/api/rooms/${this.props.room.id}/result`;
          document.body.appendChild(iframe);

          setTimeout(() => this.setState({ dialogMessage: 'Your download is complete' }), 500);
          setTimeout(() => this.setState({ dialogMessage: null }), 1500);
        });
      };

      img.onerror = (e) => {
        store.set('isSaving', false);
        this.setState({ dialogMessage: 'Oops! An error occurred :/' });
        setTimeout(() => this.setState({ dialogMessage: null }), 5000);
      };

      img.src = 'data:image/svg+xml,' + encodedSvgString;
    }, 3000);
  };

  render() {
    const { room, user, users, messages } = this.props;
    const { isEditing, name, color, showPicker, pickerStyle, dialogMessage } = this.state;

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

export default storeListener('user', 'users', 'room', 'messages', 'shapes')(App);
