import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {isInRect} from '../../util/DOMUtil';
import {KeyCode} from '../../util/Constants';

import './Rotatable.css';

const Rotatable = (getRect, getShape) => (Component) => class Rotatable extends React.Component {

  static WrappedComponent = Component;

  static propTypes = {
    data: PropTypes.object,
    isActive: PropTypes.bool,
    svgNode: PropTypes.object,
    onUpdateShape: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this._dragEvent = null;
    this.state = {
      ...getRect(props),
      transform: ''
    };
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props.data, prevProps.data)) {
      this.setState(getRect(this.props));
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  render() {
    return (
      <Component
        {...this.props}
        renderRotateNode={this.renderRotateNode} />
    );
  }

  renderRotateNode = (children) => {
    const { x, y, width, height, transform } = this.state;
    const rectProps = {
      x,
      y,
      width,
      height,
      fill: 'none',
      stroke: '#000',
      strokeWidth: 1,
      strokeDasharray: '3, 3'
    };

    const circleProps = {
      cx: x + width / 2,
      cy: y - 15,
      r: 4,
      fill: '#000',
      stroke: '#000',
      strokeWidth: 1,
      onMouseDown: this.onDragStart
    };

    const lineProps = {
      x1: x + width / 2,
      y1: y,
      x2: x + width / 2,
      y2: y - 15,
      fill: '#000',
      stroke: '#000',
      strokeWidth: 1
    };

    return (
      <g name="Rotatable" transform={transform}>
        {children}
        <rect {...rectProps} />
        <line {...lineProps} />
        <circle {...circleProps} />
      </g>
    );
  }

  addListeners = () => {
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.onDragStop, true);
    document.addEventListener('keydown', this.onKeyDown);
  }

  removeListeners = () => {
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.onDragStop, true);
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onDragStart = (e) => {
    this._dragEvent = {
      target: e.target,
      startX: e.clientX,
      startY: e.clientY
    };

    this.addListeners();
  }

  onDrag = (e) => {
    const { x, y, width, height } = this.state;
    const diffX = e.clientX - this._dragEvent.startX;
    const diffY = e.clientY - this._dragEvent.startY;

    const rotate = Math.round(Math.atan2(diffX, diffY) * (180 / Math.PI) * -1);
    const transform = `rotate(${rotate} ${x + width / 2} ${y + height / 2})`;

    this.setState({ transform });
  }

  onDragStop = (e) => {
    e.stopPropagation();
    const { svgNode, onUpdateShape } = this.props;
    const { transform } = this.state;
    if (!isInRect(svgNode.getBoundingClientRect(), e.clientX, e.clientY)) {
      return this.cancelDragEvent();
    }

    this._dragEvent = null;
    this.removeListeners();

    const shape = getShape(this.props, this.state);
    const data = {
      ...this.props.data,
      ...shape,
      transform
    };

    if (_.isEqual(data, this.props.data)) {
      onUpdateShape(data);
    }
  }

  onKeyDown = (e) => {
    if (e.keyCode === KeyCode.ESCAPE && this._dragEvent) {
      e.stopPropagation();
      this.cancelDragEvent();
    }
  }

  cancelDragEvent = () => {
    this._dragEvent = null;
    this.removeListeners();
    this.setState(getRect(this.props));
  }

};

export default Rotatable;
