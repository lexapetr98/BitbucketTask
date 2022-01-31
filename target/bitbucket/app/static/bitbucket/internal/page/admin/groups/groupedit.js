define('bitbucket/internal/page/admin/groups/groupedit', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/user/group-users-table/group-users-table', 'bitbucket/internal/util/notifications/notifications', 'bitbucket/internal/widget/delete-dialog/delete-dialog'], function (module, exports, _aui, _jquery, _navbuilder, _groupUsersTable, _notifications, _deleteDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _groupUsersTable2 = babelHelpers.interopRequireDefault(_groupUsersTable);

    var _notifications2 = babelHelpers.interopRequireDefault(_notifications);

    var _deleteDialog2 = babelHelpers.interopRequireDefault(_deleteDialog);

    function onReady(readOnly, groupUsersTableSelector, deleteLinkSelector) {
        // dialog to confirm the deletion of the group
        _deleteDialog2.default.bind(deleteLinkSelector, _aui2.default.I18n.getText('bitbucket.web.group.delete'), _aui2.default.I18n.getText('bitbucket.web.group.delete.success'), _aui2.default.I18n.getText('bitbucket.web.group.delete.fail'), function (name) {
            _notifications2.default.addFlash(_aui2.default.I18n.getText('bitbucket.web.group.delete.success', name));
            window.location = _navbuilder2.default.admin().groups().build();
            return false; // don't notify on view page, wait for page-pop
        }, function () {
            return (0, _jquery2.default)('#group-name').text();
        });

        // list of users in the group
        var usersTable = new _groupUsersTable2.default({
            target: groupUsersTableSelector
        });
        usersTable.init();
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});