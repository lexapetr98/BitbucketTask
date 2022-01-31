define('bitbucket/internal/page/admin/groups/grouplist', ['module', 'exports', '@atlassian/aui', 'bitbucket/internal/feature/user/group-table/group-table', 'bitbucket/internal/util/notifications/notifications', 'bitbucket/internal/widget/delete-dialog/delete-dialog'], function (module, exports, _aui, _groupTable, _notifications, _deleteDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _groupTable2 = babelHelpers.interopRequireDefault(_groupTable);

    var _notifications2 = babelHelpers.interopRequireDefault(_notifications);

    var _deleteDialog2 = babelHelpers.interopRequireDefault(_deleteDialog);

    function onReady(tableSelector, deleteLinksSelector) {
        _notifications2.default.showFlashes();

        var groupTable = new _groupTable2.default({
            target: tableSelector
        });

        groupTable.init();

        // confirm dialog to delete groups
        _deleteDialog2.default.bind(deleteLinksSelector, _aui2.default.I18n.getText('bitbucket.web.group.delete'), _aui2.default.I18n.getText('bitbucket.web.group.delete.success'), _aui2.default.I18n.getText('bitbucket.web.group.delete.fail'), function (group) {
            _notifications2.default.addFlash(_aui2.default.I18n.getText('bitbucket.web.group.delete.success', group));
            location.reload();
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});