define('bitbucket/internal/feature/dashboard/pull-request-type', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var REVIEWING = exports.REVIEWING = 'REVIEWING';
  var CREATED = exports.CREATED = 'CREATED';
  var CLOSED = exports.CLOSED = 'CLOSED';

  /**
   * @alias PullRequestType
   * @enum string
   */
  exports.default = {
    REVIEWING: REVIEWING,
    CREATED: CREATED,
    CLOSED: CLOSED
  };
});