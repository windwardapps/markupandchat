import React, { Component } from 'react';
import renderMessage from './renderMessage';

import './Chat.css';

const defaultMessage = {
  __default: true,
  id: -1,
  text: 'Type something below to get the conversation going',
  createdAt: new Date().toJSON()
};

class Chat extends Component {
  state = {
    value: ''
  };

  componentDidUpdate(prevProps) {
    if (prevProps.messages !== this.props.messages && this._list.lastElementChild && this._list.lastElementChild.scrollIntoView) {
      this._list.lastElementChild.scrollIntoView();
    }
  }

  onCreateMessageClick = () => {
    const value = this.state.value.trim();
    if (!value) {
      return;
    }

    this.props.onCreateMessageClick(value);
    this.setState({ value: '' });
  };

  onKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.onCreateMessageClick();
    }
  };

  render() {
    const { messages, users, onCreateMessageClick } = this.props;
    const { value } = this.state;
    return (
      <div className="Chat flex-col">
        <ul ref={(node) => (this._list = node)} className="flex-main">
          {(messages.length ? messages : [defaultMessage]).map((m) => renderMessage(m, users))}
        </ul>
        <div className="flex-row">
          <input
            className="flex-main"
            placeholder="Send a message..."
            value={value}
            onChange={(e) => this.setState({ value: e.target.value })}
            onKeyDown={this.onKeyDown}
          />
          <button onClick={this.onCreateMessageClick}>SEND</button>
        </div>
      </div>
    );
  }
}

export default Chat;
