define('bitbucket/internal/bbui/reducers/pull-request-watch', ['module', 'exports', 'bitbucket/internal/util/reducers', '../actions/pull-request', '../utils/replace-state-with-rollback'], function (module, exports, _reducers, _pullRequest, _replaceStateWithRollback) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _replaceStateWithRollback2 = babelHelpers.interopRequireDefault(_replaceStateWithRollback);

    var _reduceByType;

    exports.default = (0, _reducers.reduceByType)(false, (_reduceByType = {}, babelHelpers.defineProperty(_reduceByType, _pullRequest.PR_WATCH, function (state, action) {
        return (0, _replaceStateWithRollback2.default)(state, action, {
            forward: function forward() {
                return action.payload;
            }
        });
    }), babelHelpers.defineProperty(_reduceByType, _pullRequest.PR_SET_IS_WATCHING, function (state, action) {
        return action.payload;
    }), _reduceByType));
    module.exports = exports['default'];
});