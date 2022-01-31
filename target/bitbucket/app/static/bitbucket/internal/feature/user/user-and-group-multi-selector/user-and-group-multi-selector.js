define('bitbucket/internal/feature/user/user-and-group-multi-selector/user-and-group-multi-selector', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/feature/user/group-multi-selector/group-multi-selector', 'bitbucket/internal/feature/user/user-multi-selector/user-multi-selector', 'bitbucket/internal/util/promise', 'bitbucket/internal/widget/searchable-multi-selector/searchable-multi-selector'], function (module, exports, _aui, _jquery, _lodash, _groupMultiSelector, _userMultiSelector, _promise, _searchableMultiSelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _groupMultiSelector2 = babelHelpers.interopRequireDefault(_groupMultiSelector);

    var _userMultiSelector2 = babelHelpers.interopRequireDefault(_userMultiSelector);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    var _searchableMultiSelector2 = babelHelpers.interopRequireDefault(_searchableMultiSelector);

    var PagedDataSource = _searchableMultiSelector2.default.PagedDataSource;

    var typeToSelectionTemplate = {
        user: _userMultiSelector2.default.prototype.defaults.selectionTemplate,
        group: _groupMultiSelector2.default.prototype.defaults.selectionTemplate
    };

    var typeToResultTemplate = {
        user: _userMultiSelector2.default.prototype.defaults.resultTemplate,
        group: _groupMultiSelector2.default.prototype.defaults.resultTemplate
    };

    var typeToGenerateId = {
        user: _userMultiSelector2.default.prototype.defaults.generateId,
        group: _groupMultiSelector2.default.prototype.defaults.generateId
    };

    var typeToGenerateText = {
        user: _userMultiSelector2.default.prototype.defaults.generateText,
        group: _groupMultiSelector2.default.prototype.defaults.generateText
    };

    var flatMap = function flatMap(v, f) {
        return Array.prototype.concat.apply([], _lodash2.default.map(v, f));
    };

    /**
     * These functions are an unfortunate side effect of us returning a pluralized version of the items in a previous
     * version. In order to not break any existing consumers, we need to pluralize object keys when we return them,
     * then unpluralize them when receiving them.
     */
    var pluralize = function pluralize(t) {
        return t + 's';
    };
    var unpluralize = function unpluralize(t) {
        return t.lastIndexOf('s') === t.length - 1 ? t.substring(0, t.length - 1) : t;
    };

    var toTypedItem = function toTypedItem(type) {
        return function (entity) {
            return {
                type: type,
                entity: entity
            };
        };
    };

    function toItemList() {
        var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return flatMap(items, function (items, type) {
            return _lodash2.default.map(items, toTypedItem(unpluralize(type)));
        });
    }

    function UserAndGroupMultiSelector($field, options) {
        options = _jquery2.default.extend(true, {}, this.defaults, options);

        options.initialItems = toItemList(options.initialItems);
        options.excludedItems = toItemList(options.excludedItems);

        if (!options.dataSource) {
            var dataSources = _lodash2.default.map(options.urls, function (url, name) {
                return {
                    type: name,
                    dataSource: new PagedDataSource(url, options.urlParams[name])
                };
            });
            options.dataSource = new MergingDataSource(options.typeToGenerateText, dataSources);
        }

        _searchableMultiSelector2.default.call(this, $field, _jquery2.default.extend(true, {}, options, {
            selectionTemplate: function selectionTemplate(item) {
                return options.typeToSelectionTemplate[item.type](item.entity);
            },
            resultTemplate: function resultTemplate(item) {
                return options.typeToResultTemplate[item.type](item.entity);
            },
            generateId: function generateId(item) {
                return item.type + ':' + options.typeToGenerateId[item.type](item.entity);
            },
            generateText: function generateText(item) {
                return options.typeToGenerateText[item.type](item.entity);
            }
        }));
    }

    _jquery2.default.extend(true, UserAndGroupMultiSelector.prototype, _searchableMultiSelector2.default.prototype, {
        defaults: {
            initialItems: {
                user: [],
                group: []
            },
            excludedItems: {
                user: [],
                group: []
            },
            urls: {
                user: _userMultiSelector2.default.prototype.defaults.url,
                group: _groupMultiSelector2.default.prototype.defaults.url
            },
            urlParams: {
                user: _userMultiSelector2.default.prototype.defaults.urlParams,
                group: _groupMultiSelector2.default.prototype.defaults.urlParams
            },
            hasAvatar: true,
            typeToGenerateId: typeToGenerateId,
            typeToGenerateText: typeToGenerateText,
            typeToResultTemplate: typeToResultTemplate,
            typeToSelectionTemplate: typeToSelectionTemplate,
            inputTooShortTemplate: function inputTooShortTemplate() {
                return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.user.and.group.multi.selector.help'));
            },
            noMatchesTemplate: function noMatchesTemplate() {
                return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.user.and.group.multi.selector.no.match'));
            }
        },
        getSelectedItems: function getSelectedItems() {
            return _lodash2.default.reduce(_searchableMultiSelector2.default.prototype.getSelectedItems.call(this), function (memo, item) {
                var key = pluralize(item.type);
                (memo[key] = memo[key] || []).push(item.entity);
                return memo;
            }, {});
        },
        setSelectedItems: function setSelectedItems(items) {
            _searchableMultiSelector2.default.prototype.setSelectedItems.call(this, toItemList(items));
        },
        clearSelectedItems: function clearSelectedItems() {
            return this.setSelectedItems({});
        }
    });

    var emptyPage = _jquery2.default.Deferred().resolve({
        isLastPage: true,
        values: []
    });

    var itemCompare = function itemCompare(self) {
        return function (i1, i2) {
            var text1 = self.typeToGenerateText[i1.type](i1.entity);
            var text2 = self.typeToGenerateText[i2.type](i2.entity);
            return text1.toLowerCase().localeCompare(text2.toLowerCase());
        };
    };

    function MergingDataSource(typeToGenerateText, dataSources) {
        this.typeToGenerateText = typeToGenerateText;
        this.dataSources = dataSources;
    }

    MergingDataSource.prototype.clear = function () {
        this.dataSources.forEach(function (source) {
            source.atEnd = false;
            source.dataSource.clear();
        });
    };

    MergingDataSource.prototype.nextPage = function (filter) {
        var dataSourcePromises = this.dataSources.map(function (source) {
            if (source.atEnd) {
                return emptyPage;
            }

            return source.dataSource.nextPage(filter).then(function (page) {
                source.atEnd = page.isLastPage;
                page.values = page.values.map(toTypedItem(source.type));
                return page;
            });
        });

        var promise = _promise2.default.reduce.apply(_promise2.default, babelHelpers.toConsumableArray(dataSourcePromises));
        var byText = itemCompare(this);
        return promise.then(function () {
            return {
                values: flatMap(arguments, function (page) {
                    return page.values;
                }).sort(byText),
                isLastPage: [].concat(Array.prototype.slice.call(arguments)).every(function (page) {
                    return page.isLastPage;
                })
            };
        }).promise(promise);
    };

    exports.default = UserAndGroupMultiSelector;
    module.exports = exports['default'];
});