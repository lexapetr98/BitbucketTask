define('bitbucket/internal/bbui/reducers/pull-request-reviewers', ['module', 'exports', 'lodash', 'bitbucket/internal/enums', 'bitbucket/internal/util/reducers', '../actions/pull-request', '../utils/merge-object-in-array', '../utils/replace-state-with-rollback'], function (module, exports, _lodash, _enums, _reducers, _pullRequest, _mergeObjectInArray, _replaceStateWithRollback) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _mergeObjectInArray2 = babelHelpers.interopRequireDefault(_mergeObjectInArray);

    var _replaceStateWithRollback2 = babelHelpers.interopRequireDefault(_replaceStateWithRollback);

    var _reduceByType;

    exports.default = (0, _reducers.reduceByType)([], (_reduceByType = {}, babelHelpers.defineProperty(_reduceByType, _pullRequest.PR_CHANGE_REVIEWER_STATE, function (reviewers, action) {
        var reviewerFinder = function reviewerFinder(reviewer) {
            return action.payload.user && reviewer.user.name === action.payload.user.name;
        };

        return (0, _replaceStateWithRollback2.default)(reviewers, action, {
            forward: function forward() {
                return (0, _mergeObjectInArray2.default)(reviewers, reviewerFinder, {
                    status: action.payload.newState
                });
            }
        });
    }), babelHelpers.defineProperty(_reduceByType, _pullRequest.PR_CHANGE_SELF_REVIEWER, function (reviewers, action) {
        return (0, _replaceStateWithRollback2.default)(reviewers, action, {
            forward: function forward() {
                switch (action.payload.selfAction) {
                    case _enums.SelfAction.ADD_SELF:
                        return reviewers.concat([{
                            role: _enums.ParticipantRole.REVIEWER,
                            status: _enums.ApprovalStatus.UNAPPROVED,
                            user: action.payload.user
                        }]);
                    case _enums.SelfAction.REMOVE_SELF:
                        var reviewersClone = _lodash2.default.assign([], reviewers);
                        return _lodash2.default.remove(reviewersClone, function (reviewer) {
                            return reviewer.user.name !== action.payload.user.name;
                        });
                    default:
                        console.warn('Unknown reviewer action');
                }
            }
        });
    }), _reduceByType));
    module.exports = exports['default'];
});