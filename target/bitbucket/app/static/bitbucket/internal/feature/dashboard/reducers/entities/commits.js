define('bitbucket/internal/feature/dashboard/reducers/entities/commits', ['module', 'exports', 'bitbucket/internal/util/reducers', '../../actions'], function (module, exports, _reducers, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = (0, _reducers.reduceByType)({}, babelHelpers.defineProperty({}, _actions.LOAD_PULL_REQUEST_SUGGESTION_COMMITS_SUCCESS, function (state, action) {
        var commits = action.payload.values.reduce(function (commitsById, commit) {
            commitsById[commit.id] = commit;
            return commitsById;
        }, {});

        return babelHelpers.extends({}, state, commits);
    }));
    module.exports = exports['default'];
});