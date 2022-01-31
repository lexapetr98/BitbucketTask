define('bitbucket/internal/feature/dashboard/action-creators/suggestion-commits', ['exports', 'bitbucket/util/navbuilder', 'bitbucket/util/server', '../actions'], function (exports, _navbuilder, _server, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.closePullRequestSuggestionCommits = exports.openPullRequestSuggestionCommits = undefined;
    exports.default = loadPullRequestSuggestionCommits;

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var LIMIT = 5;

    function loadPullRequestSuggestionCommits(_ref) {
        var repository = _ref.repository,
            refChange = _ref.refChange,
            suggestionId = _ref.id;

        var url = _navbuilder2.default.rest().project(repository.project).repo(repository).commits().since(refChange.fromHash).withParams({
            until: refChange.toHash,
            limit: LIMIT
        }).build();

        return function (dispatch) {
            dispatch({
                type: _actions.LOAD_PULL_REQUEST_SUGGESTION_COMMITS,
                meta: { suggestionId: suggestionId }
            });

            return (0, _server.rest)({
                url: url
            }).done(function (data) {
                return dispatch(loadPullRequestSuggestionCommitsSuccess(data, suggestionId));
            }).fail(function (data) {
                return dispatch(loadPullRequestSuggestionCommitsFailure(data, suggestionId));
            });
        };
    }

    var loadPullRequestSuggestionCommitsSuccess = function loadPullRequestSuggestionCommitsSuccess(payload, suggestionId) {
        return {
            type: _actions.LOAD_PULL_REQUEST_SUGGESTION_COMMITS_SUCCESS,
            payload: payload,
            meta: { suggestionId: suggestionId }
        };
    };

    var loadPullRequestSuggestionCommitsFailure = function loadPullRequestSuggestionCommitsFailure(payload, suggestionId) {
        return {
            type: _actions.LOAD_PULL_REQUEST_SUGGESTION_COMMITS_FAILURE,
            payload: payload,
            meta: { suggestionId: suggestionId }
        };
    };

    var openPullRequestSuggestionCommits = exports.openPullRequestSuggestionCommits = function openPullRequestSuggestionCommits(_ref2) {
        var suggestionId = _ref2.id;
        return {
            type: _actions.OPEN_PULL_REQUEST_SUGGESTION_COMMITS,
            meta: { suggestionId: suggestionId }
        };
    };

    var closePullRequestSuggestionCommits = exports.closePullRequestSuggestionCommits = function closePullRequestSuggestionCommits(_ref3) {
        var suggestionId = _ref3.id;
        return {
            type: _actions.CLOSE_PULL_REQUEST_SUGGESTION_COMMITS,
            meta: { suggestionId: suggestionId }
        };
    };
});