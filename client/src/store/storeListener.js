import React from 'react';
import store from './store';

const storeListener = (...items) => (Component) =>
  class StoreListener extends React.Component {
    static WrappedComponent = Component;

    constructor(props) {
      super(props);

      this._items = items;

      const state = {};
      this._items.forEach((name) => {
        store.addListener(name, this.onChange);
        state[name] = store.get(name);
      });

      this.state = state;
    }

    componentWillUnmount() {
      this._items.forEach((name) => {
        store.removeListener(name, this.onChange);
      });
    }

    onRef = (ref) => {
      this._component = ref;
    };

    onChange = ({ name, data }) => {
      this.setState({ [name]: data });
    };

    render() {
      return <Component ref={this.onRef} {...this.props} {...this.state} />;
    }
  };

export default storeListener;
