define('bitbucket/internal/feature/dashboard/reducers/paging/suggestion-commits', ['module', 'exports', 'bitbucket/internal/util/reducers', '../../actions'], function (module, exports, _reducers, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = (0, _reducers.reduceByType)({}, babelHelpers.defineProperty({}, _actions.LOAD_PULL_REQUEST_SUGGESTION_COMMITS_SUCCESS, function (state, action) {
        return babelHelpers.extends({}, state, babelHelpers.defineProperty({}, action.meta.suggestionId, action.payload.values.map(function (commit) {
            return commit.id;
        })));
    }));
    module.exports = exports['default'];
});