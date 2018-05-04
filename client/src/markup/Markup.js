import React, { Component } from 'react';
import uuid from 'uuid/v4';
import Toolbar from './Toolbar';
import Svg from './Svg';
import storeListener from '../store/storeListener';
import store from '../store/store';
import { PLACEHOLDER_TEXT } from '../svg/Text';

import './Markup.css';

class Markup extends Component {
  onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      this.props.onUploadImageClick(file);
    }
  };

  onUploadImageClick = () => {
    this._fileInput.click();
  };

  onCreateShape = (type) => {
    const scrollNode = document.querySelector('.scroll-node');
    const svgNode = document.querySelector('svg');
    const { scale } = this.props;
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
      case 'text':
        data = { ...baseData, x, y, width, height, fontSize: 25, text: PLACEHOLDER_TEXT };
        break;
      case 'ellipse':
        data = {
          ...baseData,
          cx: x + width / 2,
          cy: y + height / 2,
          rx: width,
          ry: height
        };
        break;
      default:
        return;
    }

    this.props.onCreateShape(id, type, data);
    store.set('activeShapeId', id);
  };

  render() {
    const { room, shapes, user, users, onUpdateShape, onDeleteShape } = this.props;

    return (
      <div className="Markup flex-row">
        {room.imageSrc ? (
          <div className="flex-row flex-main">
            <Toolbar onCreateShape={this.onCreateShape} onUpdateShape={onUpdateShape} />
            <Svg ref={(ref) => (this._svgRef = ref)} onUpdateShape={onUpdateShape} onDeleteShape={onDeleteShape} />
          </div>
        ) : (
          <div className="flex-main flex-row align-center justify-center">
            <input ref={(node) => (this._fileInput = node)} type="file" onChange={this.onFileChange} />
            <button className="large" onClick={this.onUploadImageClick}>
              UPLOAD A FILE TO GET STARTED
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default storeListener('room', 'shapes', 'users', 'user', 'scale')(Markup);
