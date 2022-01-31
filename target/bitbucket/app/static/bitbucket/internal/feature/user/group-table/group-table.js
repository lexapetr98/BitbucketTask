define('bitbucket/internal/feature/user/group-table/group-table', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/util/function', 'bitbucket/internal/widget/paged-table/paged-table'], function (module, exports, _aui, _jquery, _navbuilder, _function, _pagedTable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _pagedTable2 = babelHelpers.interopRequireDefault(_pagedTable);

    /**
     * Table holding the available groups.
     *
     * @param options config options
     * @see {@link PagedTable}'s constructor
     * @constructor
     */
    function GroupTable(options) {
        _pagedTable2.default.call(this, _jquery2.default.extend({}, GroupTable.defaults, options));
    }

    _jquery2.default.extend(GroupTable.prototype, _pagedTable2.default.prototype);

    GroupTable.defaults = {
        filterable: true,
        noneMatchingMessageHtml: _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.grouptable.nomatch')),
        noneFoundMessageHtml: _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.grouptable.nogroups')),
        idForEntity: _function2.default.dot('name'),
        paginationContext: 'group-table'
    };

    GroupTable.prototype.buildUrl = function (start, limit, filter) {
        var params = {
            start: start,
            limit: limit
        };
        if (filter) {
            params.filter = filter;
        }
        return _navbuilder2.default.admin().groups().withParams(params).build();
    };

    GroupTable.prototype.handleNewRows = function (groupPage, attachmentMethod) {
        this.$table.find('tbody')[attachmentMethod](bitbucket.internal.feature.user.groupRows({
            groups: groupPage.values
        }));
    };

    exports.default = GroupTable;
    module.exports = exports['default'];
});