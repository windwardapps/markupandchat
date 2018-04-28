import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { isInRect, getClientXY } from '../util';

import './Resizable.css';

const Resizable = (getRect, getShape) => (Component) =>
  class Resizable extends React.Component {
    static WrappedComponent = Component;

    static propTypes = {
      data: PropTypes.object,
      isActive: PropTypes.bool,
      svgNode: PropTypes.object,
      onUpdateShape: PropTypes.func,
      onResize: PropTypes.func,
      onDragStop: PropTypes.func
    };

    static defaultProps = {
      onResize: _.noop,
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
      return <Component {...this.props} renderResizeNodes={this.renderResizeNodes} />;
    }

    renderResizeNodes = (children) => {
      const { x, y, width, height } = this.state;
      const dottedRectProps = {
        x,
        y,
        width,
        height,
        fill: 'none',
        stroke: '#000',
        strokeWidth: 1,
        strokeDasharray: '3, 3'
      };

      const dotProps = {
        width: 4,
        height: 4,
        fill: '#fff',
        stroke: '#fff',
        onMouseDown: this.onResizeStart,
        onTouchStart: this.onResizeStart
      };

      const offset = 2;

      const dot1Props = { ...dotProps, className: 'dot dot-1', x: x - offset, y: y - offset };
      const dot2Props = { ...dotProps, className: 'dot dot-2', x: x - offset + width / 2, y: y - offset };
      const dot3Props = { ...dotProps, className: 'dot dot-3', x: x + width - offset, y: y - offset };
      const dot4Props = { ...dotProps, className: 'dot dot-4', x: x + width - offset, y: y - offset + height / 2 };
      const dot5Props = { ...dotProps, className: 'dot dot-5', x: x + width - offset, y: y + height - offset };
      const dot6Props = { ...dotProps, className: 'dot dot-6', x: x - offset + width / 2, y: y + height - offset };
      const dot7Props = { ...dotProps, className: 'dot dot-7', x: x - offset, y: y + height - offset };
      const dot8Props = { ...dotProps, className: 'dot dot-8', x: x - offset, y: y - offset + height / 2 };

      return (
        <g name="Resizable">
          {children}
          <rect {...dottedRectProps} />
          <rect {...dot1Props} />
          <rect {...dot2Props} />
          <rect {...dot3Props} />
          <rect {...dot4Props} />
          <rect {...dot5Props} />
          <rect {...dot6Props} />
          <rect {...dot7Props} />
          <rect {...dot8Props} />
        </g>
      );
    };

    addListeners = () => {
      document.addEventListener('mousemove', this.onResize);
      document.addEventListener('touchmove', this.onResize, { passive: false });
      document.addEventListener('mouseup', this.onResizeStop, true);
      document.addEventListener('touchend', this.onResizeStop, true);
      document.addEventListener('keydown', this.onKeyDown);
    };

    removeListeners = () => {
      document.removeEventListener('mousemove', this.onResize);
      document.removeEventListener('touchmove', this.onResize);
      document.removeEventListener('mouseup', this.onResizeStop, true);
      document.removeEventListener('touchend', this.onResizeStop, true);
      document.removeEventListener('keydown', this.onKeyDown);
    };

    onResizeStart = (e) => {
      const num = parseInt(e.target.getAttribute('class').replace('dot dot-', ''), 10);
      const [clientX, clientY] = getClientXY(e);
      this._dragEvent = {
        canChangeWidth: !_.includes([2, 6], num),
        canChangeHeight: !_.includes([4, 8], num),
        canChangeX: _.includes([1, 7, 8], num),
        canChangeY: _.includes([1, 2, 3], num),
        prevX: clientX,
        prevY: clientY
      };

      this.addListeners();
    };

    onResize = (e) => {
      e.preventDefault();
      const { svgNode } = this.props;
      const [clientX, clientY] = getClientXY(e);
      if (!this._dragEvent) {
        return;
      }

      const { canChangeWidth, canChangeHeight, canChangeX, canChangeY, prevX, prevY } = this._dragEvent;

      let nextState = {};

      if (canChangeWidth) {
        const { width } = this.state;
        const diffX = clientX - prevX;
        if (canChangeX) {
          const offsetX = svgNode.getBoundingClientRect().left;
          const newX = clientX - offsetX;
          nextState.x = newX;
          nextState.width = Math.max(width - diffX, 1);
        } else {
          nextState.width = Math.max(width + diffX, 1);
        }
      }

      if (canChangeHeight) {
        const { height } = this.state;
        const diffY = clientY - prevY;
        if (canChangeY) {
          const offsetY = svgNode.getBoundingClientRect().top;
          const newY = clientY - offsetY;
          nextState.y = newY;
          nextState.height = Math.max(height - diffY, 1);
        } else {
          nextState.height = Math.max(height + diffY, 1);
        }
      }

      this._dragEvent.prevX = clientX;
      this._dragEvent.prevY = clientY;

      this.setState(nextState);
      this.props.onResize(getShape(this.props, { ...this.state, ...nextState }));
    };

    onResizeStop = (e) => {
      e.stopPropagation();
      const { svgNode, onUpdateShape, onDragStop } = this.props;
      const [clientX, clientY] = getClientXY(e);
      if (!isInRect(svgNode.getBoundingClientRect(), clientX, clientY)) {
        return this.cancelResizeEvent();
      }

      this.removeListeners();
      this._dragEvent = null;

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
        this.cancelResizeEvent();
      }
    };

    cancelResizeEvent = () => {
      this._dragEvent = null;
      this.removeListeners();
      this.setState(getRect(this.props));
    };
  };

export default Resizable;
