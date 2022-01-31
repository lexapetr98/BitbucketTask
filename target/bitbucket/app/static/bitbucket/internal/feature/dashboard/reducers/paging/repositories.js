define('bitbucket/internal/feature/dashboard/reducers/paging/repositories', ['module', 'exports', 'lodash', 'bitbucket/internal/util/reducers', '../../actions'], function (module, exports, _lodash, _reducers, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _reduceByType;

    /**
     * Clears a list of repositories - usually triggered when a search query is removed.
     * @param {Object} state
     * @param {Object} action
     * @param {RepositoryType} action.meta.repoType - the RepositoryType that was cleared
     * @returns {Object}
     */
    function clearRepositoryState(state, action) {
        return babelHelpers.extends({}, state, babelHelpers.defineProperty({}, action.meta.repoType, undefined));
    }

    /**
     * Handles successful load of a page of repositories. It sets or updates the list of repository ids for a particular
     * RepositoryType (the repositories themselves are stored by the repositories reducer), as well the paging
     * information for the last loaded page, optionally the query and a callback to load more pages (which is used by
     * search)
     *
     * @param {Object} state
     * @param {Object} action
     * @param {RepositoryType} action.meta.repoType - type of repositories that were loaded
     * @param {string?} action.meta.query - the search query if this was a search
     * @param {Function?} action.meta.loadMoreCallback - for a search, the callback to get the next page of results
     * @param {Object} action.payload - a page of repositories
     * @returns {Object}
     */

    function handleLoadSuccess(state, action) {
        var repoType = action.meta.repoType;
        var repositories = void 0;
        var newRepositories = action.payload.values.map(function (repo) {
            return repo.id;
        });

        // if there's a query, and it's different, then REPLACE the repos, else concat
        if ((0, _lodash.get)(action, 'meta.query') !== (0, _lodash.get)(state, [repoType, 'query'])) {
            repositories = newRepositories;
        } else {
            repositories = (0, _lodash.get)(state, [repoType, 'repositories'], []).concat(newRepositories);
        }

        return babelHelpers.extends({}, state, babelHelpers.defineProperty({}, repoType, {
            query: (0, _lodash.get)(action, 'meta.query'),
            lastPageMeta: (0, _lodash.omit)(action.payload, 'values'),
            repositories: repositories,
            loadMoreCallback: (0, _lodash.get)(action, 'meta.nextSearch')
        }));
    }

    exports.default = (0, _reducers.reduceByType)({}, (_reduceByType = {}, babelHelpers.defineProperty(_reduceByType, _actions.LOAD_REPOSITORIES_SUCCESS, handleLoadSuccess), babelHelpers.defineProperty(_reduceByType, _actions.CLEAR_REPOSITORIES, clearRepositoryState), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_REPOSITORIES_FAILURE, clearRepositoryState), _reduceByType));
    module.exports = exports['default'];
});