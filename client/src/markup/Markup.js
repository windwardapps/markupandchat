import React, { Component } from 'react';
import Toolbar from './Toolbar';
import Svg from './Svg';

import './Markup.css';

class Markup extends Component {
  state = {
    file: null,
    scale: 1,
    initialScale: 1
  };

  onFileChange = e => {
    this.setState({ file: e.target.files[0] });
  };

  onUploadImageClick = () => {
    const { file } = this.state;
    if (file) {
      this.props.onUploadImageClick(file);
    }
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
    const { file, scale, initialScale } = this.state;
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
          <div>
            <input type="file" onChange={this.onFileChange} />
            <button onClick={this.onUploadImageClick}>UPLOAD</button>
          </div>
        )}
      </div>
    );
  }
}

export default Markup;
