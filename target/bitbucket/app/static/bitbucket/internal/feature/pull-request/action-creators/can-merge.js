define('bitbucket/internal/feature/pull-request/action-creators/can-merge', ['module', 'exports', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/util/state', 'bitbucket/internal/bbui/actions/pull-request'], function (module, exports, _events, _navbuilder, _server, _state, _pullRequest) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function (pullRequest, timeout) {
        pullRequest = pullRequest || _state2.default.getPullRequest();

        var request = _server2.default.rest({
            url: _navbuilder2.default.rest().currentRepo().pullRequest(pullRequest.id).merge().build(),
            type: 'GET',
            timeout: timeout * 1000
        });

        return {
            type: _pullRequest.PR_CHECK_MERGEABILITY,
            payload: null,
            meta: {
                promise: request.then(function (data) {
                    _events2.default.trigger(data.canMerge ? 'bitbucket.internal.pull-request.can.merge' : 'bitbucket.internal.pull-request.cant.merge', null, pullRequest, data.conflicted, data.vetoes, data.properties, data.outcome);
                    return data;
                })
            }
        };
    };

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    module.exports = exports['default'];
});