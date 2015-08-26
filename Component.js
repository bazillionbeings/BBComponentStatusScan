'use strict';

function Component(controllerCallBacks, dataStore, types) {
  this._inputs = this._getInput(dataStore, types);
  this._controllerCallBacks = controllerCallBacks;
}

Component.prototype._getInput = function(dataStore, types) {
  var result = {};
  dataStore.forEach(function(data) {
    types.forEach(function(type) {
      if (type === data.type) {
        result[type] = data.data;
      }
    });
  });
  return result;
};

module.exports = Component;
