import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import { isInRect } from '../../util/DOMUtil';
import { KeyCode } from '../../util/Constants';
import Rect from './Rect';
import Ellipse from './Ellipse';
import Path, { scalePath } from './Path';
import Line from './Line';
import Text from './Text';
import { getClientXY } from '../../util/EventUtil';

import './Svg.css';

const SHAPES = {
  ellipse: Ellipse,
  rect: Rect,
  path: Path,
  line: Line,
  text: Text
};

const SCALEABLE_ATTRS = {
  ellipse: ['cx', 'cy', 'rx', 'ry', 'strokeWidth'],
  rect: ['x', 'y', 'width', 'height', 'strokeWidth'],
  path: [['d', scalePath], 'strokeWidth'],
  line: ['x1', 'y1', 'x2', 'y2', 'width', 'height', 'strokeWidth'],
  text: ['x', 'y', 'width', 'height', 'fontSize', 'strokeWidth']
};

export default class Svg extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    hostNode: PropTypes.object,
    freehand: PropTypes.bool,
    scale: PropTypes.number,
    activeShapeId: PropTypes.any,
    setActiveShapeId: PropTypes.func,
    getNewShapeData: PropTypes.func,
    onCreateShape: PropTypes.func,
    onUpdateShape: PropTypes.func,
    onDeleteShape: PropTypes.func,
    onClick: PropTypes.func
  };

  static defaultProps = {
    onClick: _.noop
  };

  state = {
    activePath: null
  };

  _isDrawing = false;

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
    this._node.addEventListener('touchmove', this.onDraw, { passive: false });
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
    this._node.removeEventListener('touchmove', this.onDraw);
    this.removeDrawEventListeners();
  }

  render() {
    const { data, freehand, onClick } = this.props;
    const { dragging, activePath } = this.state;

    const shapes = activePath ? data.concat(activePath) : data;

    return (
      <svg
        className={classNames('markup', { dragging, freehand })}
        onMouseDown={this.onDrawStart}
        onTouchStart={this.onDrawStart}
        onMouseMove={this.onDraw}
        // onClick={onClick}
        style={styles.markup}
        name="Svg"
        ref={(node) => (this._node = node)}>
        {shapes.map(this.renderShapes)}
      </svg>
    );
  }

  renderShapes = (data) => {
    const { activeShapeId, setActiveShapeId } = this.props;
    const { id, type } = data;
    const svgNode = this.getHostNode();
    const props = {
      key: id,
      data: this.scaleShape(data),
      svgNode,
      isActive: id === activeShapeId,
      onUpdateShape: this.onUpdateShape,
      setActiveShapeId
    };

    const Shape = SHAPES[type];

    return <Shape {...props} />;
  };

  scaleShape = (shape, addScale = true) => {
    const { scale } = this.props;
    if (scale === 1) {
      return shape;
    }

    let scaledShape = _.clone(shape);

    const attrs = SCALEABLE_ATTRS[shape.type];
    attrs.forEach((attr) => {
      if (Array.isArray(attr)) {
        const [subAttr, scaleFn] = attr;
        scaledShape[subAttr] = scaleFn(scaledShape[subAttr], scale, addScale);
      } else {
        if (addScale) {
          scaledShape[attr] *= scale;
        } else {
          scaledShape[attr] /= scale;
        }
      }
    });

    return scaledShape;
  };

  addDrawEventListeners = () => {
    document.addEventListener('mouseup', this.onDrawStop, true);
    document.addEventListener('touchend', this.onDrawStop, true);
  };

  removeDrawEventListeners = () => {
    document.removeEventListener('mouseup', this.onDrawStop, true);
    document.removeEventListener('touchend', this.onDrawStop, true);
  };

  getHostNode = () => {
    return this.props.hostNode || document.querySelector('#snapshot');
  };

  onDrawStart = (e) => {
    const { scale, freehand, getNewShapeData } = this.props;
    if (!freehand) {
      return;
    }

    const snapshotNode = this.getHostNode();
    if (!snapshotNode) {
      return;
    }

    this._isDrawing = true;
    const rect = snapshotNode.getBoundingClientRect();
    const [clientX, clientY] = getClientXY(e);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const activePath = {
      ...getNewShapeData(),
      type: 'path',
      fill: 'none',
      d: `M ${x / scale} ${y / scale}`
    };

    this.addDrawEventListeners();
    this.setState({ activePath });
  };

  onDraw = (e) => {
    const { scale } = this.props;
    if (!(this._isDrawing && this.state.activePath)) {
      return;
    }

    e.preventDefault();
    const snapshotNode = this.getHostNode();
    if (!snapshotNode) {
      return;
    }

    const rect = snapshotNode.getBoundingClientRect();
    const [clientX, clientY] = getClientXY(e);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    let activePath = { ...this.state.activePath };
    activePath.d += ` L ${x / scale} ${y / scale}`;
    this.setState({ activePath });
  };

  onDrawStop = (e) => {
    e.stopPropagation();
    const [clientX, clientY] = getClientXY(e);
    if (!this._isDrawing) {
      if (this.props.activeShapeId && !isInRect(this.getHostNode().getBoundingClientRect(), clientX, clientY)) {
        this.props.setActiveShapeId(null);
      }
      return;
    }

    this._isDrawing = false;
    this.removeDrawEventListeners();
    const path = { ...this.state.activePath };
    this.setState({ activePath: null });
    this.props.onCreateShape(path);
  };

  onKeyDown = (e) => {
    if (e.keyCode === KeyCode.ESCAPE && this._isDrawing) {
      e.stopPropagation();
      this.cancelDrawEvent();
    } else if (e.keyCode === KeyCode.DELETE && this.props.activeShapeId) {
      const shape = this.props.data.find((s) => s.id === this.props.activeShapeId);
      this.props.onDeleteShape(shape);
    }
  };

  onUpdateShape = (shape) => {
    const unscaledShape = this.scaleShape(shape, false);
    this.props.onUpdateShape(unscaledShape);
  };

  cancelDrawEvent = () => {
    this._isDrawing = false;
    this.removeDrawEventListeners();
    this.setState({ activePath: null });
  };
}

const styles = {
  markup: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  }
};
