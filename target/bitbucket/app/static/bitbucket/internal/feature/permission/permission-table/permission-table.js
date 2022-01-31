define('bitbucket/internal/feature/permission/permission-table/permission-table', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/feature/permission/multi-selector/multi-selector', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/function', 'bitbucket/internal/util/warn-before-unload'], function (module, exports, _aui, _jquery, _lodash, _multiSelector, _pageState, _ajax, _function, _warnBeforeUnload) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _multiSelector2 = babelHelpers.interopRequireDefault(_multiSelector);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _warnBeforeUnload2 = babelHelpers.interopRequireDefault(_warnBeforeUnload);

    function makeDataSource(nav, entityType) {
        function getNonMembers(params) {
            return _ajax2.default.rest({
                url: nav[entityType + 's']().none().build(),
                type: 'GET',
                data: params
            });
        }

        function getMembers(params) {
            return _ajax2.default.rest({
                url: nav[entityType + 's']().build(),
                type: 'GET',
                data: params
            });
        }

        function setPermission(permission, ids) {
            return _ajax2.default.rest({
                url: nav[entityType + 's']().withParams({ permission: permission, name: ids }).build(),
                type: 'PUT',
                statusCode: {
                    400: false,
                    403: false,
                    404: false,
                    409: false
                }
            });
        }

        function removePermissions(id) {
            return _ajax2.default.rest({
                url: nav[entityType + 's']().withParams({ name: id }).build(),
                type: 'DELETE',
                statusCode: {
                    400: false,
                    403: false,
                    404: false,
                    409: false
                }
            });
        }

        return {
            getMembers: getMembers,
            getNonMembers: getNonMembers,
            setPermission: setPermission,
            removePermissions: removePermissions
        };
    }

    function MultiSelectorDataSource(delegate) {
        this._delegate = delegate;
        this._pageReceived = _lodash2.default.bind(this._pageReceived, this);
        this.clear();
    }

    MultiSelectorDataSource.prototype.clear = function () {
        this._nextPageStart = 0;
    };

    MultiSelectorDataSource.prototype.nextPage = function (filter) {
        return this._delegate.getNonMembers({
            start: this._nextPageStart,
            filter: filter,
            avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                size: 'xsmall'
            })
        }).done(this._pageReceived);
    };

    MultiSelectorDataSource.prototype._pageReceived = function (page) {
        this._nextPageStart = page.nextPageStart || page.start + page.size;
    };

    function PermissionTable(container, permissionsNavBuilder, permissionsOrderedList, userOrGroup, currentUserHighestPerm, opts) {
        this._entityType = userOrGroup;

        if (this._entityType === 'user') {
            this._text = PermissionTable.userText;
            this._rowTemplate = bitbucket.internal.feature.permission.userPermissionRow;
            this._isEntityCurrentUser = function (entity) {
                return _pageState2.default.getCurrentUser() && entity.name === _pageState2.default.getCurrentUser().getName();
            };
        } else {
            this._text = PermissionTable.groupText;
            this._rowTemplate = bitbucket.internal.feature.permission.groupPermissionRow;
            this._isEntityCurrentUser = _function2.default.constant(false);
        }

        this._dataSource = makeDataSource(permissionsNavBuilder, this._entityType);

        this._permissions = _lodash2.default.map(permissionsOrderedList, 'name');
        this._initialPermission = this._permissions[this._permissions.length - 1];
        this._permissionNames = _lodash2.default.map(permissionsOrderedList, 'i18nName');

        this._currentUserHighestPerm = currentUserHighestPerm;

        this._pageSize = 50;

        this._addedEntities = [];

        this.opts = opts || {};

        this._wireComponents(container);
        this._initHelpDialogs();
        this._initAddMultiSelector();
        this._initRows();
        this._initLoadMoreButton();

        this.refresh();
    }

    PermissionTable.text = {
        entityList: {
            buttonLoadMoreText: _aui.I18n.getText('bitbucket.web.permission.table.load.more'),
            deletedUser: _aui.I18n.getText('bitbucket.web.permission.table.deleted.user.tooltip')
        },
        pendingModification: _aui.I18n.getText('bitbucket.web.pending.request', bitbucket.internal.util.productName()),
        cantGrantHigherPerms: function cantGrantHigherPerms(permName) {
            return _aui.I18n.getText('bitbucket.web.permission.table.cantgranthigher.tooltip', permName);
        },
        inheritedPerm: _aui.I18n.getText('bitbucket.web.permission.table.inheritedperm.tooltip')
    };

    PermissionTable.userText = _jquery2.default.extend(true, {
        inactiveEntity: function inactiveEntity(name) {
            return _aui.I18n.getText('bitbucket.web.permission.table.inactive.user', name);
        },
        cantRevokeHigherPerms: function cantRevokeHigherPerms(permName) {
            return _aui.I18n.getText('bitbucket.web.permission.table.cantrevokehigheruser.tooltip', permName);
        },
        cantGrantSelfHigherPerms: function cantGrantSelfHigherPerms(permName) {
            return _aui.I18n.getText('bitbucket.web.permission.table.cantgrantselfhigher.tooltip', permName);
        },
        implicitPerm: _aui.I18n.getText('bitbucket.web.permission.table.basePerm.user.tooltip'),
        noMoreItemsText: _aui.I18n.getText('bitbucket.web.permission.table.users.none.added')
    }, PermissionTable.text);

    PermissionTable.groupText = _jquery2.default.extend(true, {
        inactiveEntity: function inactiveEntity(name) {
            return _aui.I18n.getText('bitbucket.web.permission.table.invisible.group', name);
        },
        cantRevokeHigherPerms: function cantRevokeHigherPerms(permName) {
            return _aui.I18n.getText('bitbucket.web.permission.table.cantrevokehighergroup.tooltip', permName);
        },
        implicitPerm: _aui.I18n.getText('bitbucket.web.permission.table.basePerm.group.tooltip'),
        noMoreItemsText: _aui.I18n.getText('bitbucket.web.permission.table.groups.none.added')
    }, PermissionTable.text);

    PermissionTable.prototype._wireComponents = function (container) {
        this._$container = (0, _jquery2.default)(container);
        this._$tbody = this._$container.find('tbody');
        this._$noResults = this._$container.find('.no-results-row');
        this._$loadMore = this._$container.find('.load-more');
        this._$spinner = (0, _jquery2.default)(this._$loadMore).parent().append('<div class="permissions-spinner" />').find('.permissions-spinner');
    };

    PermissionTable.prototype._getModalItem = function (restElem) {
        return {
            content: (0, _jquery2.default)(bitbucket.internal.feature.permission.permissionModalItem({
                entity: restElem,
                isUser: this._entityType === 'user',
                inactiveText: this._text.inactiveEntity(restElem.name)
            })),
            id: restElem.name
        };
    };

    PermissionTable.prototype._initAddMultiSelector = function () {
        var self = this;
        this._multiSelector = new _multiSelector2.default({
            el: this._$container.find('.permission-multi-selector-container')[0],
            entityType: this._entityType,
            add: function add(payload) {
                return self._dataSource.setPermission(payload.permission, _lodash2.default.map(payload.entities, 'name')).done(function () {
                    self._addedEntities.push.apply(self._addedEntities, _lodash2.default.map(payload.entities, function (entity) {
                        var permittedEntity = {
                            permission: payload.permission
                        };
                        permittedEntity[self._entityType] = entity;
                        return permittedEntity;
                    }));

                    (0, _aui.flag)({
                        type: 'success',
                        close: 'auto',
                        body: bitbucket.internal.feature.permission.flag.added({
                            name: payload.entities[0].name,
                            entityType: self._entityType,
                            count: payload.entities.length
                        })
                    });
                    self.refresh();
                });
            },
            dataSource: new MultiSelectorDataSource(this._dataSource)
        });
    };

    PermissionTable.prototype._updateErrors = function ($trigger, jqXhr) {
        var $sourceRow = $trigger.closest('tr');
        var entityId = $sourceRow.attr('data-entity-id');

        //immediately remove all previous errors in the current table.
        $sourceRow.closest('tbody').find('.permission-error').remove();

        //if this request fails, add the new errors in.
        return jqXhr.fail(function (xhr, textStatus, errorThrown, data) {
            if (data && data.errors) {
                var numRows = $sourceRow.children('td').length;
                _jquery2.default.each(data.errors, function (i) {
                    $sourceRow.after(bitbucket.internal.feature.permission.errorPermissionRow({
                        entityId: entityId,
                        numRows: numRows,
                        message: data.errors[i].message
                    }));
                });
            }
        });
    };

    PermissionTable.prototype._spinWhilePending = function ($trigger, promise) {
        if (promise && promise.state() === 'pending') {
            // disable all checkboxes for this row while request is pending
            $trigger.closest('tr').find(':checkbox').prop('disabled', true);

            var $spinner = (0, _jquery2.default)('<div class="spinner" />');
            $spinner.insertAfter($trigger);
            $trigger.addClass('hidden');

            $spinner.spin('small');

            promise.always(function () {
                $trigger.removeClass('hidden');
                $spinner.spinStop().remove();
            });
        }
    };

    PermissionTable.prototype._getAllCheckboxes = function ($checkbox) {
        return $checkbox.parent().parent().find(':checkbox');
    };

    PermissionTable.prototype._getCheckboxStates = function ($checkboxes) {
        return _jquery2.default.map($checkboxes, function (checkbox) {
            return {
                checked: (0, _jquery2.default)(checkbox).prop('checked'),
                disabled: (0, _jquery2.default)(checkbox).prop('disabled')
            };
        });
    };

    PermissionTable.prototype._restoreCheckboxStates = function ($checkboxes, $states) {
        //Restore checked and disabled states to what they were previously
        _jquery2.default.each($states, function (index, state) {
            var $checkbox = (0, _jquery2.default)($checkboxes.get(index));

            $checkbox.prop('checked', state.checked).prop('disabled', state.disabled).toggleClass('disabled', state.disabled);
        });
    };

    PermissionTable.prototype._setChecked = function ($newCheckbox, $oldCheckbox, $originalStates) {
        //Restore the checkbox states first, then update based on the selection
        this._restoreCheckboxStates(this._getAllCheckboxes($newCheckbox), $originalStates);

        //Uncheck the old one.
        $oldCheckbox.prop('checked', false).prop('title', '');

        //Check lower perms
        var lowerPerms = $newCheckbox.parent().nextAll().children(':checkbox').prop('checked', true).prop('disabled', true).addClass('disabled').prop('title', this._text.inheritedPerm);

        //Make the tooltip for the final perm indicate it is implicit rather than inherited
        //but only if it is the last perm left checked
        $newCheckbox.prop('title', lowerPerms.length ? '' : this._text.implicitPerm);

        //Check the new one.
        $newCheckbox.prop('checked', true).prop('disabled', !lowerPerms.length // disable it if it's the last one.
        ).toggleClass('disabled', !lowerPerms.length);

        var name = $newCheckbox.closest('[data-entity-id]').attr('data-entity-id');
        var entityType = this._entityType;
        _lodash2.default.forEach(this._addedEntities, function (entity) {
            if (entity[entityType].name === name) {
                entity.permission = $newCheckbox.val();
            }
        });
    };

    PermissionTable.prototype._initHelpDialogs = function () {
        var helpIcons = this._$container.find('th.permission-column > .aui-icon.aui-iconfont-question-circle');
        var dialog = new _aui.InlineDialog(helpIcons, (0, _aui.id)('help-dialog'), function (content, trigger, showPopup) {
            content.empty().append((0, _jquery2.default)(trigger).parent().find('.permission-column-desc').clone());
            showPopup();
            dialog.refresh();
        }, {
            offsetX: -100,
            onHover: true,
            gravity: 's'
        });
    };

    PermissionTable.prototype._initRows = function () {
        var self = this;

        this._$tbody.on('change', ':checkbox', function () {
            var $this = (0, _jquery2.default)(this);
            var $parent = $this.parent();
            var $next = $parent.next();

            var entityId = $parent.parent().attr('data-entity-id');
            var $oldCheckbox;
            var $newCheckbox;
            var oldPerm;
            var newPerm;

            if (this.checked) {
                // find the highest previously checked item.
                while ($next.length && !$next.children(':checked').length) {
                    $next = $next.next();
                }

                $oldCheckbox = $next.children(':checkbox');
                $newCheckbox = $this;

                oldPerm = $oldCheckbox.prop('value');
                newPerm = this.value;
            } else {
                $oldCheckbox = $this;
                $newCheckbox = $next.children(':checkbox');

                oldPerm = this.value;
                newPerm = $newCheckbox.prop('value');
            }

            var requests = [];

            if (newPerm) {
                requests.push(self._dataSource.setPermission(newPerm, entityId));
            }

            //Capture states now prior to disabling them all
            var checkboxStates = self._getCheckboxStates(self._getAllCheckboxes($newCheckbox));

            var collectivePromise = _jquery2.default.when.apply(_jquery2.default, requests);

            self._spinWhilePending($this, collectivePromise);
            self._updateErrors($this, collectivePromise);

            collectivePromise.done(function () {
                //update permission level in UI
                self._setChecked($newCheckbox, $oldCheckbox, checkboxStates);
            }).fail(function (xhr, textStatus, errorThrown, data) {
                //revert to old permission level
                self._setChecked($oldCheckbox, $newCheckbox, checkboxStates);
            });

            (0, _warnBeforeUnload2.default)(collectivePromise, self._text.pendingModification);
        }).on('click', '.delete-button', function (e) {
            // This is wrong, rather than telling the server we want to remove a specific permission,
            // we need a way to say "remove all permissions". Until the new rest endpoints are implemented though,
            // this will tell the server to remove the highest currently assigned permission (that we know about).
            // This will not work as intended if the user's permission level was changed in another window without
            // refreshing the current window (it will attempt to remove a permission level the user no longer has,
            // meaning the user is not removed)

            var $this = (0, _jquery2.default)(this);
            var $parentRow = $this.parents('tr').first();
            var entityId = $parentRow.attr('data-entity-id');
            var $checkboxes = $parentRow.find(':checkbox');
            var checkboxStates = self._getCheckboxStates($checkboxes);

            var request = self._dataSource.removePermissions(entityId);

            self._spinWhilePending($this, request);
            self._updateErrors($this, request);

            request.done(function () {
                self._numLoaded--;
                // remove from addedEntities
                self._addedEntities = _lodash2.default.filter(self._addedEntities, function (entity) {
                    var idMatches = entity[self._entityType].name === entityId;
                    if (idMatches && !entity.loaded) {
                        self._numLoaded++;
                    }
                    return !idMatches;
                });

                if (!$parentRow.siblings().length && !self._$loadMore.is(':visible')) {
                    var $noResultsInner = self._$noResults.find('div');

                    $noResultsInner.css('opacity', 0.0);
                    self._$noResults.show();
                    $noResultsInner.animate({ opacity: 1.0 }, 500);
                }

                (0, _aui.flag)({
                    type: 'success',
                    close: 'auto',
                    body: bitbucket.internal.feature.permission.flag.deleted({
                        name: entityId,
                        entityType: self._entityType
                    })
                });

                $parentRow.remove();
            }).fail(function () {
                //revert to old permission level
                self._restoreCheckboxStates($checkboxes, checkboxStates);
            });

            (0, _warnBeforeUnload2.default)(request, self._text.pendingModification);

            e.preventDefault();
            return false;
        });
    };

    PermissionTable.prototype._initLoadMoreButton = function (e) {
        var self = this;

        this._$loadMore.click(function (e) {
            self._loadItems();
            e.preventDefault();
        });
    };

    PermissionTable.prototype._renderRow = function (entity, scopedPermission, currentUserHighestPerm, isAdded) {
        var self = this;
        //Added users have no explicit perms - choose the last perm, the implicit perm
        var scopedPermissionIndex = _lodash2.default.isUndefined(scopedPermission) ? self._permissions.length - 1 : _lodash2.default.indexOf(this._permissions, scopedPermission);
        var currentUserHighestPermIndex = _lodash2.default.indexOf(this._permissions, currentUserHighestPerm);
        //This entity has a higher perm than the current user, their perms are unmodifiable
        var privilegedEntity = scopedPermissionIndex < currentUserHighestPermIndex;
        //The i18n permission name
        var scopedPermissionName = self._permissionNames[scopedPermissionIndex];
        return this._rowTemplate({
            entity: entity,
            entityPermissions: _lodash2.default.map(this._permissions, function (displayPermission, index, displayPermissions) {
                var permissionName = self._permissionNames[index];
                var isGranted = displayPermission === scopedPermission;
                //This privilege is higher than that of the current user
                var isPrivileged = index < currentUserHighestPermIndex;
                var isInherited = _lodash2.default.some(displayPermissions.slice(0, index), _function2.default.eq(scopedPermission));
                return {
                    name: displayPermission,
                    granted: isGranted,
                    inherited: isInherited,
                    privileged: isPrivileged, //disabled if current user's highest perms not sufficient
                    tooltip: function () {
                        if (privilegedEntity) {
                            return '';
                        } else if (isPrivileged && !isGranted) {
                            if (self._isEntityCurrentUser(entity)) {
                                return self._text.cantGrantSelfHigherPerms(permissionName);
                            }
                            return self._text.cantGrantHigherPerms(permissionName);
                        } else if (isInherited) {
                            return self._text.inheritedPerm;
                        } else if (index === self._permissions.length - 1) {
                            return self._text.implicitPerm;
                        }
                        return '';
                    }()
                };
            }),
            tooltip: privilegedEntity ? self._text.cantRevokeHigherPerms(scopedPermissionName) : '',
            showRemovePermsButton: isAdded || scopedPermissionIndex >= currentUserHighestPermIndex,
            linkToEntities: _pageState2.default.getCurrentUser() && _pageState2.default.getCurrentUser().getIsAdmin()
        });
    };

    PermissionTable.prototype._loadItems = function () {
        var self = this;
        this._$spinner.spin('small');

        if (!this._numLoaded) {
            self._$tbody.empty();
            self._$noResults.hide();
        }

        // if we're starting fresh, render the newly added entities at the top.
        if (!this._numLoaded && this._addedEntities.length) {
            self._$tbody.append(_lodash2.default.chain(this._addedEntities).sortBy(function (entity) {
                return entity[self._entityType].name;
            }).reduce(function (memo, entity) {
                return memo + self._renderRow(entity[self._entityType], entity.permission, self._currentUserHighestPerm, true);
            }, '').value());
        }

        self._dataSource.getMembers({
            start: self._numLoaded,
            limit: self._pageSize,
            avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                size: 'xsmall'
            })
        }).done(function (data) {
            if (self.opts.preProcessMembers) {
                data = self.opts.preProcessMembers(data, self._entityType);
            }
            self._$spinner.spinStop();

            self._$loadMore.toggleClass('hidden disabled', data.isLastPage);

            if (data.values.length) {
                self._$noResults.hide();
            } else if (!data.start && !self._addedEntities.length) {
                // There are now no entities, show the noResults
                self._$noResults.show();
            }

            self._numLoaded += data.values.length;
            // pluck out any of the added entities since we've moved them to the top.
            var addedEntityNames = _lodash2.default.chain(self._addedEntities).map(self._entityType).map('name').invokeMap('toLowerCase').value();

            var values = _lodash2.default.filter(data.values, function (entity) {
                var addedEntityIndex = _jquery2.default.inArray(entity[self._entityType].name.toLowerCase(), addedEntityNames);
                if (addedEntityIndex !== -1) {
                    self._addedEntities[addedEntityIndex].loaded = true;
                }
                return addedEntityIndex === -1;
            });

            if (values.length) {
                self._$tbody.append(_lodash2.default.reduce(values, function (memo, item) {
                    return memo + self._renderRow(item[self._entityType], item.permission, self._currentUserHighestPerm);
                }, ''));
            }

            self._$tbody.find('.deleted-user .display-name').tooltip({
                title: function title() {
                    return self._text.entityList.deletedUser;
                },
                gravity: 'w'
            });

            self._$noResults.find('div').show();
        });
    };

    PermissionTable.prototype.refresh = function (hardRefresh) {
        // If it's a hard refresh, ignore the newly added entities
        if (hardRefresh) {
            this._addedEntities = [];
        }
        this._numLoaded = 0;
        _lodash2.default.forEach(this._addedEntities, function (entity) {
            entity.loaded = false;
        });
        this._loadItems();
    };

    /**
     * @param resNavBuilder           - the builder for the REST resource used for querying and updating permissions. Currently there are two
     *                                  compatible resources in Stash:
     *                                    "projects/{projectKey}/permissions" (for project permissions)
     *                                    "admin/permissions" (for global permissions)
     */
    function initialise(resNavBuilder, permissionsOrderedList, currentUserHighestPerm, opts) {
        return _lodash2.default.map(['user', 'group'], function (userOrGroup) {
            return new PermissionTable('#' + userOrGroup + '-permissions-table', resNavBuilder, permissionsOrderedList, userOrGroup, currentUserHighestPerm, opts);
        });
    }

    exports.default = {
        initialise: initialise
    };
    module.exports = exports['default'];
});