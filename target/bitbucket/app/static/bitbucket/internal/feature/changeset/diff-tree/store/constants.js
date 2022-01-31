define('bitbucket/internal/feature/changeset/diff-tree/store/constants', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var SELECT_NEXT_ITEM = exports.SELECT_NEXT_ITEM = 'SELECT_NEXT_ITEM';
  var SELECT_PREV_ITEM = exports.SELECT_PREV_ITEM = 'SELECT_PREV_ITEM';
  var SELECT_ITEM = exports.SELECT_ITEM = 'SELECT_ITEM';

  var UPDATE_LIST = exports.UPDATE_LIST = 'UPDATE_LIST';
  var UPDATE_PARENTS_MAP = exports.UPDATE_PARENTS_MAP = 'UPDATE_PARENTS_MAP ';
  var TOGGLE_COLLAPSE = exports.TOGGLE_COLLAPSE = 'TOGGLE_COLLAPSE';

  var STATE_NAMESPACE = exports.STATE_NAMESPACE = 'diffTree';

  var NODE_EXPANDED = exports.NODE_EXPANDED = false;
  var NODE_COLLAPSED = exports.NODE_COLLAPSED = true;
});