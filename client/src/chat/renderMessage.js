import React from 'react';
import moment from 'moment';

export default function renderMessage(message, users) {
  return (
    <li key={message.id} style={styles.li}>
      <div>{message.text}</div>
      <div style={styles.info}>
        <span>
          {message.__default ? 'MarkupBot' : null}
          {(users.find((u) => u.id === message.createdBy) || {}).name}
        </span>
        <span>{moment(message.createdAt).fromNow()}</span>
      </div>
    </li>
  );
}

const styles = {
  li: {
    display: 'flex',
    flexDirection: 'column',
    margin: '15px 0 0 0',
    padding: 12,
    background: '#eef',
    borderRadius: 5
  },
  info: {
    fontSize: '80%',
    color: '#aaa',
    marginTop: 10,
    display: 'flex',
    justifyContent: 'space-between'
  }
};
