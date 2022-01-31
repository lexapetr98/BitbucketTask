define('bitbucket/internal/feature/settings/hooks/reducers/entities', ['module', 'exports', 'redux', 'bitbucket/internal/util/reducers', '../actions'], function (module, exports, _redux, _reducers, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _reduceByType;

    var setHook = function setHook(hooks, hook) {
        hooks[hook.details.key] = hook;
        return hooks;
    };

    var hookReducer = function hookReducer(state, _ref) {
        var hook = _ref.payload.hook;
        return setHook(babelHelpers.extends({}, state), hook);
    };

    exports.default = (0, _redux.combineReducers)({
        hooks: (0, _reducers.reduceByType)({}, (_reduceByType = {}, babelHelpers.defineProperty(_reduceByType, _actions.LOAD_HOOKS_SUCCESS, function (state, action) {
            return action.payload.values.reduce(setHook, babelHelpers.extends({}, state));
        }), babelHelpers.defineProperty(_reduceByType, _actions.ENABLE_HOOK_SUCCESS, hookReducer), babelHelpers.defineProperty(_reduceByType, _actions.INHERIT_HOOK_SUCCESS, hookReducer), babelHelpers.defineProperty(_reduceByType, _actions.SAVE_HOOK_SETTINGS_SUCCESS, hookReducer), _reduceByType))
    });
    module.exports = exports['default'];
});