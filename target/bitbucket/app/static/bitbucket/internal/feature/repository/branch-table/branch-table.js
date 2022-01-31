define('bitbucket/internal/feature/repository/branch-table/branch-table', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/events', 'bitbucket/internal/widget/paged-table/paged-table'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _pageState, _events, _pagedTable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _pagedTable2 = babelHelpers.interopRequireDefault(_pagedTable);

    function validateRef(ref) {
        if (!ref) {
            throw new Error('Undefined ref');
        } else if (!ref.id) {
            throw new Error('Ref without id');
        }
        return ref;
    }

    function BranchTable(options, baseRef) {
        _pagedTable2.default.call(this, _jquery2.default.extend({}, BranchTable.defaults, options));
        this._baseRef = validateRef(baseRef);
    }

    BranchTable.defaults = {
        filterable: true,
        pageSize: 20, // this must be less than ref.metadata.max.request.count
        noneFoundMessageHtml: _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.repository.branch.table.no.branches')),
        noneMatchingMessageHtml: _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.repository.branch.table.no.matches')),
        idForEntity: function idForEntity(ref) {
            return ref.id;
        },
        paginationContext: 'branch-table'
    };

    _jquery2.default.extend(BranchTable.prototype, _pagedTable2.default.prototype);

    BranchTable.prototype.buildUrl = function (start, limit, filter) {
        // Ideally the context would be populated from a plugin (in this case the branch plugin)
        // but we do not expose a JS API for it yet
        var context = JSON.stringify({ withMessages: false });
        var params = {
            base: this._baseRef.id,
            details: true,
            start: start,
            limit: limit,
            orderBy: 'MODIFICATION', // Always order by last modified regardless of filtering
            context: context
        };

        if (filter) {
            params.filterText = filter;
        }

        return _navbuilder2.default.rest().currentRepo().branches().withParams(params).build();
    };

    BranchTable.prototype.handleNewRows = function (branchPage, attachmentMethod) {
        this.$table.find('tbody')[attachmentMethod](bitbucket.internal.feature.repository.branchRows({
            branches: branchPage.values,
            baseRef: this._baseRef,
            repository: _pageState2.default.getRepository().toJSON()
        }));
    };

    BranchTable.prototype.isCurrentBase = function (ref) {
        return this._baseRef.id === validateRef(ref).id;
    };

    BranchTable.prototype.update = function (baseRef, options) {
        if (baseRef) {
            this._baseRef = validateRef(baseRef);
        }
        _pagedTable2.default.prototype.update.call(this, options);
    };

    BranchTable.prototype.remove = function (ref) {
        if (_pagedTable2.default.prototype.remove.call(this, ref)) {
            var $row = this.$table.find('tbody > tr[data-id="' + ref.id + '"]');
            $row.fadeOut(_lodash2.default.bind(function () {
                if ($row.hasClass('focused')) {
                    var $nextRow = $row.next();
                    var $nextFocus = $nextRow.length ? $nextRow : $row.prev();
                    if ($nextFocus.length) {
                        $nextFocus.addClass('focused');
                        $nextFocus.find('td[headers=branch-name-column] > a').focus();
                    }
                }
                $row.remove();

                // Ensure we display the no data message when
                // the last row is deleted
                if (this.loadedRange.reachedStart() && this.loadedRange.reachedEnd() && !this.$table.find('tbody > tr').length) {
                    this.handleNoData();
                }

                this.updateTimestamp();
            }, this));
            return true;
        }
        return false;
    };

    BranchTable.prototype.focusInitialRow = function () {
        this.$table.find(this.options.focusOptions.rowSelector).first().addClass(this.options.focusOptions.focusedClass).find('a').first().focus();
    };

    BranchTable.prototype.initShortcuts = function () {
        _pagedTable2.default.prototype.initShortcuts.call(this);

        var tableSelector = this.$table.selector;
        var options = this.options.focusOptions;
        var rowSelector = tableSelector + ' ' + options.rowSelector;

        var focusedRowSelector = rowSelector + '.' + options.focusedClass;

        _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestMoveToNextHandler', function (keys) {
            (this.moveToNextItem ? this : _aui2.default.whenIType(keys)).moveToNextItem(rowSelector, options).execute(function () {
                if ((0, _jquery2.default)(rowSelector).last().hasClass(options.focusedClass)) {
                    window.scrollTo(0, document.documentElement.scrollHeight);
                }
            });
        });

        _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestMoveToPreviousHandler', function (keys) {
            (this.moveToPrevItem ? this : _aui2.default.whenIType(keys)).moveToPrevItem(rowSelector, options);
        });

        _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestOpenItemHandler', function (keys) {
            (this.execute ? this : _aui2.default.whenIType(keys)).execute(function () {
                var $focusedItem = (0, _jquery2.default)(focusedRowSelector);
                if ($focusedItem.length) {
                    location.href = $focusedItem.find('td[headers=branch-name-column] a').attr('href');
                }
            });
        });

        _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestOpenItemActionHandler', function (keys) {
            (this.execute ? this : _aui2.default.whenIType(keys)).execute(function () {
                var $focusedItem = (0, _jquery2.default)(focusedRowSelector);
                if ($focusedItem.length) {
                    $focusedItem.find('.branch-list-action-trigger').click();
                }
            });
        });
    };

    exports.default = BranchTable;
    module.exports = exports['default'];
});