define('bitbucket/internal/bbui/utils/thunk-middleware', ['module', 'exports'], function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = legacyThunkMiddleware;
  /**
   * Redux middleware for handling asynchronous actions
   * Prefer use of actors - see bitbucket/internal/util/redux::createActorStore
   * @deprecated Use actors instead
   * @returns {Function} Thunk middleware for Redux
   */
  function legacyThunkMiddleware(_ref) {
    var dispatch = _ref.dispatch,
        getState = _ref.getState;

    return function (next) {
      return function (action) {
        return typeof action === 'function' ? action(dispatch, getState) : next(action);
      };
    };
  }
  module.exports = exports['default'];
});