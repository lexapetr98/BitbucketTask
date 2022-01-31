define('bitbucket/internal/bbui/reducers/pull-request-can-merge', ['module', 'exports', 'bitbucket/internal/util/reducers', '../actions/pull-request', '../pull-request-header/actions', '../utils/merge-state-with-rollback'], function (module, exports, _reducers, _pullRequest, _actions, _mergeStateWithRollback) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _mergeStateWithRollback2 = babelHelpers.interopRequireDefault(_mergeStateWithRollback);

    var _reduceByType;

    var defaultState = {
        canMerge: false,
        conflicted: null,
        vetoes: null,
        properties: null,
        isChecking: false,
        showDialog: false
    };

    exports.default = (0, _reducers.reduceByType)(defaultState, (_reduceByType = {}, babelHelpers.defineProperty(_reduceByType, _pullRequest.PR_CHECK_MERGEABILITY, function (state, action) {
        return (0, _mergeStateWithRollback2.default)(state, action, {
            forward: function forward() {
                return {
                    isChecking: true
                };
            },
            commit: function commit() {
                return babelHelpers.extends({}, action.payload, {
                    isChecking: false
                });
            }
        });
    }), babelHelpers.defineProperty(_reduceByType, _actions.PR_SHOW_MERGE_ERRORS, function (state, action) {
        return babelHelpers.extends({}, state, {
            showDialog: true
        });
    }), babelHelpers.defineProperty(_reduceByType, _actions.PR_HIDE_MERGE_ERRORS, function (state, action) {
        return babelHelpers.extends({}, state, {
            showDialog: false
        });
    }), _reduceByType));
    module.exports = exports['default'];
});