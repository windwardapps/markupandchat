import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { isInRect, getClientXY } from '../util';

import './Draggable.css';

const Draggable = (getRect, getShape) => (Component) =>
  class Draggable extends React.Component {
    static WrappedComponent = Component;

    static propTypes = {
      data: PropTypes.object,
      isActive: PropTypes.bool,
      svgNode: PropTypes.object,
      onUpdateShape: PropTypes.func,
      onDrag: PropTypes.func,
      onDragStop: PropTypes.func
    };

    static defaultProps = {
      onDrag: _.noop,
      onDragStop: _.noop
    };

    constructor(props) {
      super(props);
      this._dragEvent = null;
      this.state = getRect(props);
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
      return <Component {...this.props} renderDragNode={this.renderDragNode} setOnDoubleClick={this.setOnDoubleClick} />;
    }

    renderDragNode = (children) => {
      const { x, y, width, height } = this.state;
      const dragNodeProps = {
        ref: (node) => (this._node = node),
        x,
        y,
        width,
        height,
        fill: 'transparent',
        stroke: '#000',
        strokeWidth: 1,
        strokeDasharray: '3, 3',
        onMouseDown: this.onDragStart,
        onTouchStart: this.onDragStart
      };

      return (
        <g name="Draggable" onDoubleClick={this.onDoubleClick}>
          {children}
          <rect {...dragNodeProps} />
        </g>
      );
    };

    addListeners = () => {
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('touchmove', this.onDrag, { passive: false });
      document.addEventListener('mouseup', this.onDragStop, true);
      document.addEventListener('touchend', this.onDragStop, true);
      document.addEventListener('keydown', this.onKeyDown);
    };

    removeListeners = () => {
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('touchmove', this.onDrag);
      document.removeEventListener('mouseup', this.onDragStop, true);
      document.removeEventListener('touchend', this.onDragStop, true);
      document.removeEventListener('keydown', this.onKeyDown);
    };

    onDoubleClick = () => {
      if (this._onDoubleClick) {
        this._onDoubleClick();
      }
    };

    setOnDoubleClick = (onDoubleClick) => {
      this._onDoubleClick = onDoubleClick;
    };

    onDragStart = (e) => {
      const [clientX, clientY] = getClientXY(e);
      if (!(clientX || clientY)) {
        return;
      }

      this._dragEvent = {
        target: e.target,
        prevX: clientX,
        prevY: clientY
      };

      this.addListeners();
    };

    onDrag = (e) => {
      e.preventDefault();
      const { x, y } = this.state;
      const [clientX, clientY] = getClientXY(e);
      const diffX = clientX - this._dragEvent.prevX;
      const diffY = clientY - this._dragEvent.prevY;

      const nextState = {
        x: x + diffX,
        y: y + diffY
      };

      this._dragEvent.prevX = clientX;
      this._dragEvent.prevY = clientY;

      this.setState(nextState);
      this.props.onDrag(getShape(this.props, { ...this.state, ...nextState }));
    };

    onDragStop = (e) => {
      e.stopPropagation();
      const { svgNode, onUpdateShape, onDragStop } = this.props;
      const [clientX, clientY] = getClientXY(e);
      if (!isInRect(svgNode.getBoundingClientRect(), clientX, clientY)) {
        return this.cancelDragEvent();
      }

      this._dragEvent = null;
      this.removeListeners();

      const shape = getShape(this.props, this.state);
      const data = {
        ...this.props.data,
        ...shape
      };

      onDragStop();
      if (!_.isEqual(data, this.props.data)) {
        onUpdateShape(data);
      }
    };

    onKeyDown = (e) => {
      if (e.keyCode === 27 && this._dragEvent) {
        e.stopPropagation();
        this.cancelDragEvent();
      }
    };

    cancelDragEvent = () => {
      this._dragEvent = null;
      this.removeListeners();
      this.setState(getRect(this.props));
    };
  };

export default Draggable;
