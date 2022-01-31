define('bitbucket/internal/feature/dashboard/reducers/paging', ['module', 'exports', 'redux', './paging/pull-requests', './paging/repositories', './paging/suggestion-commits'], function (module, exports, _redux, _pullRequests, _repositories, _suggestionCommits) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _pullRequests2 = babelHelpers.interopRequireDefault(_pullRequests);

    var _repositories2 = babelHelpers.interopRequireDefault(_repositories);

    var _suggestionCommits2 = babelHelpers.interopRequireDefault(_suggestionCommits);

    exports.default = (0, _redux.combineReducers)({
        pullRequests: _pullRequests2.default,
        repositories: _repositories2.default,
        pullRequestSuggestionCommits: _suggestionCommits2.default
    });
    module.exports = exports['default'];
});