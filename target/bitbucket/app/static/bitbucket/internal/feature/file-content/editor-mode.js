define('bitbucket/internal/feature/file-content/editor-mode', ['module', 'exports'], function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var EDIT = 'EDIT';
  var READONLY = 'READONLY';

  /**
   * @enum {string} EditorMode
   */
  exports.default = {
    EDIT: EDIT,
    READONLY: READONLY
  };
  module.exports = exports['default'];
});