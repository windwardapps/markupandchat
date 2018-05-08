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
    const { scale, color } = this.props;
    const offset = 100 / scale;
    const targetWidth = Math.min(scrollNode.clientWidth, svgNode.clientWidth);
    const targetHeight = Math.min(scrollNode.clientHeight, svgNode.clientHeight);
    const x = Math.round((scrollNode.scrollLeft + targetWidth / 2) / scale - offset);
    const y = Math.round((scrollNode.scrollTop + targetHeight / 2) / scale - offset);
    const width = Math.round(2 * offset);
    const height = Math.round(2 * offset);
    const id = uuid();

    const baseData = {
      stroke: color,
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
          rx: width / 2,
          ry: height / 2
        };
        break;
      default:
        return;
    }

    this.props.onCreateShape(id, type, data);
    store.set('activeShapeId', id);
  };

  render() {
    const { room, shapes, user, users, isUploading, onUpdateShape, onDeleteShape } = this.props;

    return (
      <div className="Markup flex-row">
        {room.imageSrc ? (
          <div className="flex-col flex-main">
            <Svg ref={(ref) => (this._svgRef = ref)} onUpdateShape={onUpdateShape} onDeleteShape={onDeleteShape} />
            <Toolbar onCreateShape={this.onCreateShape} onUpdateShape={onUpdateShape} />
          </div>
        ) : (
          <div className="flex-main flex-row align-center justify-center">
            <input ref={(node) => (this._fileInput = node)} type="file" onChange={this.onFileChange} />
            <button className="large" disabled={isUploading} onClick={this.onUploadImageClick}>
              UPLOAD A FILE TO GET STARTED
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default storeListener('room', 'shapes', 'users', 'user', 'scale', 'isUploading')(Markup);
