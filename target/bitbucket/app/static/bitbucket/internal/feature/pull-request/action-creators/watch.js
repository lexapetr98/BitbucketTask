define('bitbucket/internal/feature/pull-request/action-creators/watch', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/bbui/actions/pull-request', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/events'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _server, _pullRequest, _pageState, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function (options) {
        var promise;
        options = _lodash2.default.assign({}, defaultOptions, options);

        // Do not make the REST call if the change is stateOnly
        if (options.stateOnly) {
            promise = _jquery2.default.Deferred().resolve();
        } else {
            var url = _navbuilder2.default.rest().currentPullRequest().watch().build();
            promise = _server2.default.rest({
                url: url,
                type: options.watchState ? 'POST' : 'DELETE',
                statusCode: {
                    401: function _(xhr, textStatus, errorThrown, errors, dominantError) {
                        return _lodash2.default.assign({}, dominantError, {
                            title: _aui2.default.I18n.getText('bitbucket.web.watch.default.error.401.title'),
                            message: _aui2.default.I18n.getText('bitbucket.web.watch.default.error.401.message'),
                            fallbackUrl: false,
                            shouldReload: true
                        });
                    },
                    409: function _(xhr, textStatus, errorThrown, errors, dominantError) {
                        return _lodash2.default.assign({}, dominantError, {
                            title: _aui2.default.I18n.getText('bitbucket.web.watch.default.error.409.title'),
                            fallbackUrl: false,
                            shouldReload: true
                        });
                    }
                }
            });
        }

        promise.done(function () {
            _pageState2.default.setIsWatching(options.watchState);
            var eventName = options.watchState ? 'bitbucket.internal.web.watch-button.added' : 'bitbucket.internal.web.watch-button.removed';
            // Note that the original event passed in a context (the Watch button instance)
            _events2.default.trigger(eventName, null, options);
        });

        return {
            type: _pullRequest.PR_WATCH,
            payload: options.watchState,
            meta: {
                promise: promise
            }
        };
    };

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var defaultOptions = {
        stateOnly: false
    };

    module.exports = exports['default'];
});