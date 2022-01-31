define('bitbucket/internal/feature/dashboard/reducers/ui/repositories', ['module', 'exports', 'lodash', 'bitbucket/internal/util/reducers', '../../actions', '../../repository-type'], function (module, exports, _lodash, _reducers, _actions, _repositoryType) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _reduceByType;

    var DEFAULT_REPOSITORY_LIST = _repositoryType.RECENT;

    /**
     * Handles load repositories optimistic action
     * @param {Object} state
     * @param {Object} action
     * @param {string?} action.meta.query - for a search, the search query
     * @param {RepositoryType} action.meta.repoType
     * @returns {Object}
     */
    function loadRepositories(state, action) {
        var newState = babelHelpers.extends({}, state, {
            loading: true
        });

        if ((0, _lodash.get)(action, 'meta.query') === (0, _lodash.get)(state, 'currentQuery')) {
            newState.activeType = (0, _lodash.get)(action, 'meta.repoType', null);
        }

        return newState;
    }

    function handleError(state, action) {
        return babelHelpers.extends({}, state, {
            loading: false,
            currentQuery: (0, _lodash.get)(action, 'meta.query'),
            hasError: true,
            activeType: (0, _lodash.get)(action, 'meta.repoType')
        });
    }

    /**
     * Handles load repository completion, and clear repository actions.
     * @param {Object} state
     * @param {Object} action
     * @param {string?} action.meta.query - for a search, the query triggered this action
     * @param {RepositoryType} action.meta.repoType - repostory list type that applies to this action
     * @returns {Object}
     */
    function updateRepositories(state, action) {
        var repoType = (0, _lodash.get)(action, 'meta.repoType');
        var newActiveType = action.type === _actions.CLEAR_REPOSITORIES ? DEFAULT_REPOSITORY_LIST : (0, _lodash.get)(action, 'meta.repoType');
        var focusedIndex = null;
        var count = void 0;

        // set the focus to the first item if:
        if (
        // there's a query, and it's different
        (0, _lodash.get)(action, 'meta.query') !== (0, _lodash.get)(state, [repoType, 'query']) ||
        // or; the active type has changed and the focus hasn't been reset
        (0, _lodash.get)(action, 'meta.repoType') !== newActiveType && state.focusedIndex != null) {
            focusedIndex = 0;
        }

        if ((0, _lodash.get)(action, 'payload')) {
            var valueLen = action.payload.values.length;
            // if there's a query, and it's different, then REPLACE the repo count, else add
            if ((0, _lodash.get)(action, 'meta.query') !== (0, _lodash.get)(state, [state.activeType, 'query'])) {
                count = valueLen;
            } else {
                count = (0, _lodash.get)(state, [state.activeType, 'count'], 0) + valueLen;
            }
        }

        return babelHelpers.extends({}, state, babelHelpers.defineProperty({
            loading: false,
            hasError: false,
            currentQuery: (0, _lodash.get)(action, 'meta.query'),
            activeType: newActiveType,
            focusedIndex: focusedIndex
        }, repoType, {
            query: (0, _lodash.get)(action, 'meta.query'),
            count: count
        }));
    }

    exports.default = (0, _reducers.reduceByType)({}, (_reduceByType = {}, babelHelpers.defineProperty(_reduceByType, _actions.LOAD_REPOSITORIES, loadRepositories), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_REPOSITORIES_FAILURE, handleError), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_REPOSITORIES_SUCCESS, updateRepositories), babelHelpers.defineProperty(_reduceByType, _actions.CLEAR_REPOSITORIES, updateRepositories), babelHelpers.defineProperty(_reduceByType, _actions.REPOSITORIES_FOCUS_NONE, function (state) {
        return babelHelpers.extends({}, state, {
            focusedIndex: null
        });
    }), babelHelpers.defineProperty(_reduceByType, _actions.REPOSITORIES_FOCUS_PREVIOUS, function (state) {
        return babelHelpers.extends({}, state, {
            focusedIndex: Math.max((0, _lodash.get)(state, 'focusedIndex', 1) - 1, 0)
        });
    }), babelHelpers.defineProperty(_reduceByType, _actions.REPOSITORIES_FOCUS_NEXT, function (state) {
        var activeRepoType = (0, _lodash.get)(state, 'activeType');
        var repoLength = (0, _lodash.get)(state, [activeRepoType, 'count'], 0);
        return babelHelpers.extends({}, state, {
            focusedIndex: Math.min((0, _lodash.get)(state, 'focusedIndex', -1) + 1, Math.max(repoLength - 1, 0)) // repoLength - 1 keeps it 0 based
        });
    }), babelHelpers.defineProperty(_reduceByType, _actions.REPOSITORIES_FOCUS_INITIAL, function (state, action) {
        return babelHelpers.extends({}, state, {
            focusedIndex: 0
        });
    }), _reduceByType));
    module.exports = exports['default'];
});