import React from 'react';
import PropTypes from 'prop-types';
import Draggable from './Draggable';
import Resizable from './Resizable';

import './Ellipse.css';

const getRect = (props) => {
  const { cx, cy, rx, ry } = props.data;
  return {
    x: cx - rx - 5,
    y: cy - ry - 5,
    width: rx * 2 + 10,
    height: ry * 2 + 10
  };
};

const getShape = (props, rect) => {
  const { x, y, width, height } = rect;
  return {
    cx: x + width / 2,
    cy: y + height / 2,
    rx: (width - 10) / 2,
    ry: (height - 10) / 2
  };
};

class Ellipse extends React.Component {
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
      name: 'Ellipse'
    };

    if (canEdit) {
      additionalProps.className = 'selectable';
      additionalProps.onClick = this.onClick;
    }

    const node = renderEllipse(data, additionalProps);

    if (!isActive) {
      return node;
    }

    return renderResizeNodes(renderDragNode(node));
  }

  onClick = () => {
    const { data, isActive, setActiveShapeId } = this.props;
    if (!isActive) {
      setActiveShapeId(data.id);
    }
  };
}

export function renderEllipse(data, additionalProps = {}) {
  const { cx, cy, rx, ry, strokeWidth, stroke, fill } = data;

  const props = {
    cx,
    cy,
    rx,
    ry,
    strokeWidth,
    stroke,
    fill,
    ...additionalProps
  };

  return <ellipse {...props} />;
}

export default Draggable(getRect, getShape)(Resizable(getRect, getShape)(Ellipse));
