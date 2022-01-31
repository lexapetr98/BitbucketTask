define('bitbucket/internal/feature/dashboard/reducers/ui/pull-request-suggestions', ['module', 'exports', 'lodash', 'bitbucket/internal/feature/dashboard/actions', 'bitbucket/internal/util/reducers'], function (module, exports, _lodash, _actions, _reducers) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _reduceByType;

    var loadPullRequestSuggestions = function loadPullRequestSuggestions(state) {
        return babelHelpers.extends({}, state, { loading: true });
    };
    var loadPullRequestSuggestionsComplete = function loadPullRequestSuggestionsComplete(state) {
        return babelHelpers.extends({}, state, {
            loading: false
        });
    };

    var makeUpdater = function makeUpdater(update) {
        return function (state, _ref) {
            var meta = _ref.meta;
            return (0, _lodash.merge)({}, state, {
                suggestions: babelHelpers.defineProperty({}, meta.suggestionId, update)
            });
        };
    };

    var loadPullRequestSuggestionCommits = makeUpdater({ loading: true });
    var loadPullRequestSuggestionCommitsSuccess = makeUpdater({ loading: false });
    var loadPullRequestSuggestionCommitsFailure = makeUpdater({
        loading: false,
        open: false
    });
    var openPullRequestSuggestionCommits = makeUpdater({ open: true });
    var closePullRequestSuggestionCommits = makeUpdater({ open: false });

    exports.default = (0, _reducers.reduceByType)({}, (_reduceByType = {}, babelHelpers.defineProperty(_reduceByType, _actions.LOAD_PULL_REQUEST_SUGGESTIONS, loadPullRequestSuggestions), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_PULL_REQUEST_SUGGESTIONS_SUCCESS, loadPullRequestSuggestionsComplete), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_PULL_REQUEST_SUGGESTIONS_FAILURE, loadPullRequestSuggestionsComplete), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_PULL_REQUEST_SUGGESTION_COMMITS, loadPullRequestSuggestionCommits), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_PULL_REQUEST_SUGGESTION_COMMITS_SUCCESS, loadPullRequestSuggestionCommitsSuccess), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_PULL_REQUEST_SUGGESTION_COMMITS_FAILURE, loadPullRequestSuggestionCommitsFailure), babelHelpers.defineProperty(_reduceByType, _actions.OPEN_PULL_REQUEST_SUGGESTION_COMMITS, openPullRequestSuggestionCommits), babelHelpers.defineProperty(_reduceByType, _actions.CLOSE_PULL_REQUEST_SUGGESTION_COMMITS, closePullRequestSuggestionCommits), _reduceByType));
    module.exports = exports['default'];
});