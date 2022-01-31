define('bitbucket/internal/page/maintenance/backup/backup', ['module', 'exports', '@atlassian/aui', 'bitbucket/util/navbuilder', 'bitbucket/internal/layout/maintenance/maintenance'], function (module, exports, _aui, _navbuilder, _maintenance) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _maintenance2 = babelHelpers.interopRequireDefault(_maintenance);

    function onReady(hasToken) {
        var opts = {
            redirectUrl: hasToken ? _navbuilder2.default.admin().build() : _navbuilder2.default.dashboard().build(),
            canceledHeader: _aui2.default.I18n.getText('bitbucket.web.backup.canceled.title'),
            cancelingDescription: _aui2.default.I18n.getText('bitbucket.web.backup.canceling.description'),
            cancelDialogTitle: _aui2.default.I18n.getText('bitbucket.web.backup.dialog.title'),
            cancelDialogDescription: _aui2.default.I18n.getText('bitbucket.web.backup.dialog.description'),
            cancelDialogButtonText: _aui2.default.I18n.getText('bitbucket.web.backup.dialog.cancel')
        };

        _maintenance2.default.init(opts);
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});