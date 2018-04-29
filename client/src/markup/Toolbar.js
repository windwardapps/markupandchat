import React, { Component } from 'react';
import storeListener from '../store/storeListener';
import store from '../store/store';

import './Toolbar.css';

class Toolbar extends Component {
  onScaleChange = (e) => {
    store.set('scale', parseFloat(e.target.value));
  };

  render() {
    const { scale, initialScale, onCreateShape } = this.props;

    return (
      <div className="Toolbar flex-col">
        <button onClick={() => onCreateShape('rect')}>RECT</button>
        <button onClick={() => onCreateShape('ellipse')}>ELLIPSE</button>
        {/* <button onClick={() => onCreateShape('path')}>PATH</button> */}
        <select value={scale} onChange={this.onScaleChange}>
          <option value={initialScale}>Fit</option>
          <option value={1}>Actual size</option>
          <option value={0.5}>50%</option>
          <option value={2}>200%</option>
          <option value={5}>500%</option>
        </select>
      </div>
    );
  }
}

export default storeListener('scale', 'initialScale')(Toolbar);
