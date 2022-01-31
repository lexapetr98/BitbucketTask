define('bitbucket/internal/feature/alerts/actions', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var prefixed = function prefixed(action) {
    return 'alerts/' + action;
  };

  var ADD_ALERT = exports.ADD_ALERT = prefixed('ADD_ALERT');
  var REMOVE_ALERT = exports.REMOVE_ALERT = prefixed('REMOVE_ALERT');
  var DIALOG_OPEN = exports.DIALOG_OPEN = prefixed('DIALOG_OPEN');
  var DIALOG_CLOSED = exports.DIALOG_CLOSED = prefixed('DIALOG_CLOSED');
});