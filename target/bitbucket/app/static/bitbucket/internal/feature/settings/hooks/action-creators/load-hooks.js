define('bitbucket/internal/feature/settings/hooks/action-creators/load-hooks', ['exports', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/util/scope-type', '../actions'], function (exports, _navbuilder, _server, _scopeType, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.populateHooks = exports.DEFAULT_PAGE_SIZE = undefined;

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var DEFAULT_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = 25;

    function loadHooksSuccess(payload, type) {
        return {
            type: _actions.LOAD_HOOKS_SUCCESS,
            payload: payload,
            meta: { type: type }
        };
    }

    exports.default = function (currentScope, type) {
        var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
            _ref$start = _ref.start,
            start = _ref$start === undefined ? 0 : _ref$start,
            _ref$limit = _ref.limit,
            limit = _ref$limit === undefined ? DEFAULT_PAGE_SIZE : _ref$limit;

        return function (dispatch) {
            dispatch({
                type: _actions.LOAD_HOOKS,
                meta: { type: type }
            });

            return (0, _server.rest)({
                url: _navbuilder2.default.rest()[(0, _scopeType.scopeNavMethod)(currentScope.type)]().hooks().withParams({ limit: limit, start: start, type: type }).build()
            }).done(function (data) {
                return dispatch(loadHooksSuccess(data, type));
            });
        };
    };

    var populateHooks = exports.populateHooks = loadHooksSuccess;
});