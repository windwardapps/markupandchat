import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { Portal } from 'react-portal';
import store from '../store/store';
import { SketchPicker } from 'react-color';
import backArrow from '../assets/back-arrow.svg';
import ellipsis from '../assets/ellipsis.svg';
import chat from '../assets/chat-blue.svg';
import storeListener from '../store/storeListener';
import ActionSheet from '../action-sheet/ActionSheet';
import Chat from '../chat/Chat';

import './Header.css';

class Header extends Component {
  state = {
    showActionSheet: false
  };

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (e) => {
    if (this.props.showColorPicker && (e.code === 'Escape' || e.keyCode === 27 || e.which === 27)) {
      store.set('showColorPicker', false);
    }
  };

  onColorClick = (e) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    const pickerStyle = {
      position: 'absolute',
      top: rect.bottom + 3,
      left: rect.left - 90
    };

    this.setState({ pickerStyle });
    store.set('showColorPicker', true);
  };

  onUsernameClick = () => {
    this.setState({ name: this.props.user.name });
    store.set('isEditingUsername', true);
  };

  hidePicker = () => {
    this.setState({ pickerStyle: {} });
    store.set('showColorPicker', false);
  };

  onToggleActionSheetClick = () => {
    this.setState({ showActionSheet: !this.state.showActionSheet });
  };

  onToggleChatClick = () => {
    this.setState({ showChat: !this.state.showChat });
  };

  renderMobile = () => {
    const {
      room,
      user,
      color,
      showColorPicker,
      isEditingUsername,
      updateUser,
      onColorChange,
      onDoneClick,
      onCreateMessageClick,
      match,
      history
    } = this.props;
    const { name, pickerStyle, showActionSheet, showChat } = this.state;

    return (
      <header className="Header mobile flex-row align-center spc-between">
        <div className="logo">MarkupAndChat</div>
        <div className="flex-row align-center">
          <Link to={`${match.url}/chat`} className="action chat">
            <img src={chat} alt="action" />
          </Link>
          <Link to={`${match.url}/menu`} className="action" onClick={this.onToggleActionSheetClick}>
            <img src={ellipsis} alt="action" />
          </Link>
        </div>
        <Route path={`${match.url}/menu`} render={() => (
          <Portal isOpen>
            <ActionSheet onClose={() => history.goBack()}>
              <div className="ActionSheet_Header" onClick={this.hidePicker}>
                <div className="username-wrapper">
                  <span>Your name: </span>
                  {isEditingUsername ? (
                    <input
                      value={name}
                      onChange={(e) => this.setState({ name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.keyCode === 13) updateUser(name);
                      }}
                      onBlur={() => updateUser(name)}
                      autoFocus
                    />
                  ) : (
                    <span className="username" onClick={this.onUsernameClick}>
                      {user.name}
                    </span>
                  )}
                </div>
                <div className="color-wrapper flex-row align-center">
                  <div>Your shape color: </div>
                  <div className="color" style={{ background: color }} onClick={this.onColorClick} />
                  <div style={pickerStyle} onClick={(e) => e.stopPropagation()}>
                    {showColorPicker ? <SketchPicker color={color} onChangeComplete={onColorChange} /> : null}
                  </div>
                </div>
                {room.imageSrc && !room.endDate ? (
                  <button className="done" onClick={onDoneClick}>
                    END SESSION
                  </button>
                ) : null}
              </div>
            </ActionSheet>
          </Portal>
        )} />
        <Route path={`${match.url}/chat`} render={() => (
          <Portal isOpen>
            <ActionSheet onClose={() => history.goBack()}>
              <div className="ActionSheet_Header_Chat">
                <Chat onCreateMessageClick={onCreateMessageClick} />
              </div>
            </ActionSheet>
          </Portal>
        )} />
      </header>
    );
  };

  render() {
    const { room, user, color, showColorPicker, isEditingUsername, updateUser, onColorChange, onDoneClick } = this.props;
    const { name, pickerStyle } = this.state;

    if (window.innerWidth <= 950) {
      return this.renderMobile();
    }

    return (
      <header className="Header flex-row align-center">
        <div className="back">
          <Link to="/">
            <img src={backArrow} alt="Back" />
          </Link>
        </div>
        <div className="logo">MarkupAndChat</div>
        <div className="flex-main flex-row align-center">
          <div className="username-wrapper">
            <span>Your name: </span>
            {isEditingUsername ? (
              <input
                value={name}
                onChange={(e) => this.setState({ name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.keyCode === 13) updateUser(name);
                }}
                onBlur={() => updateUser(name)}
                autoFocus
              />
            ) : (
              <span className="username" onClick={this.onUsernameClick}>
                {user.name}
              </span>
            )}
          </div>
          <div className="color-wrapper flex-row align-center">
            <div>Your shape color: </div>
            <div className="color" style={{ background: color }} onClick={this.onColorClick} />
            <Portal isOpened={showColorPicker}>
              <div style={pickerStyle} onClick={(e) => e.stopPropagation()}>
                {showColorPicker ? <SketchPicker color={color} onChangeComplete={onColorChange} /> : null}
              </div>
            </Portal>
          </div>
        </div>
        <div className="right">
          {room.imageSrc && !room.endDate ? (
            <button className="done" onClick={onDoneClick}>
              END SESSION
            </button>
          ) : null}
        </div>
      </header>
    );
  }
}

export default withRouter(storeListener('user', 'room', 'isEditingUsername', 'showColorPicker')(Header));
