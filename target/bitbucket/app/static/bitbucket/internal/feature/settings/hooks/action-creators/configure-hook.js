define('bitbucket/internal/feature/settings/hooks/action-creators/configure-hook', ['exports', '@atlassian/aui', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/util/scope-type', '../actions'], function (exports, _aui, _lodash, _navbuilder, _server, _scopeType, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.saveHookConfiguration = exports.inheritHook = exports.enableHook = exports.editHook = exports.cancelEditHook = undefined;

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var makeAction = function makeAction(type, payload) {
        return { type: type, payload: payload };
    };

    var statusCode = {
        409: false,
        404: false,
        400: false
    };

    var startEditHook = function startEditHook(currentScope, hook, dispatch) {
        dispatch(makeAction(_actions.EDIT_HOOK, { hook: hook }));

        return (0, _server.rest)({
            url: _navbuilder2.default.rest()[(0, _scopeType.scopeNavMethod)(currentScope.type)]().hook(hook.details.key).settings().build(),
            statusCode: statusCode
        }).done(function (config) {
            return dispatch(makeAction(_actions.LOAD_HOOK_SETTINGS_SUCCESS, { hook: hook, config: config }));
        }).fail(function (xhr, textStatus, errorThrown, errors) {
            return dispatch(makeAction(_actions.LOAD_HOOK_SETTINGS_FAILURE, {
                hook: hook,
                error: (0, _lodash.get)(errors, 'errors.0.message', _aui.I18n.getText('bitbucket.web.hooks.settings.load.error', hook.details.name))
            }));
        });
    };

    var cancelEditHook = exports.cancelEditHook = function cancelEditHook(currentScope, hook) {
        return makeAction(_actions.EDIT_HOOK_CANCEL, { hook: hook });
    };

    var editHook = exports.editHook = function editHook(currentScope, hook) {
        return function (dispatch) {
            return startEditHook(currentScope, hook, dispatch);
        };
    };

    var enableHook = exports.enableHook = function enableHook(currentScope, hook, enable) {
        return function (dispatch) {
            dispatch(makeAction(_actions.ENABLE_HOOK, { hook: hook, enable: enable }));

            if (enable && hook.details.configFormKey) {
                return startEditHook(currentScope, hook, dispatch);
            }

            return (0, _server.rest)({
                url: _navbuilder2.default.rest()[(0, _scopeType.scopeNavMethod)(currentScope.type)]().hook(hook.details.key).enabled().build(),
                type: enable ? _server.method.PUT : _server.method.DELETE,
                statusCode: statusCode
            }).done(function (updatedHook) {
                return dispatch(makeAction(_actions.ENABLE_HOOK_SUCCESS, { hook: updatedHook }));
            }).fail(function (xhr, textStatus, errorThrown, errors) {
                return dispatch(makeAction(_actions.ENABLE_HOOK_FAILURE, {
                    hook: hook,
                    enable: enable,
                    error: (0, _lodash.get)(errors, 'errors.0.message', enable ? _aui.I18n.getText('bitbucket.web.hooks.enable.error', hook.details.name) : _aui.I18n.getText('bitbucket.web.hooks.disable.error', hook.details.name))
                }));
            });
        };
    };

    var inheritHook = exports.inheritHook = function inheritHook(currentScope, hook) {
        return function (dispatch) {
            dispatch(makeAction(_actions.INHERIT_HOOK, { hook: hook }));

            var url = _navbuilder2.default.rest().currentRepo().hook(hook.details.key).build();

            return (0, _server.rest)({
                url: url,
                type: _server.method.DELETE,
                statusCode: statusCode
            }).fail(function (xhr, textStatus, errorThrown, errors) {
                return dispatch(makeAction(_actions.INHERIT_HOOK_FAILURE, {
                    hook: hook,
                    error: (0, _lodash.get)(errors, 'errors.0.message', _aui.I18n.getText('bitbucket.web.hooks.inherit.error', hook.details.name))
                }));
            }).then(function () {
                return (0, _server.rest)({ url: url });
            }).done(function (updatedHook) {
                return dispatch(makeAction(_actions.INHERIT_HOOK_SUCCESS, { hook: updatedHook }));
            });
        };
    };

    var saveHookConfiguration = exports.saveHookConfiguration = function saveHookConfiguration(currentScope, hook, config) {
        return function (dispatch) {
            dispatch(makeAction(_actions.SAVE_HOOK_SETTINGS, { hook: hook, config: config }));

            //Always save to the `enabled` endpoint rather than the `settings` one as it handles both the edit and enable use-cases and returns the updated hook
            return (0, _server.rest)({
                url: _navbuilder2.default.rest()[(0, _scopeType.scopeNavMethod)(currentScope.type)]().hook(hook.details.key).enabled().build(),
                type: _server.method.PUT,
                data: config,
                statusCode: statusCode
            }).done(function (updatedHook) {
                return dispatch(makeAction(_actions.SAVE_HOOK_SETTINGS_SUCCESS, {
                    hook: updatedHook,
                    config: config
                }));
            }).fail(function (xhr, textStatus, errorThrown, _ref) {
                var errors = _ref.errors;
                return dispatch(makeAction(_actions.SAVE_HOOK_SETTINGS_FAILURE, { hook: hook, config: config, errors: errors }));
            });
        };
    };
});