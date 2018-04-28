import React from 'react';
import PropTypes from 'prop-types';
import Draggable from './Draggable';
import Resizable from './Resizable';
import Rotatable from './Rotatable';
import Authenticator from '../../protocol/Authenticator';

import './Line.css';

const getRect = (props) => {
  const { x1, y1, x2, y2, transform } = props.data;

  return {
    x: Math.min(x1, x2) - 5,
    y: Math.min(y1, y2) - 5,
    width: Math.abs(x2 - x1) + 10,
    height: Math.abs(y2 - y1) + 10,
    transform
  };
};

const getShape = (props, rect) => {
  const { x, y, width, height } = rect;
  return {
    x1: x + 5,
    y1: y + 5,
    x2: x + width - 5,
    y2: y + height - 5
  };
};

@Rotatable(getRect, getShape)
@Draggable(getRect, getShape)
@Resizable(getRect, getShape)
export default class Line extends React.Component {
  static propTypes = {
    data: PropTypes.object,
    isActive: PropTypes.bool,
    setActiveShapeId: PropTypes.func,
    renderDragNode: PropTypes.func,
    renderResizeNodes: PropTypes.func,
    renderRotateNode: PropTypes.func
  };

  render() {
    const { data, isActive, renderDragNode, renderResizeNodes, renderRotateNode } = this.props;

    let additionalProps = {
      name: 'Line',
      transform: isActive ? '' : data.transform
    };

    if (data.creator === Authenticator.AUTH_DATA.username) {
      additionalProps.className = 'selectable';
      additionalProps.onClick = this.onClick;
    }

    const node = renderLine(data, additionalProps);

    if (!isActive) {
      return node;
    }

    return renderRotateNode(renderResizeNodes(renderDragNode(node)));
  }

  onClick = () => {
    const { data, isActive, setActiveShapeId } = this.props;
    if (!isActive && data.creator === Authenticator.AUTH_DATA.username) {
      setActiveShapeId(data.id);
    }
  };
}

export function renderLine(data, additionalProps = {}) {
  const { x1, y1, x2, y2, width, height, strokeWidth, stroke, fill } = data;

  const props = {
    x1,
    y1,
    x2,
    y2,
    width,
    height,
    strokeWidth,
    stroke,
    fill,
    ...additionalProps
  };

  return <line {...props} />;
}
