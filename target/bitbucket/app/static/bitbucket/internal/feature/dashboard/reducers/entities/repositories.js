define('bitbucket/internal/feature/dashboard/reducers/entities/repositories', ['module', 'exports', 'bitbucket/internal/util/reducers', '../../actions'], function (module, exports, _reducers, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = (0, _reducers.reduceByType)({}, babelHelpers.defineProperty({}, _actions.LOAD_REPOSITORIES_SUCCESS, function (state, action) {
        // TODO this reducer should be smarter about when new objects are created to ensure downstream component update / memoisation is correct
        var repos = action.payload.values.reduce(function (memo, repo) {
            if (state.hasOwnProperty(repo.id)) {
                memo[repo.id] = babelHelpers.extends({}, state[repo.id], repo);
            } else {
                memo[repo.id] = repo;
            }

            return memo;
        }, {});

        return babelHelpers.extends({}, state, repos);
    }));
    module.exports = exports['default'];
});