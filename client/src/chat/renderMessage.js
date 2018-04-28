import React from 'react';
import moment from 'moment';

export default function renderMessage(message, users) {
  return (
    <li key={message.id} className="flex-col">
      <div className="text">{message.text}</div>
      <div className="info flex-row spc-between">
        <span>
          {message.__default ? 'MarkupBot' : null}
          {(users.find((u) => u.id === message.createdBy) || {}).name}
        </span>
        <span>{moment(message.createdAt).fromNow()}</span>
      </div>
    </li>
  );
}
