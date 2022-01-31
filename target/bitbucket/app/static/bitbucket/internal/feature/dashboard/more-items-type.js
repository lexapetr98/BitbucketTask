define('bitbucket/internal/feature/dashboard/more-items-type', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var NONE = exports.NONE = 'NONE';
  var LOCAL = exports.LOCAL = 'LOCAL';
  var REMOTE = exports.REMOTE = 'REMOTE';

  /**
   * @alias MoreItemsType
   * @readonly
   * @enum string
   */
  exports.default = {
    NONE: NONE,
    LOCAL: LOCAL,
    REMOTE: REMOTE
  };
});