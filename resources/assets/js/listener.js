const lodash = require('lodash');

class listener {
  
  constructor() {
    this._events = {};
  }

  on(event, listener) {
    if (lodash.isNil(this._events[event])) {
      this._events[event] = [];
    }
    this._events[event].push(listener);
  }

  emit(event, ...args) {
    if (lodash.isNil(this._events[event])) {
      return;
    }
    lodash.forEach(this._events[event], (listener) => {
      listener.apply(this, args);
    });
  }

  removeListener(event, listener) {
    if (lodash.isNil(this._events[event])) {
      return;
    }
    lodash.pull(this._events[event], listener);
  }

  once(event, listener) {
    this.on(event, function handler(...args) {
      this.removeListener(event, handler);
      listener.apply(this, args);
    });
  }
}

module.exports = listener;
