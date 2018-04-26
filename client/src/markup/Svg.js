import React, { Component } from 'react';
import _ from 'lodash';
import Rect from '../svg/Rect';
import Ellipse from '../svg/Ellipse';
import Path, {scalePath} from '../svg/Path';
import store from '../store';

import './Svg.css';

const shapeComponents = {
  rect: Rect,
  ellipse: Ellipse,
};

const SCALEABLE_ATTRS = {
  ellipse: ['cx', 'cy', 'rx', 'ry', 'strokeWidth'],
  rect: ['x', 'y', 'width', 'height', 'strokeWidth'],
  path: [['d', scalePath], 'strokeWidth'],
  line: ['x1', 'y1', 'x2', 'y2', 'width', 'height', 'strokeWidth'],
  text: ['x', 'y', 'width', 'height', 'fontSize', 'strokeWidth']
};

class Svg extends Component {
  state = {
    naturalWidth: 0,
    naturalHeight: 0,
    activeId: null,
    center: {
      x: 0,
      y: 0,
      scrollWidth: 0,
      scrollHeight: 0
    }
  };

  componentDidMount() {
    window.addEventListener('resize', this.onLoad);
    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.scale !== this.props.scale) {
      const { scrollTop, scrollLeft, scrollWidth, scrollHeight, clientWidth, clientHeight } = this._scrollNode;

      const center = {
        x: scrollLeft + clientWidth / 2,
        y: scrollTop + clientHeight / 2,
        scrollWidth,
        scrollHeight
      };

      this.setState({ center });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { center } = this.state;
    if (center !== prevState.center && this._scrollNode) {
      const { clientWidth, clientHeight, scrollWidth, scrollHeight } = this._scrollNode;
      this._scrollNode.scrollLeft = center.x / center.scrollWidth * scrollWidth - clientWidth / 2;
      this._scrollNode.scrollTop = center.y / center.scrollHeight * scrollHeight - clientHeight / 2;
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onLoad);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onLoad = () => {
    if (!(this._node && this._img)) {
      return setTimeout(this.onLoad, 500);
    }

    const { naturalWidth, naturalHeight } = this._img;
    if (!(naturalWidth && naturalHeight)) {
      return setTimeout(this.onLoad, 500);
    }

    const rect = this._node.getBoundingClientRect();
    const scale = Math.min(
      rect.width / naturalWidth,
      rect.height / naturalHeight
    );

    this.setState({
      naturalWidth,
      naturalHeight
    });

    this.props.onScaleChange(scale, true);
  };

  onKeyDown = (e) => {
    if (this.state.activeId && e.keyCode === 8 && !_.includes(['input, select, button'], document.activeElement.nodeName.toLowerCase())) {
      this.props.onDeleteShape(this.state.activeId);
    }
  }

  onClick = () => {
    if (this.state.activeId && !this._ignoreClickEvent) {
      this.setState({ activeId: null });
    }
  }

  onMouseDown = (e) => {
    if (!_.includes(['img', 'svg'], e.target.nodeName.toLowerCase())) {
      return;
    }

    e.preventDefault();
    this._isDragging = true;
    this._didDrag = false;
    this._lastX = e.clientX;
    this._lastY = e.clientY;
  }

  onMouseMove = (e) => {
    if (!_.includes(['img', 'svg'], e.target.nodeName.toLowerCase()) || !this._isDragging) {
      return;
    }

    const diffX = e.clientX - this._lastX;
    const diffY = e.clientY - this._lastY;

    if (!(diffX || diffY)) {
      return;
    }

    this._didDrag = true;
    this._scrollNode.scrollLeft -= diffX;
    this._scrollNode.scrollTop -= diffY;

    this._lastX = e.clientX;
    this._lastY = e.clientY;
  }

  onMouseUp = () => {
    if (!this._isDragging) {
      return;
    }

    this._isDragging = false;

    if (this._didDrag) {
      this._didDrag = false;
      this._ignoreClickEvent = true;
      setTimeout(() => this._ignoreClickEvent = false, 100);
    }
  }

  getPosition = () => {
    if (!this._node) {
      return {};
    }

    const { scale } = this.props;
    const { naturalWidth, naturalHeight } = this.state;
    const rect = this._node.getBoundingClientRect();
    const width = Math.round(scale * naturalWidth);
    const height = Math.round(scale * naturalHeight);
    const x = Math.round(Math.max((rect.width - width) / 2, 0));
    const y = Math.round(Math.max((rect.height - height) / 2, 0));

    return {
      width,
      height,
      transform: `translate(${x}px, ${y}px)`
    };
  };

  scaleShape = (shape, addScale=true) => {
    const { scale } = this.props;
    if (scale === 1) {
      return shape.data;
    }

    let scaledData = _.clone(shape.data);

    const attrs = SCALEABLE_ATTRS[shape.type];
    attrs.forEach(attr => {
      if (Array.isArray(attr)) {
        const [ subAttr, scaleFn ] = attr;
        scaledData[subAttr] = scaleFn(scaledData[subAttr], scale, addScale);
      } else {
        if (addScale) {
          scaledData[attr] *= scale;
        } else {
          scaledData[attr] /= scale;
        }
      }
    });

    return scaledData;
  }

  setActiveShapeId = (activeId) => {
    this.setState({ activeId });
  }

  onUpdateShape = (shape, data) => {
    this._ignoreClickEvent = true;
    setTimeout(() => this._ignoreClickEvent = false, 250);

    const updatedShape = _.cloneDeep(shape);
    updatedShape.data = data;
    updatedShape.data = this.scaleShape(updatedShape, false);
    this.props.onUpdateShape(updatedShape);
  }

  renderShape = (shape) => {
    const { room, onUpdateShape } = this.props;
    const { activeId } = this.state;
    const { id, type, data } = shape;
    const Component = shapeComponents[type];

    const scaledData = {}
    return (
      <Component
        key={id}
        data={this.scaleShape(shape)}
        canEdit={shape.createdBy === store.userId || room.createdBy === store.userId}
        isActive={id === activeId}
        svgNode={this._svgNode}
        onUpdateShape={data => this.onUpdateShape(shape, data)}
        setActiveShapeId={() => this.setState({ activeId: id })} />
    )
  }

  render() {
    const { room, shapes } = this.props;

    return (
      <div ref={node => (this._node = node)} className="Svg" onClick={this.onClick}>
        <div className="scroll-node" ref={node => (this._scrollNode = node)} onMouseDown={this.onMouseDown} onMouseMove={this.onMouseMove} onMouseUp={this.onMouseUp}>
          <div className="img-wrapper" style={this.getPosition()}>
            <img
              ref={node => (this._img = node)}
              src={`/${room.imageSrc}`}
              onLoad={this.onLoad}
            />
            <svg width="100%" height="100%" ref={node => this._svgNode = node}>
              {shapes.map(this.renderShape)}
            </svg>
          </div>
        </div>
      </div>
    );
  }
}

export default Svg;
