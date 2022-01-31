define('bitbucket/internal/page/setup/setupMirror', ['module', 'exports', '@atlassian/aui', 'jquery'], function (module, exports, _aui, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var $submit = (0, _jquery2.default)('#submit');
    var $mirrorForm = (0, _jquery2.default)('#mirror');

    function showSpinner(msg) {
        var $initText = (0, _jquery2.default)("<div class='next-text'></div>").text(msg);
        $initText.insertAfter($submit);

        var $spinner = (0, _jquery2.default)("<div class='next-spinner'></div>");
        $spinner.insertAfter($submit);
        $spinner.spin('small');
    }

    function onReady() {
        $mirrorForm.submit(function () {
            showSpinner(_aui2.default.I18n.getText('bitbucket.web.setup.mirror.status'));
        });

        //Focus the first error or the first input element.
        var $focus = $mirrorForm.find('input[type=text][data-aui-notification-error]');
        if (!$focus.length) {
            $focus = $mirrorForm.find('input[type=text]');
        }
        $focus.first().focus();
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});