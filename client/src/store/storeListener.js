import React from 'react';
import Store from '../store/Store';

const storeListener = (items) => (Component) =>
  class StoreListener extends React.Component {
    static WrappedComponent = Component;

    constructor(props) {
      super(props);

      this._items = Array.isArray(items) ? items : [items];

      const state = {};
      this._items.forEach(({ name, defaultValue = null }) => {
        Store.addListener(name, this.onChange);
        state[name] = Store.get(name, defaultValue);
      });

      this.state = state;
    }

    componentWillUnmount() {
      this._items.forEach(({ name }) => {
        Store.removeListener(name, this.onChange);
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
