define('bitbucket/internal/widget/captcha/captcha', ['module', 'exports', 'jquery', 'bitbucket/util/navbuilder'], function (module, exports, _jquery, _navbuilder) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    function initialise(captchaImageSelector, refreshAnchorSelector) {
        var $captchaImage = (0, _jquery2.default)(captchaImageSelector);

        (0, _jquery2.default)(refreshAnchorSelector).click(function (e) {
            $captchaImage.attr('src', _navbuilder2.default.captcha().build());
            return false;
        });
    }

    exports.default = {
        initialise: initialise
    };
    module.exports = exports['default'];
});