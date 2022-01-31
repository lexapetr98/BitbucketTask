define('bitbucket/internal/feature/pull-request/action-creators/change-self-reviewer', ['module', 'exports', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/bbui/actions/pull-request', 'bitbucket/internal/enums', 'bitbucket/internal/model/pull-request-json', 'bitbucket/internal/util/analytics'], function (module, exports, _events, _navbuilder, _server, _pullRequest, _enums, _pullRequestJson, _analytics) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function (pullRequest, user, addOrRemoveSelf, currentUserStatus) {
        var added = addOrRemoveSelf === 'ADD_SELF';
        var repo = pullRequest.toRef.repository;
        var project = repo.project;

        var request = _server2.default.rest({
            type: added ? 'POST' : 'DELETE',
            url: _navbuilder2.default.rest().project(project).repo(repo).pullRequest(pullRequest).participants(added ? null : user).build(),
            data: added ? { user: user, role: 'reviewer' } : null
        }).done(function () {
            _events2.default.trigger(added ? 'bitbucket.internal.feature.pullRequest.self.added' : 'bitbucket.internal.feature.pullRequest.self.removed', null, {
                action: addOrRemoveSelf,
                user: user,
                // pull request properties need to be filtered here as the object can be used by event consumers
                // in Brace models, without filtering there would be additional props on the object that would fail
                // Brace validation.
                pullRequest: (0, _pullRequestJson.filter)(pullRequest)
            });

            var analyticsEventName = 'pullRequest.' + (addOrRemoveSelf === _enums2.default.SelfAction.ADD_SELF ? 'addSelf' : 'removeSelf');
            var analyticsData = {
                userStatus: currentUserStatus || _enums2.default.ApprovalStatus.UNAPPROVED,
                'pullRequest.fromRef.repository.id': pullRequest.fromRef.repository.id,
                'pullRequest.id': pullRequest.id,
                'pullRequest.toRef.repository.id': pullRequest.toRef.repository.id
            };
            _analytics2.default.add(analyticsEventName, analyticsData, true);
        });

        return {
            type: _pullRequest.PR_CHANGE_SELF_REVIEWER,
            payload: {
                pullRequest: pullRequest,
                user: user,
                selfAction: addOrRemoveSelf
            },
            meta: {
                promise: request.then(function (result) {
                    return {
                        pullRequest: pullRequest,
                        user: result ? result.user : null,
                        selfAction: addOrRemoveSelf
                    };
                })
            }
        };
    };

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _enums2 = babelHelpers.interopRequireDefault(_enums);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    module.exports = exports['default'];
});