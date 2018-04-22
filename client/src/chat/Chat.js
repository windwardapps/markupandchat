import React, { Component } from 'react';
import moment from 'moment';

import './Chat.css';

class Chat extends Component {
  state = {
    value: ''
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.messages !== this.props.messages &&
      this._list.lastElementChild &&
      this._list.lastElementChild.scrollIntoView
    ) {
      this._list.lastElementChild.scrollIntoView();
    }
  }

  onCreateMessageClick = () => {
    this.props.onCreateMessageClick(this.state.value);
    this.setState({ value: '' });
  };

  render() {
    const { messages, users, onCreateMessageClick } = this.props;
    const { value } = this.state;
    return (
      <div className="Chat flex-col">
        <ul ref={node => (this._list = node)} className="flex-main">
          {messages.map(m => (
            <li key={m.id} className="flex-col">
              <div className="text">{m.text}</div>
              <div className="info flex-row spc-between">
                <span>
                  {(users.find(u => u.id === m.createdBy) || {}).name}
                </span>
                <span>{moment(m.createdAt).fromNow()}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex-row">
          <input
            className="flex-main"
            placeholder="Send a message..."
            value={value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <button onClick={this.onCreateMessageClick}>SEND</button>
        </div>
      </div>
    );
  }
}

export default Chat;
