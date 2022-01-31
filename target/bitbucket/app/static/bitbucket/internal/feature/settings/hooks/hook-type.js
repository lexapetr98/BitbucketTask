define('bitbucket/internal/feature/settings/hooks/hook-type', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var POST_RECEIVE = exports.POST_RECEIVE = 'POST_RECEIVE';
  var PRE_PULL_REQUEST_MERGE = exports.PRE_PULL_REQUEST_MERGE = 'PRE_PULL_REQUEST_MERGE';
  var PRE_RECEIVE = exports.PRE_RECEIVE = 'PRE_RECEIVE';

  /**
   * @alias HookType
   * @readonly
   * @enum string
   */
  exports.default = {
    POST_RECEIVE: POST_RECEIVE,
    PRE_PULL_REQUEST_MERGE: PRE_PULL_REQUEST_MERGE,
    PRE_RECEIVE: PRE_RECEIVE
  };
  var isMergeCheck = exports.isMergeCheck = function isMergeCheck(hook) {
    return hook.details.type === PRE_PULL_REQUEST_MERGE;
  };
});