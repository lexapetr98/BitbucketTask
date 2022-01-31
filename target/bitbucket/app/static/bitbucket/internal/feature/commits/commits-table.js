define('bitbucket/internal/feature/commits/commits-table', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/commits/commit-message-enricher', 'bitbucket/internal/util/events', 'bitbucket/internal/widget/paged-table/paged-table'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _commitMessageEnricher, _events, _pagedTable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _commitMessageEnricher2 = babelHelpers.interopRequireDefault(_commitMessageEnricher);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _pagedTable2 = babelHelpers.interopRequireDefault(_pagedTable);

    var focusedClass = 'focused';

    function CommitTable(getCommitsUrlBuilder, options) {
        this.getCommitsUrlBuilder = getCommitsUrlBuilder;

        var defaults = {
            target: '#commits-table',
            ajaxDataType: 'html',
            tableMessageClass: 'commits-table-message',
            allFetchedMessageHtml: '<p class="no-more-results">' + (0, _aui.escapeHtml)(_aui.I18n.getText('bitbucket.web.commit.allcommitsfetched')) + '</p>',
            noneFoundMessageHtml: '<h3 class="no-results entity-empty">' + (0, _aui.escapeHtml)(_aui.I18n.getText('bitbucket.web.commit.nocommitsfetched')) + '</h3>',
            paginationContext: 'commits-table',
            focusFirstRow: false
        };
        options = _jquery2.default.extend({}, defaults, options);

        _pagedTable2.default.call(this, options);

        this.$spinner.addClass('commits-table-spinner');
        this._destroyables = [];
    }

    _jquery2.default.extend(CommitTable.prototype, _pagedTable2.default.prototype);

    CommitTable.prototype.buildUrl = function (start, limit) {
        return this.getCommitsUrlBuilder().withParams({
            start: start,
            limit: limit,
            contents: ''
        }).build();
    };

    CommitTable.prototype.onDataLoaded = function (start, limit, data) {
        if (typeof data === 'string') {
            // real ajax request
            data = this.createDataFromJQuery(start, limit, (0, _jquery2.default)(data));
        }
        return _pagedTable2.default.prototype.onDataLoaded.call(this, start, limit, data);
    };

    CommitTable.prototype.onFirstDataLoaded = function () {
        var _this = this;

        _pagedTable2.default.prototype.onFirstDataLoaded.call(this);
        _lodash2.default.defer(function () {
            _this.$table.find('tr.commit-row').each(_this.enrichCommitMessage);
            _events2.default.trigger('bitbucket.internal.widget.commitsTable.serverContentAdded', _this);
        });
    };

    CommitTable.prototype.attachNewContent = function (data, attachmentMethod) {
        _pagedTable2.default.prototype.attachNewContent.call(this, data, attachmentMethod);

        data.values.each(this.enrichCommitMessage);
        _events2.default.trigger('bitbucket.internal.widget.commitsTable.contentAdded', this, data);
    };

    CommitTable.prototype.handleNewRows = function (data, attachmentMethod) {
        this.$table.show().children('tbody')[attachmentMethod !== 'html' ? attachmentMethod : 'append'](data.values);
    };

    CommitTable.prototype.focusInitialRow = function () {
        if (this.options.focusFirstRow) {
            // try to highlight a non-disabled row first, but if they're all disabled, just highlight the first one.
            var focusedRow = (0, _jquery2.default)(focusableRowSelector(this.$table.selector))[0] || this.$table.find('tbody .commit-row:first')[0];
            (0, _jquery2.default)(focusedRow).addClass(this.options.focusOptions.focusedClass).find('td.commit a').first().focus();
        }
    };

    CommitTable.prototype.bindKeyboardShortcuts = function () {
        var _this2 = this;

        var self = this;
        var sel = this.$table.selector;
        var openItemDisabled = false;
        var options = {
            focusedClass: this.options.focusOptions.focusedClass,
            wrapAround: false,
            escToCancel: false
        };
        var focusedRowSelector = sel + ' .commit-row.' + focusedClass;
        var rowSelector = focusableRowSelector(sel);

        this._onDisableOpenItemHandler = function () {
            openItemDisabled = true;
        };
        this._onEnableOpenItemHandler = function () {
            openItemDisabled = false;
        };
        this.bindMoveToNextHandler = function (keys) {
            (this.moveToNextItem ? this : (0, _aui.whenIType)(keys)).moveToNextItem(rowSelector, options).execute(function () {
                if ((0, _jquery2.default)(rowSelector).last().hasClass(options.focusedClass)) {
                    window.scrollTo(0, document.documentElement.scrollHeight);
                }
            });
        };

        this.bindMoveToPreviousHandler = function (keys) {
            (this.moveToPrevItem ? this : (0, _aui.whenIType)(keys)).moveToPrevItem(rowSelector, options);
        };

        this.bindOpenItemHandler = function (keys) {
            (this.execute ? this : (0, _aui.whenIType)(keys)).execute(function () {
                if (!openItemDisabled) {
                    var $focusedItem = (0, _jquery2.default)(focusedRowSelector);
                    if ($focusedItem.length) {
                        window.location.href = $focusedItem.find('td.commit a').attr('href');
                    }
                }
            });
        };

        this.bindToggleMergesHandler = function (keys) {
            var myFlag;
            (this.execute ? this : (0, _aui.whenIType)(keys)).execute(function () {
                self.$table.toggleClass('show-merges');
                var showingMerges = self.$table.hasClass('show-merges');
                var title = showingMerges ? _aui.I18n.getText('bitbucket.web.commit.filter-all') : _aui.I18n.getText('bitbucket.web.commit.filter-hide-merge');
                if (myFlag) {
                    myFlag.close();
                }
                myFlag = (0, _aui.flag)({
                    type: 'info',
                    title: title,
                    close: 'auto'
                });
            });
        };

        this.$table.on('focus', '.commit-row', function (e) {
            _events2.default.trigger('bitbucket.internal.widget.commitsTable.rowFocused', _this2, e.currentTarget);
            _this2.$table.find('.' + focusedClass).removeClass(focusedClass);
            (0, _jquery2.default)(e.currentTarget).addClass(focusedClass);
        });

        this._destroyables.push(_events2.default.chain().on('bitbucket.internal.keyboard.shortcuts.requestMoveToNextHandler', this.bindMoveToNextHandler).on('bitbucket.internal.keyboard.shortcuts.requestMoveToPreviousHandler', this.bindMoveToPreviousHandler).on('bitbucket.internal.keyboard.shortcuts.requestOpenItemHandler', this.bindOpenItemHandler).on('bitbucket.internal.keyboard.shortcuts.requestToggleMergesHandler', this.bindToggleMergesHandler).on('bitbucket.internal.keyboard.shortcuts.disableOpenItemHandler', this._onDisableOpenItemHandler).on('bitbucket.internal.keyboard.shortcuts.enableOpenItemHandler', this._onEnableOpenItemHandler));
        this._destroyables.push(_pagedTable2.default.prototype.initShortcuts.call(this));
    };

    function _createCommitLink(shortMessage, commit, commitUrl) {
        // Don't link leading/trailing whitespace
        return bitbucket.internal.feature.commits.link({
            commit: commit,
            commitUrl: commitUrl,
            shortMessage: shortMessage.trim(),
            leadingSpaces: shortMessage.match(/^\s*/)[0],
            trailingSpaces: shortMessage.match(/\s*$/)[0]
        });
    }

    CommitTable.prototype.enrichCommitMessage = function (i, row) {
        var $row = (0, _jquery2.default)(row);
        var commitJson = $row.data('commit-json');
        var commitUrl = _navbuilder2.default.currentRepo().commit(commitJson.id).build();

        $row.find('.message-subject, .message-body').each(function (j, message) {
            var $message = (0, _jquery2.default)(message);
            _commitMessageEnricher2.default.process($message.text(), commitJson, function (commitMsgSubstr) {
                return commitMsgSubstr.trim().length ? _createCommitLink(commitMsgSubstr, commitJson, commitUrl) : commitMsgSubstr;
            }).then(function (replacements) {
                $message.html(replacements);
            });
        });
    };

    CommitTable.prototype.destroy = function () {
        _pagedTable2.default.prototype.destroy.call(this);
        _lodash2.default.invokeMap(this._destroyables, 'destroy');
    };

    function focusableRowSelector() {
        var tableSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

        return (
            //Always include the currently selected element, even if it's a filtered merge row
            tableSelector + ' .commit-row.' + focusedClass + ', ' +
            //When not filtering merges, include every row
            tableSelector + '.show-merges .commit-row, ' +
            //When filtering merges, don't include merge rows
            tableSelector + ':not(.show-merges) .commit-row:not(.merge)'
        );
    }

    exports.default = CommitTable;
    module.exports = exports['default'];
});