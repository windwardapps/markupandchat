import React from 'react';
import close from '../assets/close.svg';

import './ActionSheet.css';

class ActionSheet extends React.Component {
  render() {
    const { onClose, children } = this.props;
    return (
      <div className="ActionSheet">
        <header>
          <button className="action" onClick={onClose}>
            <img src={close} />
          </button>
        </header>
        {children}
      </div>
    );
  }
}

export default ActionSheet;
