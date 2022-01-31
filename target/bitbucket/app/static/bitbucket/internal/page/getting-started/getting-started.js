define('bitbucket/internal/page/getting-started/getting-started', ['module', 'exports', '@atlassian/aui', 'jquery'], function (module, exports, _aui, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function onReady(wasRedirected) {
        _aui2.default.trigger('analyticsEvent', {
            name: 'stash.page.gettingstarted.visited',
            data: {
                origin: wasRedirected ? 'login redirect' : 'direct link'
            }
        });

        (0, _jquery2.default)('#getting-started-header-cta-link, #getting-started-footer-cta-button').on('click', function (e) {
            if (e.target.tagName === 'BUTTON' || e.target.getAttribute('href') === '#') {
                e.preventDefault();
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location = _aui2.default.contextPath() || '/'; // empty string is treated differently by browsers.
                }
            }
        });

        (0, _jquery2.default)('#getting-started-header-cta-link').on('click', function () {
            _aui2.default.trigger('analyticsEvent', {
                name: 'stash.page.gettingstarted.gitonwithit.clicked',
                data: {
                    pageLocation: 'top'
                }
            });
        });

        (0, _jquery2.default)('#getting-started-footer-cta-button').on('click', function () {
            _aui2.default.trigger('analyticsEvent', {
                name: 'stash.page.gettingstarted.gitonwithit.clicked',
                data: {
                    pageLocation: 'bottom'
                }
            });
        });

        (0, _jquery2.default)('#getting-started-footer-gitmicrosite-link').on('click', function () {
            _aui2.default.trigger('analyticsEvent', {
                name: 'stash.page.gettingstarted.gitmicrosite.clicked'
            });
        });

        (0, _jquery2.default)('#getting-started-footer-sourcetree-link').on('click', function () {
            _aui2.default.trigger('analyticsEvent', {
                name: 'stash.page.gettingstarted.sourcetree.clicked'
            });
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});