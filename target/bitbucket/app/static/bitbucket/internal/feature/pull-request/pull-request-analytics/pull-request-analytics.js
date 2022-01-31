define('bitbucket/internal/feature/pull-request/pull-request-analytics/pull-request-analytics', ['module', 'exports', 'jquery', 'bitbucket/util/events', 'bitbucket/util/state', 'bitbucket/internal/util/analytics'], function (module, exports, _jquery, _events, _state, _analytics) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    /**
     * Get the role of the current user in the pull request
     *
     * @returns {string}
     */
    function getUserRole() {
        var userRole;
        if (isPRAuthor()) {
            userRole = 'author';
        } else if (isPRReviewer()) {
            userRole = 'reviewer';
        } else if (isPRParticipant()) {
            userRole = 'participant';
        } else {
            userRole = 'other';
        }
        return userRole;
    }

    /**
     * @param {string} eventName
     */
    function handleEventFireAnalytics(eventName) {
        _events2.default.on(eventName, function (data) {
            var analyticsName = eventName.substring('bitbucket.internal.feature.'.length);
            if (eventName.match(/comment.actions.reply|comment.actions.view/)) {
                analyticsName = eventName.substring('bitbucket.internal.feature.pullRequest.'.length);
            }
            var baseAttributes = {
                'pullRequest.id': _state2.default.getPullRequest().id,
                'repository.id': _state2.default.getRepository().id,
                userRole: getUserRole()
            };
            var analyticsData = _jquery2.default.extend({}, baseAttributes, data);
            _analytics2.default.add(analyticsName, analyticsData, true);
        });
    }

    function init() {
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.comment.actions.reply');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.comment.actions.view');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.commit.open');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.commitDiff.view');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.diff.fileChange');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.effectiveDiff.view');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.iterativeDiff.view');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.overview.comment.delete.clicked');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.overview.comment.edit.clicked');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.overview.comment.like.clicked');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.overview.comment.open');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.overview.comment.reply.clicked');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.overview.comment.task.clicked');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.overview.commit.open');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.tab.commits');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.tab.diff');
        handleEventFireAnalytics('bitbucket.internal.feature.pullRequest.tab.overview');
    }

    /**
     * Is the current user the PR owner
     *
     * @returns {boolean}
     */
    function isPRAuthor() {
        return _state2.default.getCurrentUser().id === _state2.default.getPullRequest().author.user.id;
    }

    /**
     * Is the current user a PR reviewer
     *
     * @returns {boolean}
     */
    function isPRReviewer() {
        var reviewers = _state2.default.getPullRequest().reviewers;
        return reviewers.length && reviewers.some(function (reviewer) {
            return reviewer.user.id === _state2.default.getCurrentUser().id;
        });
    }

    /**
     * Is the current user a PR participant
     *
     * @returns {boolean}
     */
    function isPRParticipant() {
        var participants = _state2.default.getPullRequest().participants;
        return participants.length && participants.some(function (participant) {
            return participant.user.id === _state2.default.getCurrentUser().id;
        });
    }

    exports.default = {
        init: init
    };
    module.exports = exports['default'];
});