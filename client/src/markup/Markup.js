import React, { Component } from 'react';
import uuid from 'uuid/v4';
import Toolbar from './Toolbar';
import Svg from './Svg';

import './Markup.css';

class Markup extends Component {
  state = {
    scale: 1,
    initialScale: 1
  };

  onFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      this.props.onUploadImageClick(file);
    }
  };

  onUploadImageClick = () => {
    this._fileInput.click();
  };

  onScaleChange = (scale, initial = false) => {
    const nextState = { scale };
    if (initial) {
      nextState.initialScale = scale;
    }

    this.setState(nextState);
  };

  onCreateShape = (type) => {
    const scrollNode = document.querySelector('.scroll-node');
    const svgNode = document.querySelector('svg');
    const { scale } = this.state;
    const offset = 100;
    const x = Math.round((scrollNode.scrollLeft + svgNode.clientWidth / 2 - offset) / scale);
    const y = Math.round((scrollNode.scrollTop + svgNode.clientHeight / 2 - offset) / scale);
    const width = Math.round(2 * offset);
    const height = Math.round(2 * offset);
    const id = uuid();

    const baseData = {
      stroke: this.props.color,
      strokeWidth: 5,
      fill: 'none'
    };

    let data;
    switch (type) {
      case 'rect':
        data = { ...baseData, x, y, width, height };
        break;
      case 'ellipse':
        data = {
          ...baseData,
          cx: x + width / 2,
          cy: y + height / 2,
          rx: width,
          ry: height
        }
        break;
      default:
        return;
    }

    this.props.onCreateShape(id, type, data);
    this._svgRef.setState({ activeId: id })
  }

  render() {
    const { room, shapes, user, users, onCreateShape, onUpdateShape, onDeleteShape } = this.props;
    const { scale, initialScale } = this.state;
    return (
      <div className="Markup flex-row">
        {room.imageSrc ? (
          <div className="flex-row flex-main">
            <Toolbar
              room={room}
              scale={scale}
              initialScale={initialScale}
              onScaleChange={this.onScaleChange}
              onCreateShape={this.onCreateShape}
            />
            <Svg
              ref={ref => this._svgRef = ref}
              room={room}
              shapes={shapes}
              scale={scale}
              onScaleChange={this.onScaleChange}
              onUpdateShape={onUpdateShape}
              onDeleteShape={onDeleteShape} />
          </div>
        ) : (
          <div className="flex-main flex-row align-center justify-center">
            <input ref={node => this._fileInput = node} type="file" onChange={this.onFileChange} />
            <button onClick={this.onUploadImageClick}>UPLOAD A FILE TO GET STARTED</button>
          </div>
        )}
      </div>
    );
  }
}

export default Markup;
