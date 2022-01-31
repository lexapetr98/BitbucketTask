define('bitbucket/internal/feature/settings/hooks/actions', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var prefixed = function prefixed(action) {
    return 'hooks/' + action;
  };

  var EDIT_HOOK = exports.EDIT_HOOK = prefixed('EDIT_HOOK');
  var EDIT_HOOK_CANCEL = exports.EDIT_HOOK_CANCEL = prefixed('EDIT_HOOK_CANCEL');
  var ENABLE_HOOK = exports.ENABLE_HOOK = prefixed('ENABLE_HOOK');
  var ENABLE_HOOK_FAILURE = exports.ENABLE_HOOK_FAILURE = prefixed('ENABLE_HOOK_FAILURE');
  var ENABLE_HOOK_SUCCESS = exports.ENABLE_HOOK_SUCCESS = prefixed('ENABLE_HOOK_SUCCESS');
  var INHERIT_HOOK = exports.INHERIT_HOOK = prefixed('INHERIT_HOOK');
  var INHERIT_HOOK_FAILURE = exports.INHERIT_HOOK_FAILURE = prefixed('INHERIT_HOOK_FAILURE');
  var INHERIT_HOOK_SUCCESS = exports.INHERIT_HOOK_SUCCESS = prefixed('INHERIT_HOOK_SUCCESS');
  var LOAD_HOOK_SETTINGS_FAILURE = exports.LOAD_HOOK_SETTINGS_FAILURE = prefixed('LOAD_HOOK_SETTINGS_FAILURE');
  var LOAD_HOOK_SETTINGS_SUCCESS = exports.LOAD_HOOK_SETTINGS_SUCCESS = prefixed('LOAD_HOOK_SETTINGS_SUCCESS');
  var LOAD_HOOKS = exports.LOAD_HOOKS = prefixed('LOAD_HOOKS');
  var LOAD_HOOKS_SUCCESS = exports.LOAD_HOOKS_SUCCESS = prefixed('LOAD_HOOKS_SUCCESS');
  var NOTIFICATION_DISMISSED = exports.NOTIFICATION_DISMISSED = prefixed('NOTIFICATION_DISMISSED');
  var SAVE_HOOK_SETTINGS = exports.SAVE_HOOK_SETTINGS = prefixed('SAVE_HOOK_SETTINGS');
  var SAVE_HOOK_SETTINGS_FAILURE = exports.SAVE_HOOK_SETTINGS_FAILURE = prefixed('SAVE_HOOK_SETTINGS_FAILURE');
  var SAVE_HOOK_SETTINGS_SUCCESS = exports.SAVE_HOOK_SETTINGS_SUCCESS = prefixed('SAVE_HOOK_SETTINGS_SUCCESS');
});