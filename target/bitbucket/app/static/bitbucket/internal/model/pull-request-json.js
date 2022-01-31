define('bitbucket/internal/model/pull-request-json', ['exports', 'lodash', 'bitbucket/internal/model/pull-request'], function (exports, _lodash, _pullRequest) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.filter = exports.pullRequestProperties = undefined;

  var _pullRequest2 = babelHelpers.interopRequireDefault(_pullRequest);

  /**
   * A list of valid properties in a pull request Brace model object
   */
  var pullRequestProperties = exports.pullRequestProperties = Object.keys(new _pullRequest2.default({}).namedAttributes);

  /**
   * Filters an object returning a new object containing only the properties expected in Brace pull request
   * @param {Object} obj - an object to filter properties from
   * @returns {Object} an object that only contains properties valid in a pull request Brace model
   */
  var filter = exports.filter = function filter(obj) {
    return (0, _lodash.pick)(obj, pullRequestProperties);
  };
});