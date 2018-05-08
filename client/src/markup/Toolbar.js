import React, { Component } from 'react';
import _ from 'lodash';
import storeListener from '../store/storeListener';
import store from '../store/store';
import rect from '../assets/rect.svg';
import circle from '../assets/circle.svg';

import './Toolbar.css';

class Toolbar extends Component {
  state = {
    fontSize: 25
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeShapeId && this.props.activeShapeId !== nextProps.activeShapeId) {
      const shape = this.getShape(nextProps);
      if (shape && shape.type === 'text') {
        this.setState({ fontSize: shape.data.fontSize });
      }
    }
  }

  getShape = (props = this.props) => {
    const { shapes, activeShapeId } = props;
    if (!activeShapeId) {
      return null;
    }

    return shapes.find((s) => s.id === activeShapeId);
  };

  onScaleChange = (e) => {
    store.set('scale', parseFloat(e.target.value));
  };

  onUpdateFontSize = () => {
    const shape = this.getShape();
    if (!shape) {
      return;
    }

    const val = parseFloat(this.state.fontSize);
    if (!val || isNaN(val)) {
      return;
    }

    const clone = _.cloneDeep(shape);
    clone.data.fontSize = val;
    this.props.onUpdateShape(clone);
  };

  onFontSizeKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.onUpdateFontSize();
    }
  };

  maybeRenderFontControls = () => {
    const { activeShapeId } = this.props;
    if (!activeShapeId) {
      return null;
    }

    const shape = this.getShape();
    if (!(shape && shape.type === 'text')) {
      return null;
    }

    const { fontSize } = this.state;

    return (
      <div>
        <div className="field">
          <label>Font Size</label>
          <input
            type="text"
            value={fontSize}
            onChange={(e) => this.setState({ fontSize: e.target.value })}
            onBlur={this.onUpdateFontSize}
            onKeyDown={this.onFontSizeKeyDown}
          />
        </div>
      </div>
    );
  };

  render() {
    const { scale, initialScale, onCreateShape, activeShapeId } = this.props;

    return (
      <div className="Toolbar flex-row align-center justify-center">
        <button className="icon" onClick={() => onCreateShape('rect')}><img src={rect} /></button>
        <button className="icon" onClick={() => onCreateShape('ellipse')}><img src={circle} /></button>
        <button onClick={() => onCreateShape('text')}>TEXT</button>
        {/* <button onClick={() => onCreateShape('path')}>PATH</button> */}
        <select value={scale} onChange={this.onScaleChange}>
          <option value={initialScale}>Fit</option>
          <option value={1}>Actual size</option>
          <option value={0.5}>50%</option>
          <option value={2}>200%</option>
          <option value={5}>500%</option>
        </select>
        {this.maybeRenderFontControls()}
      </div>
    );
  }
}

export default storeListener('scale', 'initialScale', 'activeShapeId', 'shapes')(Toolbar);
