define('bitbucket/internal/feature/pull-request/action-creators/change-reviewer-status', ['module', 'exports', 'lodash', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/bbui/actions/pull-request', 'bitbucket/internal/enums', 'bitbucket/internal/model/pull-request-json'], function (module, exports, _lodash, _events, _navbuilder, _server, _pullRequest, _enums, _pullRequestJson) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function (options) {
        var repo = options.pullRequest.toRef.repository;
        var project = repo.project;
        var user = options.user;

        var request = _server2.default.rest({
            type: 'PUT',
            url: _navbuilder2.default.rest().project(project).repo(repo).pullRequest(options.pullRequest).participants(user).withParams({
                avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                    size: 'xsmall'
                })
            }).build(),
            data: { status: options.newStatus }
        });

        options = _lodash2.default.merge(options, {
            request: request,
            prId: Number(options.pullRequest.id),
            user: user
        });
        legacyEvents(options);

        return {
            type: _pullRequest.PR_CHANGE_REVIEWER_STATE,
            payload: {
                pullRequest: options.pullRequest,
                user: options.user,
                newState: options.newStatus
            },
            meta: {
                promise: request.then(function (result) {
                    _events2.default.trigger('bitbucket.internal.feature.pullRequest.reviewerStatus.changed', null, {
                        // pull request properties need to be filtered here as the object can be used by event consumers
                        // in Brace models, without filtering there would be additional props  on the object that would fail
                        // Brace validation.
                        pullRequest: (0, _pullRequestJson.filter)(options.pullRequest),
                        user: result.user,
                        newState: result.status,
                        oldState: options.oldStatus
                    });
                    return {
                        pullRequest: options.pullRequest,
                        user: result.user,
                        newState: result.status
                    };
                })
            }
        };
    };

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _enums2 = babelHelpers.interopRequireDefault(_enums);

    // Can be removed when activity items are handled by BBUI
    function legacyEvents(options) {
        function fireEvent(eventName, approved) {
            _events2.default.trigger(eventName, null, _lodash2.default.merge(options, {
                approved: approved,
                // pull request properties need to be filtered here as the object can be used by event consumers
                // in Brace models, without filtering there would be additional props on the object that would fail
                // Brace validation.
                pullRequest: (0, _pullRequestJson.filter)(options.pullRequest)
            }));
        }

        if (options.newStatus !== _enums2.default.ApprovalStatus.APPROVED && options.oldStatus !== _enums2.default.ApprovalStatus.APPROVED) {
            // no change to approval - just fire needs work event
            options.request.then(function () {
                var added = options.newStatus === _enums2.default.ApprovalStatus.NEEDS_WORK;
                fireEvent('bitbucket.internal.widget.needs-work.' + (added ? 'added' : 'removed'), added);
            });
            return;
        }

        var approving = options.newStatus === _enums2.default.ApprovalStatus.APPROVED;
        var eventMap = approving ? {
            ing: 'bitbucket.internal.widget.approve-button.adding',
            ed: 'bitbucket.internal.widget.approve-button.added',
            failed: 'bitbucket.internal.widget.approve-button.add.failed'
        } : {
            ing: 'bitbucket.internal.widget.approve-button.removing',
            ed: 'bitbucket.internal.widget.approve-button.removed',
            failed: 'bitbucket.internal.widget.approve-button.remove.failed'
        };

        fireEvent(eventMap.ing, approving);
        options.request.then(function () {
            fireEvent(eventMap.ed, approving);
        }, function () {
            fireEvent(eventMap.failed, !approving);
        });
    }

    module.exports = exports['default'];
});