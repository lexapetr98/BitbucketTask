define('bitbucket/internal/feature/dashboard/reducers/ui/pull-requests', ['module', 'exports', 'lodash', 'bitbucket/internal/feature/dashboard/actions', 'bitbucket/internal/util/reducers'], function (module, exports, _lodash, _actions, _reducers) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _reduceByType;

    function loadPullRequests(state, action) {
        return babelHelpers.extends({}, state, babelHelpers.defineProperty({}, action.meta.type, babelHelpers.extends({}, (0, _lodash.get)(state, action.meta.type, {}), {
            loading: true
        })));
    }

    function loadPullRequestsComplete(state, action) {
        return babelHelpers.extends({}, state, babelHelpers.defineProperty({}, action.meta.type, babelHelpers.extends({}, (0, _lodash.get)(state, action.meta.type, {}), {
            loading: false
        })));
    }

    exports.default = (0, _reducers.reduceByType)({}, (_reduceByType = {}, babelHelpers.defineProperty(_reduceByType, _actions.LOAD_PULL_REQUESTS, loadPullRequests), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_PULL_REQUESTS_SUCCESS, loadPullRequestsComplete), babelHelpers.defineProperty(_reduceByType, _actions.LOAD_PULL_REQUESTS_FAILURE, loadPullRequestsComplete), _reduceByType));
    module.exports = exports['default'];
});