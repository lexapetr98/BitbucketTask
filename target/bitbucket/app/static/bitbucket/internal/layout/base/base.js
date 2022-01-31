define('bitbucket/internal/layout/base/base', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/stash-user', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/client-storage', 'bitbucket/internal/util/events', 'bitbucket/internal/util/history', 'bitbucket/internal/widget/aui/dropdown/dropdown', 'bitbucket/internal/widget/aui/form/form'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _pageState, _stashUser, _analytics, _clientStorage, _events, _history, _dropdown, _form) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _stashUser2 = babelHelpers.interopRequireDefault(_stashUser);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    var _dropdown2 = babelHelpers.interopRequireDefault(_dropdown);

    var _form2 = babelHelpers.interopRequireDefault(_form);

    // Only check for debugging params when there is a querystring.
    if (location.search) {
        var uri = _navbuilder2.default.parse(location.href);
        var eveSelector = uri.getQueryParamValue('eve');

        // This is really handy for debugging the event lifecycle of the page, pass ?eve=selector to use (makes most sense with wildcards)
        // Logs to the console the event name, the 'this' context and the arguments passed to the handler.
        eveSelector && _events2.default.on(eveSelector, function () {
            console.log([_events2.default.name()], this, arguments);
        });
    }

    function initUserPageState(currentUserJson) {
        if (currentUserJson) {
            // TODO: Add this to $ij? Means InjectedDataFactory relies on permissionService
            currentUserJson.isAdmin = !!(0, _jquery2.default)('#header').find('a.admin-link').length;
            _pageState2.default.setCurrentUser(new _stashUser2.default(currentUserJson));
        }
    }

    /**
     * Trigger an analytics event containing some demographic information about the user
     * Only trigger this once per browser session
     *
     * @param {string} analyticsSessionKey - the session storage key
     */
    function triggerSessionDemographicAnalytics(analyticsSessionKey) {
        if (!_clientStorage2.default.getSessionItem(analyticsSessionKey)) {
            _clientStorage2.default.setSessionItem(analyticsSessionKey, true);
            _analytics2.default.add('demographics', { d_lang: document.documentElement.lang }, true);
        }
    }

    function onReady(currentUserJson, instanceName) {
        initUserPageState(currentUserJson);

        _dropdown2.default.onReady();
        _form2.default.onReady();

        // for use by keyboard-shortcuts.js, but could be useful elsewhere.
        // I realize this is the wrong place for an encodeURIComponent, but it _should_ do nothing, except for when
        // our build leaves a ${commitHash} here instead of a hex number.
        _aui2.default.params['build-number'] = encodeURIComponent((0, _jquery2.default)('#product-version').attr('data-system-build-number'));

        var $window = (0, _jquery2.default)(window);

        var debouncedResize = _lodash2.default.debounce(function () {
            _events2.default.trigger('window.resize.debounced', $window, $window.width(), $window.height());
        }, 200);
        $window.on('resize', debouncedResize);

        var throttledScroll = _lodash2.default.throttle(function () {
            _events2.default.trigger('window.scroll.throttled', $window, $window.scrollTop());
        }, 25);
        $window.on('scroll', throttledScroll);

        _history2.default.setTitleSuffix(' - ' + instanceName);
        triggerSessionDemographicAnalytics(_clientStorage2.default.buildKey('demographic-analytics', 'user'));
    }

    _events2.default.on('bitbucket.internal.history.changestate', function (e) {
        var $loginLink = (0, _jquery2.default)('#login-link');
        if ($loginLink.length && e.state) {
            // don't rewrite on initial page load and if login-link is not present
            $loginLink.attr('href', _navbuilder2.default.login().next().build());
        }

        // whenever we are changing the url, we need to be sure that the tipsies are cleared.
        (0, _jquery2.default)('body').children('.tipsy').remove();
    });

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});