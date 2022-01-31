define('bitbucket/internal/page/admin/users/userlist', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/internal/feature/user/user-table/user-table', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/client-storage', 'bitbucket/internal/util/notifications/notifications', 'bitbucket/internal/widget/delete-dialog/delete-dialog'], function (module, exports, _aui, _jquery, _userTable, _analytics, _clientStorage, _notifications, _deleteDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _userTable2 = babelHelpers.interopRequireDefault(_userTable);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var _notifications2 = babelHelpers.interopRequireDefault(_notifications);

    var _deleteDialog2 = babelHelpers.interopRequireDefault(_deleteDialog);

    function onReady(tableSelector, deleteLinksSelector) {
        _notifications2.default.showFlashes();

        var userTable = new _userTable2.default({
            target: tableSelector
        });

        userTable.init();

        // confirm dialog to delete groups
        _deleteDialog2.default.bind(deleteLinksSelector, _aui2.default.I18n.getText('bitbucket.web.user.delete'), _aui2.default.I18n.getText('bitbucket.web.user.delete.success'), _aui2.default.I18n.getText('bitbucket.web.user.delete.fail'), function (displayName) {
            _notifications2.default.addFlash(_aui2.default.I18n.getText('bitbucket.web.user.delete.success', displayName));
            location.reload();
        });

        // show flag on successful user anonymization
        // see anonymize-user.jsx
        var anonymizedUsername = _clientStorage2.default.getSessionItem('anonymization.successful');
        if (anonymizedUsername) {
            _clientStorage2.default.removeSessionItem('anonymization.successful');
            _notifications2.default.showOnReady({
                body: _aui2.default.I18n.getText('bitbucket.web.user.anonymize.success.flag.html', _aui2.default.escapeHtml(anonymizedUsername)),
                type: 'success'
            });
        }

        // show flag when anonymization timed out
        // see anonymize-user.jsx
        anonymizedUsername = _clientStorage2.default.getSessionItem('anonymization.continued.in.background');
        if (anonymizedUsername) {
            _clientStorage2.default.removeSessionItem('anonymization.continued.in.background');
            _notifications2.default.showOnReady({
                body: _aui2.default.I18n.getText('bitbucket.web.user.anonymize.continued.background.flag.html', _aui2.default.escapeHtml(anonymizedUsername)),
                type: 'info'
            });
        }

        (0, _jquery2.default)('.anonymize-user-link').on('click', function () {
            _analytics2.default.add('user.list.anonymize');
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});