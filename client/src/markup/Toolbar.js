import React, { Component } from 'react';

import './Toolbar.css';

class Toolbar extends Component {
  render() {
    const { room, scale, initialScale, onScaleChange, onCreateShape } = this.props;

    return (
      <div className="Toolbar flex-col">
        <button onClick={() => onCreateShape('rect')}>RECT</button>
        <button onClick={() => onCreateShape('ellipse')}>ELLIPSE</button>
        {/* <button onClick={() => onCreateShape('path')}>PATH</button> */}
        <select value={scale} onChange={e => onScaleChange(parseFloat(e.target.value))}>
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

export default Toolbar;
