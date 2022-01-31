define('bitbucket/internal/feature/dashboard/reducers/entities/pull-requests', ['module', 'exports', 'bitbucket/internal/bbui/utils/pull-request-unique-id', 'bitbucket/internal/util/reducers', '../../actions'], function (module, exports, _pullRequestUniqueId, _reducers, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _pullRequestUniqueId2 = babelHelpers.interopRequireDefault(_pullRequestUniqueId);

    exports.default = (0, _reducers.reduceByType)({}, babelHelpers.defineProperty({}, _actions.LOAD_PULL_REQUESTS_SUCCESS, function (state, action) {
        var pullRequests = babelHelpers.extends({}, state);

        action.payload.values.forEach(function (pullRequest) {
            // This is inefficient. We do this to re-trigger the fetch of the build status
            pullRequests[(0, _pullRequestUniqueId2.default)(pullRequest)] = pullRequest;
        });

        return pullRequests;
    }));
    module.exports = exports['default'];
});