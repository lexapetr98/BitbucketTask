define('bitbucket/internal/page/admin/db/migrateDbConfig', ['module', 'exports', '@atlassian/aui', 'jquery'], function (module, exports, _aui, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function showSpinner(msg) {
        var $cancel = (0, _jquery2.default)('#cancel');

        var $initText = (0, _jquery2.default)("<div class='next-text'></div>").text(msg);
        $initText.insertAfter($cancel);

        var $spinner = (0, _jquery2.default)("<div class='next-spinner' />");
        $spinner.insertAfter($cancel);
        $spinner.spin('small');

        $cancel.hide();
    }

    function onReady() {
        (0, _jquery2.default)('#test').click(function () {
            showSpinner(_aui2.default.I18n.getText('bitbucket.web.admin.database.migration.test'));
        });

        (0, _jquery2.default)('#submit').click(function () {
            showSpinner(_aui2.default.I18n.getText('bitbucket.web.admin.database.migration.migrate'));
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});