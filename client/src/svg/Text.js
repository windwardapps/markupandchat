import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Draggable from './Draggable';
import Resizable from './Resizable';
import Authenticator from '../../protocol/Authenticator';
import {isInRect} from '../../util/DOMUtil';

import './Text.css';

export const PLACEHOLDER_TEXT = 'Say something...';

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

@Draggable(getRect, getShape)
@Resizable(getRect, getShape)
export default class Text extends React.Component {

  static propTypes = {
    data: PropTypes.object,
    isActive: PropTypes.bool,
    setActiveShapeId: PropTypes.func,
    onUpdateShape: PropTypes.func,
    renderDragNode: PropTypes.func,
    renderResizeNodes: PropTypes.func,
    setOnDoubleClick: PropTypes.func,
  }

  static defaultProps = {
    setActiveShapeId: _.noop
  }

  state = {
    isEditing: false,
    value: '',
    height: this.props.data.height
  }

  componentDidMount() {
    this.props.setOnDoubleClick(this.onDoubleClick);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data && !this.state.isEditing) {
      this.setState({ height: nextProps.data.height });
    }
  }

  render() {
    const {
      data,
      isActive,
      renderDragNode,
      renderResizeNodes,
    } = this.props;

    const {
      x,
      y,
      width,
      stroke,
      fontSize,
      creator,
      font
    } = data;

    if (this.state.isEditing) {
      const foProps = {
        ref: node => this._node = node,
        x,
        y,
        width,
        height: this.state.height,
        name: 'Text'
      };

      const inputProps = {
        ref: node => this._textarea = node,
        value: this.state.value,
        style: {
          fontSize,
          color: stroke,
          lineHeight: 'normal'
        },
        autoFocus: true,
        onChange: this.onChange,
        onBlur: this.onBlur
      };

      if (font) {
        Object.assign(inputProps.style, font.toCss());
      }

      return (
        <foreignObject {...foProps}>
          <textarea {...inputProps} />
        </foreignObject>
      );
    }

    let additionalProps = {
      name: 'Text'
    };

    if (creator === Authenticator.AUTH_DATA.username) {
      additionalProps.className = 'selectable';
      additionalProps.onClick = this.onClick;
    }

    const node = renderText(data, additionalProps);

    if (!isActive) {
      return node;
    }

    return renderResizeNodes(renderDragNode(node));
  }

  addListeners = () => {
    document.addEventListener('click', this.onDocumentClick);
  }

  removeListeners = () => {
    document.removeEventListener('click', this.onDocumentClick);
  }

  onClick = () => {
    const { data, isActive, setActiveShapeId } = this.props;
    if (this._clickTimer) {
      clearTimeout(this._clickTimer);
      this._clickTimer = null;
      return this.onDoubleClick();
    }

    this._clickTimer = setTimeout(() => {
      this._clickTimer = null;
      if (!isActive) {
        setActiveShapeId(data.id);
      }
    }, 250);
  }

  onDoubleClick = () => {
    const { text } = this.props.data;
    const value = text === PLACEHOLDER_TEXT ? '' : text;
    this.setState({ isEditing: true, value });
    this.addListeners();
    this.props.setActiveShapeId(null);
  }

  onChange = (e) => {
    const { value, scrollHeight } = e.target;
    this.setState({ value, height: scrollHeight });
  }

  onBlur = async () => {
    await this.trim();
    await this.shrinkTextarea();

    const { value, height } = this.state;

    const data = {
      ...this.props.data,
      text: value || PLACEHOLDER_TEXT,
      height
    };

    this.removeListeners();
    this.setState({ isEditing: false, value: '' });

    if (!_.isEqual(data, this.props.data)) {
      this.props.onUpdateShape(data);
    }
  }

  onDocumentClick = (e) => {
    if (!this._node) {
      return;
    }

    const svgRect = this._node.ownerSVGElement.getBoundingClientRect();
    const nodeRect = this._node.getBBox();
    const rect = {
      top: svgRect.top + nodeRect.y,
      right: svgRect.left + nodeRect.x + nodeRect.width,
      bottom: svgRect.top + nodeRect.y + nodeRect.height,
      left: svgRect.left + nodeRect.x
    };

    if (this._node && !isInRect(rect, e.clientX, e.clientY)) {
      this.onBlur();
    }
  }

  trim = () => new Promise(resolve => {
    this.setState({ value: this.state.value.trim() }, resolve);
  })

  shrinkTextarea = () => new Promise(resolve => {
    this.setState({ height: this.state.height - 10 }, () => {
      const { scrollHeight, clientHeight } = this._textarea;
      if (scrollHeight >= clientHeight) {
        this.setState({ height: this.state.height + 10 }, resolve);
      } else {
        this.shrinkTextarea().then(resolve);
      }
    });
  })
}

export function renderText(data, additionalProps={}) {
  const {
    x,
    y,
    width,
    height,
    stroke,
    fontSize,
    font
  } = data;

  const props = {
    x,
    y,
    width,
    height,
    fontSize,
    fill: stroke,
    ...additionalProps
  };

  const style = {
    ...styles.p,
    fontSize,
    width,
    height,
    color: stroke,
  };

  if (font) {
    Object.assign(style, font.toCss());
  }

  return (
    <foreignObject {...props}><p style={style}>{data.text}</p></foreignObject>
  );
}

const styles = {
  p: {
    fontFamily: '"Montserrat", sans-serif',
    margin: 0,
    padding: 0,
    fontWeight: 600,
    whiteSpace: 'pre-wrap',
    overflow: 'hidden',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale'
  }
};

