define('bitbucket/internal/page/login/login', ['module', 'exports', 'jquery', 'bitbucket/internal/widget/captcha/captcha', 'bitbucket/internal/widget/setup-tracking'], function (module, exports, _jquery, _captcha, _setupTracking) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _captcha2 = babelHelpers.interopRequireDefault(_captcha);

    var _setupTracking2 = babelHelpers.interopRequireDefault(_setupTracking);

    function onReady() {
        _setupTracking2.default.trackLoginPage();

        if (location.hash) {
            var $next = (0, _jquery2.default)(':input[name=next]');
            var nextUrl = $next.val();
            if (nextUrl && !/#/.test(nextUrl)) {
                $next.val(nextUrl + location.hash);
            }
        }

        _captcha2.default.initialise('#captcha-image', '#captcha-reload');
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});