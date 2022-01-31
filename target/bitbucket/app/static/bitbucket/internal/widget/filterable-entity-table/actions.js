define('bitbucket/internal/widget/filterable-entity-table/actions', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var prefixed = function prefixed(action) {
    return 'filterable-entity-table/' + action;
  };

  var LOAD_ENTITIES = exports.LOAD_ENTITIES = prefixed('LOAD_ENTITIES');
  var LOAD_ENTITIES_FAILURE = exports.LOAD_ENTITIES_FAILURE = prefixed('LOAD_ENTITIES_FAILURE');
  var LOAD_ENTITIES_SUCCESS = exports.LOAD_ENTITIES_SUCCESS = prefixed('LOAD_ENTITIES_SUCCESS');
  var FILTER_CHANGED = exports.FILTER_CHANGED = prefixed('FILTER_CHANGED');
});