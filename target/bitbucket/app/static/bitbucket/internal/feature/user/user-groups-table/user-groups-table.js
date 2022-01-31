define('bitbucket/internal/feature/user/user-groups-table/user-groups-table', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/user/group-multi-selector/group-multi-selector', 'bitbucket/internal/feature/user/group-table/group-table', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/error'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _groupMultiSelector, _groupTable, _ajax, _error) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _groupMultiSelector2 = babelHelpers.interopRequireDefault(_groupMultiSelector);

    var _groupTable2 = babelHelpers.interopRequireDefault(_groupTable);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _error2 = babelHelpers.interopRequireDefault(_error);

    var addButtonSelector = '.add-button';
    var addPickerSelector = '.groups-multi-selector';
    var deleteButtonsSelector = '.delete-button';

    /**
     * Table holding the groups of a user.
     *
     * @param options config options
     * @constructor
     *
     * List of config options:
     * - onError: a callback allowing the caller to be notified of any error
     * - see {@link PagedTable.defaultOptions}
     */
    function UserGroupsTable(options) {
        _groupTable2.default.call(this, _jquery2.default.extend({}, {
            filterable: false,
            noneFoundMessageHtml: (0, _aui.escapeHtml)(_aui.I18n.getText('bitbucket.web.user.groups.noneFound'))
        }, options));
        this.username = this.$table.attr('data-username');
        this.onError = options.onError || _error2.default.showNonFieldErrors;
        this._initBindings = _lodash2.default.once(this._initBindings);
    }

    _jquery2.default.extend(UserGroupsTable.prototype, _groupTable2.default.prototype);

    UserGroupsTable.prototype.buildUrl = function (start, limit, filter) {
        return _navbuilder2.default.admin().users().addPathComponents('more-members').withParams({
            context: this.username,
            start: start,
            limit: limit
        }).build();
    };

    UserGroupsTable.prototype.init = function () {
        _groupTable2.default.prototype.init.call(this);
        this._initBindings();
    };

    UserGroupsTable.prototype.handleErrors = function (errors) {
        var self = this;
        _lodash2.default.forEach(errors, function (error) {
            self.onError(error.message);
        });
    };

    UserGroupsTable.prototype.handleNewRows = function (groupPage, attachmentMethod) {
        this.$table.find('tbody')[attachmentMethod](bitbucket.internal.feature.user.userGroupsRows({
            groups: groupPage.values
        }));
    };

    UserGroupsTable.prototype.remove = function (group) {
        var self = this;
        if (_groupTable2.default.prototype.remove.call(this, group)) {
            var $row = this.$table.find('tbody > tr[data-name]').filter(function () {
                return (0, _jquery2.default)(this).attr('data-name') === group.name;
            });
            $row.fadeOut('fast', function () {
                $row.remove();
                self.updateTimestamp();
            });
        }
    };

    UserGroupsTable.prototype._initBindings = function () {
        var self = this;
        var groupsSelector = new _groupMultiSelector2.default((0, _jquery2.default)(addPickerSelector, self.$table), {
            url: _navbuilder2.default.admin().users().addPathComponents('more-non-members').withParams({
                context: self.username
            }).build()
        });

        self.$table.on('click', addButtonSelector, function (e) {
            e.preventDefault();
            var groups = groupsSelector.getSelectedItems();
            var groupNames = _lodash2.default.map(groups, 'name');
            self._addGroups(self.username, groupNames).done(function () {
                groupsSelector.clearSelectedItems();

                (0, _aui.flag)({
                    type: 'success',
                    close: 'auto',
                    body: bitbucket.internal.feature.permission.flag.added({
                        name: groupNames[0],
                        entityType: 'group',
                        count: groups.length
                    })
                });

                self.add(_lodash2.default.map(groups, function (group) {
                    return _jquery2.default.extend({ justAdded: true }, group);
                }));
            }).fail(function (xhr, textStatus, error, data) {
                self.handleErrors(self._extractErrors(data, error));
            });
        });

        self.$table.on('click', deleteButtonsSelector, function (e) {
            e.preventDefault();
            var groupName = (0, _jquery2.default)(e.target).closest('a').attr('data-for');
            self._removeGroups(self.username, groupName).done(function () {
                self.remove({ name: groupName });

                (0, _aui.flag)({
                    type: 'success',
                    close: 'auto',
                    body: bitbucket.internal.feature.permission.flag.deleted({
                        name: groupName,
                        entityType: 'group'
                    })
                });
            }).fail(function (xhr, textStatus, error, data) {
                self.handleErrors(self._extractErrors(data, error));
            });
        });
    };

    UserGroupsTable.prototype._addGroups = function (username, groupNames) {
        return _ajax2.default.rest({
            data: {
                user: username,
                groups: groupNames
            },
            statusCode: {
                403: false,
                404: false
            },
            type: 'POST',
            url: _navbuilder2.default.admin().users().addPathComponents('add-groups').build()
        });
    };

    UserGroupsTable.prototype._removeGroups = function (username, groupName) {
        return _ajax2.default.rest({
            data: {
                context: username,
                itemName: groupName
            },
            statusCode: {
                403: false,
                404: false,
                409: false
            },
            type: 'POST',
            url: _navbuilder2.default.admin().users().addPathComponents('remove-group').build()
        });
    };

    UserGroupsTable.prototype._extractErrors = function (data) {
        return _lodash2.default.get(data, 'errors.length') ? data.errors : [{
            message: (0, _aui.escapeHtml)(_aui.I18n.getText('bitbucket.web.user.group.unknown.error'))
        }];
    };

    exports.default = UserGroupsTable;
    module.exports = exports['default'];
});