define('bitbucket/internal/feature/changeset/diff-tree/store/store', ['exports', './reducers', './action-creators', './constants', './selectors'], function (exports, _reducers, _actionCreators, _constants, _selectors) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.stateNamespace = exports.selectors = exports.actionCreators = exports.reducers = undefined;
  Object.defineProperty(exports, 'reducers', {
    enumerable: true,
    get: function () {
      return babelHelpers.interopRequireDefault(_reducers).default;
    }
  });
  var actionCreators = babelHelpers.interopRequireWildcard(_actionCreators);
  var selectors = babelHelpers.interopRequireWildcard(_selectors);
  exports.actionCreators = actionCreators;
  exports.selectors = selectors;
  exports.stateNamespace = _constants.STATE_NAMESPACE;
});