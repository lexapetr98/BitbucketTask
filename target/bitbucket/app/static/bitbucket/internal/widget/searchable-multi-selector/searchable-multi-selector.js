define('bitbucket/internal/widget/searchable-multi-selector/searchable-multi-selector', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/util/promise'], function (module, exports, _aui, _jquery, _lodash, _ajax, _events, _function, _promise) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    /**
     *
     * @param $field the input field to convert to a searchable multi selector
     * @param options the options for configuring the multi-selector.
     * @constructor
     */
    function SearchableMultiSelector($field, options) {
        this._$field = $field;
        options = this._options = _jquery2.default.extend(true, {}, this.defaults, options);

        initDataSource(this);

        if (!_lodash2.default.isFunction(options.selectionTemplate)) {
            throw new Error('a selectionTemplate must be a function');
        }

        if (!_lodash2.default.isFunction(options.resultTemplate)) {
            throw new Error('a resultTemplate must be a function');
        }

        // Rather than storing the selected item data in a delimited string in a form field,
        // we hook in to the initialisation and change events and maintain an array of selected items.
        this._selectedItems = [];

        this._initialItems = [];
        this._excludedIds = _lodash2.default.map(options.excludedItems, options.generateId);

        initSelect2(this);

        this.setSelectedItems(options.initialItems.slice(0));
    }

    _jquery2.default.extend(true, SearchableMultiSelector.prototype, _events2.default.createEventMixin('bitbucket.internal.widget.searchable.multi.selector'), {
        defaults: {
            minimumInputLength: 2,
            extraClasses: null,
            dropdownClasses: null,
            debounceInterval: 300,
            initialItems: [],
            excludedItems: [],
            filterParamName: 'filter',
            separator: '|!|', // shouldn't be used
            urlParams: {},
            hasAvatar: false,
            inputTooShortTemplate: function inputTooShortTemplate() {
                return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.multi.selector.help'));
            },
            noMatchesTemplate: function noMatchesTemplate() {
                return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.multi.selector.no.match'));
            },
            searchingTemplate: function searchingTemplate() {
                return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.multi.selector.searching'));
            },
            generateId: function generateId(item) {
                return item.id || item.name;
            },
            generateText: function generateText(item) {
                return item.displayName || item.name;
            },
            prepareSearchTerm: _lodash2.default.identity
        },

        /**
        * @returns {Array} the currently selected items
        */
        getSelectedItems: function getSelectedItems() {
            return _lodash2.default.map(this._selectedItems, 'item');
        },
        /**
        * @param {Array} items the items to replace the current selection with
        */
        setSelectedItems: function setSelectedItems(items) {
            this._initialItems = items.slice(0);
            this._$field.auiSelect2('val', _lodash2.default.map(items, this._options.generateId));
        },
        /**
        * Clear the selected items
        */
        clearSelectedItems: function clearSelectedItems() {
            this.setSelectedItems([]);
        }
    });

    function PagedDataSource(url, urlParams, filterParamName) {
        this._url = url;
        this._urlParams = urlParams;
        this._filterParamName = filterParamName || 'filter';
        this.clear();
        this._pageReceived = _lodash2.default.bind(this._pageReceived, this);
    }

    PagedDataSource.prototype.clear = function () {
        this._nextPageStart = 0;
    };

    PagedDataSource.prototype.nextPage = function (filter) {
        var data = babelHelpers.defineProperty({
            start: this._nextPageStart
        }, this._filterParamName, filter);

        return _ajax2.default.rest({
            url: _lodash2.default.isFunction(this._url) ? this._url() : this._url,
            data: babelHelpers.extends({}, this._urlParams, data)
        }).done(this._pageReceived);
    };

    PagedDataSource.prototype._pageReceived = function (page) {
        this._nextPageStart = page.nextPageStart || page.start + page.size;
    };

    SearchableMultiSelector.PagedDataSource = PagedDataSource;

    function DelayedDataSource(delegate, debounceInterval) {
        this.clear = _lodash2.default.bind(delegate.clear, delegate);
        this.nextPage = _promise2.default.delay(_lodash2.default.bind(delegate.nextPage, delegate), debounceInterval);
    }

    //
    // Utility functions
    //

    function showNoResultsIfAllDisabled(selector) {
        // Select2 stupidly hides duplicate results, but doesn't recheck and display
        // the "no results" message if all the options are hidden.
        //  so we do that here manually.

        var $results = (0, _jquery2.default)('.select2-drop-active > .select2-results');
        if (!$results.length) {
            return;
        }

        // if all results are disabled
        if ($results.children('.select2-result-selectable').length === 0 && $results.children('.select2-disabled').length) {
            (0, _jquery2.default)('<li class="select2-no-results"></li>').html(selector._options.noMatchesTemplate()).appendTo($results);
        }
    }

    function convertToSelect2Entity(options, item) {
        return {
            id: options.generateId(item),
            text: options.generateText(item),
            item: item
        };
    }

    function reject(list, item) {
        return _lodash2.default.reject(list, function (selection) {
            return selection.id === item.id;
        });
    }

    function maybeAbort(promise) {
        promise && promise.abort && promise.abort();
    }

    function initDataSource(selector) {
        var options = selector._options;
        // set default data source if not set already
        if (!options.dataSource) {
            if (options.url) {
                options.dataSource = new PagedDataSource(options.url, options.urlParams, options.filterParamName);
            } else {
                throw new Error('either a dataSource or url must be supplied');
            }
        }

        options.dataSource = new DelayedDataSource(options.dataSource, options.debounceInterval);
    }

    function initSelect2(selector) {
        var options = selector._options;
        var $field = selector._$field;
        var excludedIds = selector._excludedIds;

        // Curry the options parameter
        var toSelect2Entity = _lodash2.default.bind(convertToSelect2Entity, null, options);

        var currentPromises = [];
        $field.auiSelect2({
            hasAvatar: options.hasAvatar,
            query: function query(opts) {
                // clear paging indices for new search
                if (opts.page <= 1) {
                    options.dataSource.clear();
                    _lodash2.default.forEach(currentPromises, maybeAbort);
                    currentPromises = [];
                }

                var filter = options.prepareSearchTerm(_jquery2.default.trim(opts.term));
                var currentPromise = options.dataSource.nextPage(filter);
                currentPromise = currentPromise.then(function (page) {
                    return {
                        results: _lodash2.default.chain(page.values).map(toSelect2Entity).filter(function (entity) {
                            return !_lodash2.default.includes(excludedIds, entity.id);
                        }).value(),
                        more: !page.isLastPage
                    };
                }).promise(currentPromise);

                currentPromises.push(currentPromise);
                currentPromise.always(function () {
                    currentPromises = _lodash2.default.reject(currentPromises, _function2.default.eq(currentPromise));
                }).done(opts.callback);
            },
            formatSelection: function formatSelection(entity) {
                return options.selectionTemplate(entity.item);
            },
            formatResult: function formatResult(entity) {
                return options.resultTemplate(entity.item);
            },
            initSelection: function initSelection(element, callback) {
                var select2Entities = _lodash2.default.map(selector._initialItems, toSelect2Entity);
                selector._selectedItems = select2Entities;
                callback(select2Entities);
            },
            separator: options.separator,
            multiple: true,
            minimumInputLength: options.minimumInputLength,
            formatInputTooShort: options.inputTooShortTemplate,
            formatNoMatches: options.noMatchesTemplate,
            formatSearching: options.searchingTemplate,
            containerCssClass: ['searchable-multi-selector', options.extraClasses].join(' '),
            dropdownCssClass: ['searchable-multi-selector-dropdown', options.dropdownClasses].join(' '),
            openOnEnter: false
        }).on('change', function (changeEvent) {
            if (changeEvent.removed) {
                selector._selectedItems = reject(selector._selectedItems, changeEvent.removed);
            }
            if (changeEvent.added) {
                selector._selectedItems.push(changeEvent.added);
            }
            selector.trigger('change'); // bubble the event to the selector
        }).on('open', _lodash2.default.bind(showNoResultsIfAllDisabled, null, this));
    }

    exports.default = SearchableMultiSelector;
    module.exports = exports['default'];
});