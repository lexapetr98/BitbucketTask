define('bitbucket/internal/feature/dashboard/action-creators/load-pull-request-suggestions', ['exports', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/bbui/aui-react/avatar', '../actions'], function (exports, _navbuilder, _server, _avatar, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.populateSuggestions = undefined;
    exports.default = loadPullRequestSuggestions;

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var LIMIT = 3;
    var SINCE = 86400; // 24 hrs as seconds

    var url = _navbuilder2.default.rest().addPathComponents('dashboard', 'pull-request-suggestions').withParams({
        changesSince: SINCE,
        limit: LIMIT,
        avatarSize: _avatar.AvatarSize.XSMALL
    }).build();

    function loadPullRequestSuggestions() {
        return function (dispatch) {
            dispatch({
                type: _actions.LOAD_PULL_REQUEST_SUGGESTIONS
            });

            return (0, _server.rest)({
                url: url,
                statusCode: {
                    // never show errors for this request
                    '*': false
                }
            }).done(function (data) {
                return dispatch(loadPullRequestSuggestionsSuccess(data));
            }).fail(function (data) {
                return dispatch(loadPullRequestSuggestionsFailure(data));
            });
        };
    }

    function loadPullRequestSuggestionsSuccess(payload) {
        return {
            type: _actions.LOAD_PULL_REQUEST_SUGGESTIONS_SUCCESS,
            payload: payload
        };
    }

    function loadPullRequestSuggestionsFailure(payload) {
        return {
            type: _actions.LOAD_PULL_REQUEST_SUGGESTIONS_FAILURE,
            payload: payload
        };
    }

    var populateSuggestions = exports.populateSuggestions = function populateSuggestions(pullRequestSuggestions) {
        return loadPullRequestSuggestionsSuccess(pullRequestSuggestions);
    };
});