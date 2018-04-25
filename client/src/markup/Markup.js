import React, { Component } from 'react';
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

  render() {
    const { room, user, users } = this.props;
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
            />
            <Svg room={room} scale={scale} onScaleChange={this.onScaleChange} />
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
