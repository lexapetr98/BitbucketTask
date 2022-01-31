define('bitbucket/internal/feature/dashboard/reducers/entities', ['module', 'exports', 'redux', './entities/commits', './entities/pull-request-suggestions', './entities/pull-requests', './entities/repositories'], function (module, exports, _redux, _commits, _pullRequestSuggestions, _pullRequests, _repositories) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _commits2 = babelHelpers.interopRequireDefault(_commits);

    var _pullRequestSuggestions2 = babelHelpers.interopRequireDefault(_pullRequestSuggestions);

    var _pullRequests2 = babelHelpers.interopRequireDefault(_pullRequests);

    var _repositories2 = babelHelpers.interopRequireDefault(_repositories);

    exports.default = (0, _redux.combineReducers)({
        pullRequestSuggestions: _pullRequestSuggestions2.default,
        commits: _commits2.default,
        pullRequests: _pullRequests2.default,
        repositories: _repositories2.default
    });
    module.exports = exports['default'];
});