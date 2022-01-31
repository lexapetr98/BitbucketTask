define('bitbucket/internal/feature/repository/filterable-repository-table/actions', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var prefixed = function prefixed(action) {
    return 'filterable-repository-table/' + action;
  };

  var LOAD_REPOSITORIES = exports.LOAD_REPOSITORIES = prefixed('LOAD_REPOSITORIES');
  var LOAD_REPOSITORIES_SUCCESS = exports.LOAD_REPOSITORIES_SUCCESS = prefixed('LOAD_REPOSITORIES_SUCCESS');
  var LOAD_REPOSITORIES_FAILURE = exports.LOAD_REPOSITORIES_FAILURE = prefixed('LOAD_REPOSITORIES_FAILURE');
});