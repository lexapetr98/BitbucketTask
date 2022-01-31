define('bitbucket/internal/feature/user/user-table/user-table', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/widget/paged-table/paged-table'], function (module, exports, _aui, _jquery, _navbuilder, _pagedTable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pagedTable2 = babelHelpers.interopRequireDefault(_pagedTable);

    function UserTable(options) {
        _pagedTable2.default.call(this, _jquery2.default.extend({
            filterable: true,
            noneMatchingMessageHtml: _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.user.search.nomatch')),
            noneFoundMessageHtml: _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.user.search.nousers')),
            paginationContext: 'user-table'
        }, options));
    }

    _jquery2.default.extend(UserTable.prototype, _pagedTable2.default.prototype);

    UserTable.prototype.buildUrl = function (start, limit, filter) {
        var params = {
            start: start,
            limit: limit,
            avatarSize: bitbucket.internal.widget.avatarSizeInPx({ size: 'small' })
        };
        if (filter) {
            params.filter = filter;
        }
        return _navbuilder2.default.admin().users().withParams(params).build();
    };

    UserTable.prototype.handleNewRows = function (userPage, attachmentMethod) {
        this.$table.find('tbody')[attachmentMethod](bitbucket.internal.feature.user.userRows({
            users: userPage.values
        }));
    };

    exports.default = UserTable;
    module.exports = exports['default'];
});