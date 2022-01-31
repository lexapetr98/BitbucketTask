define('bitbucket/internal/page/admin/authentication', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function onReady(publicSignUpButtonSelector, captchaOnSignButtonUpSelector) {
        var $captchaButton = (0, _jquery2.default)(captchaOnSignButtonUpSelector);
        var $signupButton = (0, _jquery2.default)(publicSignUpButtonSelector);

        var setCaptchaFromPublicSignup = function setCaptchaFromPublicSignup() {
            if ($signupButton.prop('checked')) {
                $captchaButton.prop('disabled', false);
            } else {
                $captchaButton.prop('disabled', true);
                $captchaButton.prop('checked', false);
            }
        };

        $signupButton.click(function () {
            setCaptchaFromPublicSignup();
        });

        setCaptchaFromPublicSignup();
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});