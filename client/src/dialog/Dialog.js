import React from 'react';
import { Portal } from 'react-portal';

import './Dialog.css';

export default class Dialog extends React.Component {
  render() {
    return (
      <Portal isOpened>
        <div className="Dialog-background">
          <div className="Dialog">{this.props.children}</div>
        </div>
      </Portal>
    );
  }
}
