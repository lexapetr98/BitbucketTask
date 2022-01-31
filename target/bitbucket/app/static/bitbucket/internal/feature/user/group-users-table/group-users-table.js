define('bitbucket/internal/feature/user/group-users-table/group-users-table', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/user/user-multi-selector/user-multi-selector', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/widget/paged-table/paged-table'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _userMultiSelector, _ajax, _events, _function, _pagedTable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _userMultiSelector2 = babelHelpers.interopRequireDefault(_userMultiSelector);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _pagedTable2 = babelHelpers.interopRequireDefault(_pagedTable);

    var addPickerSelector = '.users-multi-selector';
    var addButtonSelector = '.add-button';
    var deleteButtonsSelector = '.delete-button';

    /**
     * Table holding the users in a group.
     *
     * @param options config options, see PagedTable.defaults for examples
     * @constructor
     */
    function GroupUsersTable(options) {
        _pagedTable2.default.call(this, _jquery2.default.extend({
            filterable: false,
            noneFoundMessageHtml: (0, _aui.escapeHtml)(_aui.I18n.getText('bitbucket.web.user.group.members.none')),
            idForEntity: _function2.default.dot('name'), // 'name' is used instead of 'id' because the REST end points for adding/removing users to a group use 'usernames' as parameters
            paginationContext: 'group-users-table'
        }, options));
        this.group = this.$table.attr('data-group');
        this.$notifications = this.$table.prev('.notifications');
        this._initBindings = _lodash2.default.once(this._initBindings);
    }

    _jquery2.default.extend(GroupUsersTable.prototype, _pagedTable2.default.prototype);

    GroupUsersTable.prototype.init = function () {
        _pagedTable2.default.prototype.init.call(this);
        this._initBindings();
    };

    GroupUsersTable.prototype.buildUrl = function (start, limit, filter) {
        var params = {
            context: this.group,
            start: start,
            limit: limit,
            avatarSize: bitbucket.internal.widget.avatarSizeInPx({ size: 'small' })
        };
        return _navbuilder2.default.admin().groups().addPathComponents('more-members').withParams(params).build();
    };

    GroupUsersTable.prototype.handleNewRows = function (userPage, attachmentMethod) {
        this.$table.find('tbody')[attachmentMethod](bitbucket.internal.feature.user.groupUserRows({
            page: userPage
        }));
    };

    GroupUsersTable.prototype.handleErrors = function (errors) {
        var $notifications = this.$notifications.empty();
        _lodash2.default.forEach(errors, function (error) {
            $notifications.append(aui.message.error({ content: (0, _aui.escapeHtml)(error.message) }));
        });
    };

    GroupUsersTable.prototype.remove = function (user) {
        var self = this;
        if (_pagedTable2.default.prototype.remove.call(this, user)) {
            var $row = this.$table.find('tbody > tr[data-name]').filter(function () {
                return (0, _jquery2.default)(this).attr('data-name') === user.name;
            });
            $row.fadeOut('fast', function () {
                $row.remove();
                self.updateTimestamp();
            });
        }
    };

    GroupUsersTable.prototype._initBindings = function () {
        var self = this;
        var usersSelector = new _userMultiSelector2.default((0, _jquery2.default)(addPickerSelector, self.$table), {
            url: _navbuilder2.default.admin().groups().addPathComponents('more-non-members').withParams({
                context: self.group
            }).build()
        });

        self.$table.on('click', addButtonSelector, function (e) {
            e.preventDefault();
            var users = usersSelector.getSelectedItems();
            var usernames = _lodash2.default.map(users, 'name');
            self._addUsers(self.group, usernames).done(function () {
                usersSelector.clearSelectedItems();

                (0, _aui.flag)({
                    type: 'success',
                    close: 'auto',
                    body: bitbucket.internal.feature.permission.flag.added({
                        name: users[0].name,
                        entityType: 'user',
                        count: users.length
                    })
                });

                self.add(_lodash2.default.map(users, function (user) {
                    return _jquery2.default.extend({ justAdded: true }, user);
                }));
                _events2.default.trigger('bitbucket.internal.group.users.add.success');
            }).fail(function (xhr, textStatus, error, data) {
                self.handleErrors(self._extractErrors(data));
                _events2.default.trigger('bitbucket.internal.group.users.add.failed');
            });
        });

        self.$table.on('click', deleteButtonsSelector, function (e) {
            e.preventDefault();
            var username = (0, _jquery2.default)(e.target).closest('a').attr('data-for');
            self._removeUser(self.group, username).done(function () {
                self.remove({ name: username });

                (0, _aui.flag)({
                    type: 'success',
                    close: 'auto',
                    body: bitbucket.internal.feature.permission.flag.deleted({
                        name: username,
                        entityType: 'user'
                    })
                });
                _events2.default.trigger('bitbucket.internal.group.users.remove.success');
            }).fail(function (xhr, textStatus, error, data) {
                self.handleErrors(self._extractErrors(data));
                _events2.default.trigger('bitbucket.internal.group.users.remove.failed');
            });
        });
    };

    GroupUsersTable.prototype._addUsers = function (group, users) {
        return _ajax2.default.rest({
            data: {
                group: group,
                users: users
            },
            statusCode: {
                403: false,
                404: false,
                500: false
            },
            type: 'POST',
            url: _navbuilder2.default.admin().groups().addPathComponents('add-users').build()
        });
    };

    GroupUsersTable.prototype._removeUser = function (group, username) {
        return _ajax2.default.rest({
            data: {
                context: group,
                itemName: username
            },
            statusCode: {
                403: false,
                404: false,
                409: false,
                500: false
            },
            type: 'POST',
            url: _navbuilder2.default.admin().groups().addPathComponents('remove-user').build()
        });
    };

    GroupUsersTable.prototype._extractErrors = function (data) {
        return _lodash2.default.get(data, 'errors.length') ? data.errors : [{
            message: (0, _aui.escapeHtml)(_aui.I18n.getText('bitbucket.web.user.group.unknown.error'))
        }];
    };

    exports.default = GroupUsersTable;
    module.exports = exports['default'];
});