define('bitbucket/internal/feature/settings/hooks/reducers/ui', ['module', 'exports', '@atlassian/aui', 'lodash', 'bitbucket/internal/bbui/aui-react/flags', 'bitbucket/internal/util/reducers', '../actions'], function (module, exports, _aui, _lodash, _flags, _reducers, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _reduceByType;

    var enableHookComplete = function enableHookComplete(state, _ref) {
        var hook = _ref.payload.hook;
        return babelHelpers.extends({}, state, {
            busyHooks: (0, _lodash.without)(state.busyHooks, hook.details.key)
        });
    };

    var editHookComplete = function editHookComplete(state, _ref2) {
        var hook = _ref2.payload.hook;
        return babelHelpers.extends({}, state, {
            busyHooks: (0, _lodash.without)(state.busyHooks, hook.details.key),
            editingHook: undefined
        });
    };

    var inheritHookComplete = function inheritHookComplete(state, _ref3) {
        var hook = _ref3.payload.hook;
        return babelHelpers.extends({}, state, {
            busyHooks: (0, _lodash.without)(state.busyHooks, hook.details.key)
        });
    };

    var loadHooksComplete = function loadHooksComplete(state, _ref4) {
        var type = _ref4.meta.type;
        return babelHelpers.extends({}, state, {
            loadingHookTypes: (0, _lodash.without)(state.loadingHookTypes, type)
        });
    };

    var addNotification = function addNotification(state, _ref5) {
        var body = _ref5.body,
            _ref5$close = _ref5.close,
            close = _ref5$close === undefined ? _flags.closeType.AUTO : _ref5$close,
            hook = _ref5.hook,
            _ref5$type = _ref5.type,
            type = _ref5$type === undefined ? _flags.flagType.ERROR : _ref5$type;
        return {
            notifications: state.notifications.concat({
                body: body,
                close: close,
                id: hook.details.key + '-' + Date.now(),
                type: type
            })
        };
    };

    var removeNotification = function removeNotification(state, id) {
        return {
            notifications: state.notifications.filter(function (notification) {
                return notification.id !== id;
            })
        };
    };

    exports.default = (0, _reducers.reduceByType)({
        busyHooks: [],
        loadingHookTypes: [],
        notifications: [],
        editingHook: undefined
    }, (_reduceByType = {}, babelHelpers.defineProperty(_reduceByType, _actions.ENABLE_HOOK, function (state, _ref6) {
        var hook = _ref6.payload.hook;
        return babelHelpers.extends({}, state, {
            busyHooks: (0, _lodash.uniq)(state.busyHooks.concat(hook.details.key))
        });
    }), babelHelpers.defineProperty(_reduceByType, _actions.ENABLE_HOOK_SUCCESS, function (state, action) {
        var hook = action.payload.hook;


        return babelHelpers.extends({}, enableHookComplete(state, action), addNotification(state, {
            body: hook.enabled ? _aui.I18n.getText('bitbucket.web.hooks.enable.success', hook.details.name) : _aui.I18n.getText('bitbucket.web.hooks.disable.success', hook.details.name),
            hook: hook,
            type: _flags.flagType.SUCCESS
        }));
    }), babelHelpers.defineProperty(_reduceByType, _actions.ENABLE_HOOK_FAILURE, function (state, action) {
        var _action$payload = action.payload,
            error = _action$payload.error,
            hook = _action$payload.hook;


        return babelHelpers.extends({}, enableHookComplete(state, action), addNotification(state, {
            body: error,
            hook: hook
        }));
    }), babelHelpers.defineProperty(_reduceByType, _actions.EDIT_HOOK, function (state, _ref7) {
        var hook = _ref7.payload.hook;
        return babelHelpers.extends({}, state, {
            editingHook: { id: hook.details.key },
            busyHooks: (0, _lodash.uniq)(state.busyHooks.concat(hook.details.key))
        });
    }), babelHelpers.defineProperty(_reduceByType, _actions.EDIT_HOOK_CANCEL, editHookComplete), babelHelpers.defineProperty(_reduceByType, _actions.INHERIT_HOOK, function (state, _ref8) {
        var hook = _ref8.payload.hook;
        return babelHelpers.extends({}, state, {
            busyHooks: (0, _lodash.uniq)(state.busyHooks.concat(hook.details.key))
        });
    }), babelHelpers.defineProperty(_reduceByType, _actions.INHERIT_HOOK_FAILURE, function (state, action) {
        var _action$payload2 = action.payload,
            error = _action$payload2.error,
            hook = _action$payload2.hook;


        return babelHelpers.extends({}, inheritHookComplete(state, action), addNotification(state, {
            body: error,
            hook: hook
        }));
    }), babelHelpers.defineProperty(_reduceByType, _actions.INHERIT_HOOK_SUCCESS, function (state, action) {
        var hook = action.payload.hook;


        return babelHelpers.extends({}, inheritHookComplete(state, action), addNotification(state, {
            body: _aui.I18n.getText('bitbucket.web.hooks.inherit.success', hook.details.name),
            hook: hook,
            type: _flags.flagType.SUCCESS
        }));
    }), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_HOOK_SETTINGS_FAILURE, function (state, action) {
        var _action$payload3 = action.payload,
            error = _action$payload3.error,
            hook = _action$payload3.hook;


        return babelHelpers.extends({}, editHookComplete(state, action), addNotification(state, {
            body: error,
            hook: hook
        }));
    }), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_HOOK_SETTINGS_SUCCESS, function (state, _ref9) {
        var _ref9$payload = _ref9.payload,
            hook = _ref9$payload.hook,
            _ref9$payload$config = _ref9$payload.config,
            config = _ref9$payload$config === undefined ? {} : _ref9$payload$config;

        //It's possible to get a valid, empty config back from the server, so default to {}
        var editingHook = state.editingHook;

        if (!editingHook || editingHook.id !== hook.details.key) {
            return state;
        }

        return babelHelpers.extends({}, state, {
            editingHook: babelHelpers.extends({}, editingHook, {
                config: config
            })
        });
    }), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_HOOKS, function (state, _ref10) {
        var type = _ref10.meta.type;
        return babelHelpers.extends({}, state, {
            loadingHookTypes: (0, _lodash.uniq)(state.loadingHookTypes.concat(type))
        });
    }), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_HOOKS_SUCCESS, loadHooksComplete), babelHelpers.defineProperty(_reduceByType, _actions.NOTIFICATION_DISMISSED, function (state, _ref11) {
        var id = _ref11.payload.id;
        return babelHelpers.extends({}, state, removeNotification(state, id));
    }), babelHelpers.defineProperty(_reduceByType, _actions.SAVE_HOOK_SETTINGS, function (state, _ref12) {
        var _ref12$payload = _ref12.payload,
            config = _ref12$payload.config,
            hook = _ref12$payload.hook;

        var editingHook = state.editingHook;

        if (!editingHook || editingHook.id !== hook.details.key) {
            return state;
        }

        return babelHelpers.extends({}, state, {
            editingHook: babelHelpers.extends({}, editingHook, {
                config: config,
                saving: true
            })
        });
    }), babelHelpers.defineProperty(_reduceByType, _actions.SAVE_HOOK_SETTINGS_FAILURE, function (state, action) {
        var _action$payload4 = action.payload,
            hook = _action$payload4.hook,
            errors = _action$payload4.errors;

        var editingHook = state.editingHook;

        if (!editingHook || editingHook.id !== hook.details.key) {
            return state;
        }

        return babelHelpers.extends({}, state, {
            editingHook: babelHelpers.extends({}, editingHook, {
                errors: errors,
                saving: false
            })
        });
    }), babelHelpers.defineProperty(_reduceByType, _actions.SAVE_HOOK_SETTINGS_SUCCESS, function (state, action) {
        var hook = action.payload.hook;


        return babelHelpers.extends({}, editHookComplete(state, action), addNotification(state, {
            body: _aui.I18n.getText('bitbucket.web.hooks.settings.saved', hook.details.name),
            hook: hook,
            type: _flags.flagType.SUCCESS
        }));
    }), _reduceByType));
    module.exports = exports['default'];
});