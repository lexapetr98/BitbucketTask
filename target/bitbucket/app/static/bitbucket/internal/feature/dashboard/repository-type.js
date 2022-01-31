define('bitbucket/internal/feature/dashboard/repository-type', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  // Additional values should be added to the analytics whitelist.
  var RECENT = exports.RECENT = 'recent';
  var SEARCH = exports.SEARCH = 'search';

  /**
   * Enum for repository list types
   * @alias RepositoryType
   * @readonly
   * @enum {string}
   */
  exports.default = {
    RECENT: RECENT,
    SEARCH: SEARCH
  };
});