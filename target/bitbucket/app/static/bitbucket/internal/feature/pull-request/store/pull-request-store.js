define('bitbucket/internal/feature/pull-request/store/pull-request-store', ['module', 'exports', 'bitbucket/internal/bbui/reducers/current-user', 'bitbucket/internal/bbui/reducers/pull-request', 'bitbucket/internal/bbui/utils/promise-middleware', 'bitbucket/internal/util/redux'], function (module, exports, _currentUser, _pullRequest, _promiseMiddleware, _redux) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function (initialState) {
        return (0, _redux.legacyCustomCreateStore)({
            pullRequest: _pullRequest2.default,
            currentUser: _currentUser2.default
        }, initialState, _promiseMiddleware2.default);
    };

    var _currentUser2 = babelHelpers.interopRequireDefault(_currentUser);

    var _pullRequest2 = babelHelpers.interopRequireDefault(_pullRequest);

    var _promiseMiddleware2 = babelHelpers.interopRequireDefault(_promiseMiddleware);

    module.exports = exports['default'];
});