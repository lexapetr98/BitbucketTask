define('bitbucket/internal/feature/dashboard/selectors/pull-request-suggestions', ['exports', 'lodash', 'reselect'], function (exports, _lodash, _reselect) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.pullRequestSuggestionsSelector = exports.getUISuggestions = exports.getPagingSuggestionCommits = exports.getCommits = exports.getSuggestions = undefined;
    var getSuggestions = exports.getSuggestions = function getSuggestions(state) {
        return (0, _lodash.get)(state, 'entities.pullRequestSuggestions');
    };
    var getCommits = exports.getCommits = function getCommits(state) {
        return (0, _lodash.get)(state, 'entities.commits');
    };
    var getPagingSuggestionCommits = exports.getPagingSuggestionCommits = function getPagingSuggestionCommits(state) {
        return (0, _lodash.get)(state, 'paging.pullRequestSuggestionCommits');
    };
    var getUISuggestions = exports.getUISuggestions = function getUISuggestions(state) {
        return (0, _lodash.get)(state, 'ui.pullRequestSuggestions.suggestions', {});
    };

    var pullRequestSuggestionsSelector = exports.pullRequestSuggestionsSelector = (0, _reselect.createSelector)([getSuggestions, getUISuggestions, getCommits, getPagingSuggestionCommits], function (suggestions, uiSuggestions, commits, commitsForSuggestion) {
        return (0, _lodash.reduce)(suggestions, function (enrichedSuggestions, suggestion, suggestionId) {
            enrichedSuggestions[suggestionId] = babelHelpers.extends({}, suggestion, uiSuggestions[suggestionId], {
                id: suggestionId,
                commits: (0, _lodash.map)(commitsForSuggestion[suggestionId], function (commitId) {
                    return commits[commitId];
                })
            });
            return enrichedSuggestions;
        }, {});
    });
});