define('bitbucket/internal/feature/project/filterable-project-table/actions', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var prefixed = function prefixed(action) {
    return 'filterable-project-table/' + action;
  };

  var LOAD_PROJECTS = exports.LOAD_PROJECTS = prefixed('LOAD_PROJECTS');
  var LOAD_PROJECTS_SUCCESS = exports.LOAD_PROJECTS_SUCCESS = prefixed('LOAD_PROJECTS_SUCCESS');
  var LOAD_PROJECTS_FAILURE = exports.LOAD_PROJECTS_FAILURE = prefixed('LOAD_PROJECTS_FAILURE');
});