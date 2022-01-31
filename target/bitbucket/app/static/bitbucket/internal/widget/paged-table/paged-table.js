define('bitbucket/internal/widget/paged-table/paged-table', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/util/ajax', 'bitbucket/internal/widget/error-dialog/error-dialog', 'bitbucket/internal/widget/paged-scrollable'], function (module, exports, _aui, _jquery, _lodash, _ajax, _errorDialog, _pagedScrollable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _errorDialog2 = babelHelpers.interopRequireDefault(_errorDialog);

    var _pagedScrollable2 = babelHelpers.interopRequireDefault(_pagedScrollable);

    /**
     * An abstract widget used for tables that wish to handle scroll events and load new rows as the user nears the edge of the page.
     *
     * Support is provided for tables that start with some row content already - the initial count of rows is used as the
     * start of the first page of rows to request.
     *
     * It is assumed sub-classes will want to allow navigation of rows and provision is made for this however it is not
     * strictly necessary for sub-classes to implement.
     *
     * To extend PagedTable, you must implement:
     * this.buildUrl(start, limit) : this must build a URL to retrieve the next page of row data
     * this.handleNewRows(data, attachmentMethod) : given a RestPage object and an attachmentMethod ('prepend', 'append', or 'html'),
     * should add new rows to the table
     * this.handleErrors(errors) : should display something appropriate in response to the errors encountered when retrieving new row data
     *
     * You must also supply the following options for which there are no defaults:
     *  - tableMessageClass - the custom CSS class for the element used to display table messages
     *  - allFetchedMessageHtml - the message shown when all rows have been fetched
     *  - noneFoundMessageHtml - the message shown when there were no rows to display
     *
     * You may wish to supply the following options to override defaults:
     *  - ajaxDataType (defaults to 'json') - the data type of the ajax response
     *  - rowSelector (defaults to '> tbody > tr') - allows other elements (such as lists) to be used instead of an actual HTML table
     */
    function PagedTable(options) {
        options = _jquery2.default.extend(true, {}, PagedTable.defaults, options);
        _pagedScrollable2.default.call(this, options.scrollPaneSelector, options);
        this.$table = (0, _jquery2.default)(options.target);
        if (options.filterable) {
            this.$filter = options.filter ? (0, _jquery2.default)(options.filter) : this.$table.prev('.paged-table-filter').find('.paged-table-filter-input');
            this._currentFilterText = _jquery2.default.trim(this.$filter.val());
            var onFilterChanged = _lodash2.default.debounce(_lodash2.default.bind(this._onFilterChanged, this), options.filterDebounce);
            this.$filter.on('keyup.paged-table-filter', function (e) {
                if (e.which === _aui2.default.keyCode.ESCAPE) {
                    (0, _jquery2.default)(this).blur();
                } else {
                    onFilterChanged(e);
                }
            }).on('paste.paged-table-filter', onFilterChanged);
        }
        this.$spinner = (0, _jquery2.default)("<div class='spinner'/>").hide().insertAfter(this.$table);
        this.spinnerShowing = false;
        this.processedDomData = this.$table.attr('data-lastpage') == null;
        // Has the data supplied in the initial page load been processed.
        // If there was none supplied (data-lastpage is null), this is set to true to skip loading the initial data from the DOM later on.
    }

    PagedTable.defaults = {
        ajaxDataType: 'json',
        spinnerSize: 'large',
        filterable: false,
        bufferPixels: 150,
        filterDebounce: 350,
        rowSelector: '> tbody > tr',
        focusOptions: {
            escToCancel: false,
            focusedClass: 'focused',
            rowSelector: '> tbody > tr',
            wrapAround: false
        }
    };

    _jquery2.default.extend(PagedTable.prototype, _pagedScrollable2.default.prototype);

    PagedTable.prototype.init = function () {
        return _pagedScrollable2.default.prototype.init.apply(this, arguments).done(_lodash2.default.bind(function () {
            if (this.shortcutsInitialised) {
                this.focusInitialRow();
            }
        }, this));
    };

    PagedTable.prototype.getFilterText = function () {
        return this._currentFilterText;
    };

    PagedTable.prototype._onFilterChanged = function () {
        var newFilterText = _jquery2.default.trim(this.$filter.val());
        if (this._currentFilterText !== newFilterText) {
            this._currentFilterText = newFilterText;
            this.update();
        }
    };

    PagedTable.prototype.requestData = function (start, limit) {
        if (!this.processedDomData) {
            return _jquery2.default.Deferred().resolve(this.createDataFromJQuery(start, limit, this.$table)); // The initial page will already be in the DOM
        }
        var self = this;
        self.spinnerShowing = true;
        self.$spinner.show().spin(self.options.spinnerSize, { zIndex: 10 });
        return self.performAjax(start, limit).always(function () {
            // Ensure the spinner gets removed after the content is inserted to avoid jumps when
            self._hideSpinnerTimeout = setTimeout(function () {
                self.spinnerShowing && self.$spinner.spinStop().hide();
                self.spinnerShowing = false;
            }, 0);
        });
    };

    PagedTable.prototype.performAjax = function (start, limit) {
        var self = this;

        return _ajax2.default.ajax({
            url: self.buildUrl(start, limit, self.getFilterText()),
            dataType: self.options.ajaxDataType,
            statusCode: self.options.statusCode
        });
    };

    PagedTable.prototype.cancelRequest = function () {
        _pagedScrollable2.default.prototype.cancelRequest.call(this);
        if (this._hideSpinnerTimeout) {
            clearTimeout(this._hideSpinnerTimeout);
        }
    };

    PagedTable.prototype.reset = function () {
        _pagedScrollable2.default.prototype.reset.call(this);
        if (this.processedDomData) {
            this.$table.find(this.options.rowSelector).remove().end().next('.paged-table-message').remove().end();
        }
        this.$table.addClass('no-rows');
    };

    PagedTable.prototype.update = function (options) {
        this.reset();
        return this.init(options);
    };

    PagedTable.prototype.createDataFromJQuery = function (start, limit, $table) {
        var $rows = $table.find(this.options.rowSelector);
        var isLastPage = $table.attr('data-lastpage') === 'true';
        var nextPageStart = $table.attr('data-nextpagestart');

        var page = {
            // property names must match the constants in RestPage
            start: Number($table.attr('data-start')),
            size: Number($table.attr('data-size')),
            values: $rows,
            isLastPage: isLastPage
        };

        if (nextPageStart != null) {
            page.nextPageStart = Number(nextPageStart);
        }

        return page;
    };

    PagedTable.prototype.attachNewContent = function (data, attachmentMethod) {
        if (data.size) {
            if (this.processedDomData) {
                if (data && data.errors) {
                    this.handleErrors(data.errors);
                    return;
                }
                this.handleNewRows(data, attachmentMethod);
            }

            if (data.start > 0 && data.isLastPage) {
                this.handleLastPage();
            }
            this.$table.removeClass('no-rows');
        } else if (data.isLastPage) {
            //There's no data and it's the last page, therefore there are no pull requests.
            this.handleNoData();
        }

        // Once we have finished manipulating update the timestamp.
        this.updateTimestamp();

        this.processedDomData = true;
    };

    /**
     * Modify the last updated timestamp. This should be called after any modification to the
     * table is made. This is useful when writing browser tests
     */
    PagedTable.prototype.updateTimestamp = function () {
        this.$table.attr('data-last-updated', new Date().getTime());
    };

    /** Implement if rows can be focused and keyboard shortcuts allow focus navigation */
    PagedTable.prototype.focusInitialRow = function () {
        this.$table.find(this.options.focusOptions.rowSelector).first().addClass(this.options.focusOptions.focusedClass);
    };

    /** Override if keyboard shortcuts are required but be sure to call this method afterwards */
    PagedTable.prototype.initShortcuts = function () {
        this.shortcutsInitialised = true;
        this.focusInitialRow(); //initShortcuts is called after init, so we need to manually call this the first time.
        return {
            destroy: _lodash2.default.bind(this.resetShortcuts, this)
        };
    };

    PagedTable.prototype.resetShortcuts = function () {
        this.shortcutsInitialised = false;
    };

    PagedTable.prototype._new$Message = function (content) {
        return (0, _jquery2.default)('<div class="paged-table-message"/>').addClass(this.options.tableMessageClass).html(content || '');
    };

    PagedTable.prototype.handleLastPage = function () {
        this.$table.after(this._new$Message(this.options.allFetchedMessageHtml));
    };

    PagedTable.prototype.handleNoData = function () {
        var filterText = this.getFilterText();
        var messageHtml = filterText && filterText.length ? this.options.noneMatchingMessageHtml : this.options.noneFoundMessageHtml;

        this.$table.addClass('no-rows').after(this._new$Message(messageHtml));
    };

    /**
     * This is a base implementation of the error handler, however it should be fully implemented in any classes
     * that inherit PagedTable
     * @param errors
     * @abstract
     */
    PagedTable.prototype.handleErrors = function (errors) {
        new _errorDialog2.default({
            panelContent: '<p>' + _aui2.default.escapeHtml(errors[0].message) + '</p>'
        }).show();
    };

    /**
     *
     * @param {Number} start
     * @param {Number} limit
     * @param {String?} filter
     * @abstract
     */
    PagedTable.prototype.buildUrl = function (start, limit, filter) {
        throw new Error('buildUrl is abstract and must be implemented.');
    };

    /**
     *
     * @param {object} data
     * @param {string} attachmentMethod - valid jQuery
     * @abstract
     */
    PagedTable.prototype.handleNewRows = function (data, attachmentMethod) {
        throw new Error('handleNewRows is abstract and must be implemented.');
    };

    exports.default = PagedTable;
    module.exports = exports['default'];
});