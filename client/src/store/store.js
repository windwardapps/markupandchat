import { EventEmitter } from 'events';

class Store extends EventEmitter {
  data = {
    isSaving: false,
    shapes: [],
    messages: [],
    users: [],
    user: {},
    room: {}
  };

  get(key) {
    return this.data[key];
  }
  set(key, value) {
    this.data[key] = value;
    this.emit(key, { name: key, data: value });
  }
}

const store = new Store();

export default store;
