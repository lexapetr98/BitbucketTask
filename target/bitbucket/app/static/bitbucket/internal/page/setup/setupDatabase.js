define('bitbucket/internal/page/setup/setupDatabase', ['module', 'exports', '@atlassian/aui', 'jquery'], function (module, exports, _aui, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function toggleButtons(isInternal) {
        (0, _jquery2.default)('#test').toggleClass('disabled', isInternal).prop('disabled', isInternal);
        (0, _jquery2.default)('#submit').toggleClass('disabled', false).prop('disabled', false);
    }

    function toggleConfigFields($configFields, isInternal) {
        (0, _jquery2.default)('#test').toggleClass('hidden', isInternal);
        $configFields.toggleClass('hidden', isInternal);
        if (!isInternal) {
            $configFields.find('select[name="type"]').change(); // Fire change
        }
    }

    function showSpinner(msg) {
        var $test = (0, _jquery2.default)('#test');

        var $initText = (0, _jquery2.default)("<div class='next-text'>" + msg + '</div>');
        $initText.insertAfter($test);

        var $spinner = (0, _jquery2.default)("<div class='next-spinner' />");
        $spinner.insertAfter($test);
        $spinner.spin('small');
    }

    function onReady() {
        var $configFields = (0, _jquery2.default)('.config-fields');
        (0, _jquery2.default)('input[name="internal"]').on('change', function () {
            var isInternal = (0, _jquery2.default)(this).val() === 'true';
            toggleButtons(isInternal);
            toggleConfigFields($configFields, isInternal);
        }).filter(':checked').change(); // Fire on initial load to keep browser and page state in sync

        (0, _jquery2.default)('#test').click(function () {
            showSpinner(_aui2.default.I18n.getText('bitbucket.web.setup.test.database'));
        });

        (0, _jquery2.default)('#submit').click(function () {
            showSpinner(_aui2.default.I18n.getText('bitbucket.web.setup.init.database'));
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});