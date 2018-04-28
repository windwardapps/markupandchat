import React from 'react';
import PropTypes from 'prop-types';
import Draggable from './Draggable';
import Resizable from './Resizable';

import './Rect.css';

const getRect = (props) => {
  const { x, y, width, height } = props.data;
  return {
    x: x - 5,
    y: y - 5,
    width: width + 10,
    height: height + 10
  };
};

const getShape = (props, rect) => {
  const { x, y, width, height } = rect;
  return {
    x: x + 5,
    y: y + 5,
    width: width - 10,
    height: height - 10
  };
};

class Rect extends React.Component {
  static propTypes = {
    data: PropTypes.object,
    canEdit: PropTypes.bool,
    isActive: PropTypes.bool,
    setActiveShapeId: PropTypes.func,
    renderDragNode: PropTypes.func,
    renderResizeNodes: PropTypes.func
  };

  render() {
    const { data, canEdit, isActive, renderDragNode, renderResizeNodes } = this.props;

    let additionalProps = {
      name: 'Rect'
    };

    if (canEdit) {
      additionalProps.className = 'selectable';
      additionalProps.onClick = this.onClick;
    }

    const node = renderRect(data, additionalProps);

    if (!isActive) {
      return node;
    }

    return renderResizeNodes(renderDragNode(node));
  }

  onClick = () => {
    const { data, isActive, setActiveShapeId } = this.props;
    if (!isActive) {
      setActiveShapeId();
    }
  };
}

export function renderRect(data, additionalProps = {}) {
  const { x, y, width, height, strokeWidth, stroke, fill } = data;

  const props = {
    x,
    y,
    width,
    height,
    strokeWidth,
    stroke,
    fill,
    ...additionalProps
  };

  return <rect {...props} />;
}

export default Draggable(getRect, getShape)(Resizable(getRect, getShape)(Rect));
