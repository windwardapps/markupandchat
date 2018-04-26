import React from 'react';
import PropTypes from 'prop-types';
import Draggable from './Draggable';

import './Path.css';
import store from '../store';

export const scalePath = (d, scale, addScale) => (
  d.split(' ')
    .map(token => {
      const i = parseFloat(token.trim());
      return isNaN(i) ? token : addScale ? i * scale : i / scale;
    })
    .join(' ')
);

const getRect = (props) => {
  const { d } = props.data;
  const arr = d.split(/(M|L)/)
    .map(t => t.trim())
    .filter(t => /\d+\s\d+/.test(t));

  let xValues = [];
  let yValues = [];

  arr.forEach(t => {
    const tokens = t.split(' ');
    const x = parseInt(tokens[0]);
    const y = parseInt(tokens[1]);
    xValues.push(x);
    yValues.push(y);
  });

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  return {
    x: minX - 5,
    y: minY - 5,
    width: maxX - minX + 10,
    height: maxY - minY + 10
  };
};

const getShape = (props, rect) => {
  const { d } = props.data;
  const { x, y } = rect;
  const { x: initialX, y: initialY } = getRect(props);
  const diffX = x - initialX;
  const diffY = y - initialY;

  const arr = d.split(/(M|L)/)
    .map(t => t.trim())
    .filter(t => /\d+\s\d+/.test(t));

  const newArr = arr.map(t => {
    const tokens = t.split(' ');
    const x = parseInt(tokens[0]);
    const y = parseInt(tokens[1]);
    return `${x + diffX} ${y + diffY}`;
  });

  const newD = 'M ' + newArr.join(' L ');

  return { d: newD };
};

class Path extends React.Component {

  static propTypes = {
    data: PropTypes.object,
    canEdit: PropTypes.object,
    isActive: PropTypes.bool,
    setActiveShapeId: PropTypes.func,
    renderDragNode: PropTypes.func
  }

  render() {
    const { data, canEdit, isActive, renderDragNode } = this.props;

    let additionalProps = {
      name: 'Path'
    };

    if (canEdit) {
      additionalProps.className = 'selectable';
      additionalProps.onClick = this.onClick;
    }

    const node = renderPath(data, additionalProps);

    if (!isActive) {
      return node;
    }

    return renderDragNode(node);
  }

  onClick = () => {
    const { isActive, data, setActiveShapeId } = this.props;
    if (!isActive && data.createdBy === store.userId) {
      setActiveShapeId(data.id);
    }
  }

}

export function renderPath(data, additionalProps={}) {
  // eslint-disable-next-line
  const { id, type, creator, _threadId, ...attrs } = data;

  const props = {
    ...attrs,
    ...additionalProps
  };

  return (
    <path {...props} />
  );

}

export default Draggable(getRect, getShape)(Path);