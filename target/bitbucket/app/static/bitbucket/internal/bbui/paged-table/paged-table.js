define('bitbucket/internal/bbui/paged-table/paged-table', ['exports', '@atlassian/aui', 'classnames', 'prop-types', 'react', 'bitbucket/internal/util/scroll', '../aui-react/spinner', '../scroll-handler/scroll-handler'], function (exports, _aui, _classnames, _propTypes, _react, _scroll, _spinner, _scrollHandler) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.DEFAULT_PAGE_SIZE = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _spinner2 = babelHelpers.interopRequireDefault(_spinner);

    var _scrollHandler2 = babelHelpers.interopRequireDefault(_scrollHandler);

    var DEFAULT_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = 25;
    var noop = function noop() {}; //reused to prevent unnecessary renders of pure components

    var PagedTable = function (_Component) {
        babelHelpers.inherits(PagedTable, _Component);

        function PagedTable() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, PagedTable);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = PagedTable.__proto__ || Object.getPrototypeOf(PagedTable)).call.apply(_ref, [this].concat(args))), _this), _this.state = { lastUpdated: Date.now() }, _this.fetchFirstPageIfRequired = function () {
                var _this$props = _this.props,
                    allFetched = _this$props.allFetched,
                    items = _this$props.items,
                    loading = _this$props.loading,
                    onMoreItemsRequested = _this$props.onMoreItemsRequested,
                    scrollToLoad = _this$props.scrollToLoad;


                if (!scrollToLoad && !items.length && !allFetched && !loading) {
                    //Request the first page of items if it wasn't prepopulated
                    //ScrollHandler takes care of filling the viewport if possible,
                    //including from an initial unpopulated state, so only do it for manual paging
                    onMoreItemsRequested();
                }
            }, _this.focusElInView = function (isInitial) {
                var _this$props2 = _this.props,
                    shouldNativeFocus = _this$props2.shouldNativeFocus,
                    scrollElement = _this$props2.scrollElement,
                    shouldScrollOnFocus = _this$props2.shouldScrollOnFocus;


                if (!_this.focusedElement) {
                    return;
                }

                if (shouldScrollOnFocus) {
                    (0, _scroll.centerElementInScrollContainer)(_this.focusedElement, scrollElement);
                }

                if (!isInitial) {
                    //Don't disable hover unless the user has triggered a focused item change
                    //(not just the automatic initial focus of the first item)
                    (0, _scroll.disableHoverUntilMouseMove)(_this.table); //Hide mouse hover when KB navigating
                }

                if (shouldNativeFocus) {
                    _this.focusedElement.focus();
                }
            }, _this.assignFocusedElement = function (el) {
                return _this.focusedElement = el;
            }, _this.open = function () {
                return _this.focusedElement && _this.focusedElement.click();
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(PagedTable, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _props = this.props,
                    items = _props.items,
                    openCallback = _props.openCallback;


                this.fetchFirstPageIfRequired();

                if (items.length) {
                    this.focusElInView(true);
                }

                if (openCallback) {
                    openCallback(this.open);
                }
            }
        }, {
            key: 'componentDidUpdate',
            value: function componentDidUpdate(_ref2) {
                var focusedIndex = _ref2.focusedIndex,
                    items = _ref2.items,
                    openCallback = _ref2.openCallback;

                this.fetchFirstPageIfRequired();

                if (focusedIndex !== this.props.focusedIndex) {
                    var isInitial = this.props.items.length && items.length === 0;
                    this.focusElInView(isInitial);
                }

                if (this.props.openCallback && this.props.openCallback !== openCallback) {
                    this.props.openCallback(this.open);
                }
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                var _props2 = this.props,
                    allFetched = _props2.allFetched,
                    allFetchedMessage = _props2.allFetchedMessage,
                    bufferPx = _props2.bufferPx,
                    className = _props2.className,
                    focusedIndex = _props2.focusedIndex,
                    header = _props2.header,
                    items = _props2.items,
                    loading = _props2.loading,
                    loadMoreMessage = _props2.loadMoreMessage,
                    noItemsMessage = _props2.noItemsMessage,
                    onMoreItemsRequested = _props2.onMoreItemsRequested,
                    pageSize = _props2.pageSize,
                    row = _props2.row,
                    scrollElement = _props2.scrollElement,
                    scrollToLoad = _props2.scrollToLoad,
                    showTableIfNoResults = _props2.showTableIfNoResults;
                var lastUpdated = this.state.lastUpdated;


                var rows = row ? items.map(function (item, i) {
                    var focused = focusedIndex === i;

                    return row({
                        item: item,
                        focused: focused,
                        primaryRefCallback: focused ? _this2.assignFocusedElement : noop
                    });
                }) : null;

                var tableMessage = void 0;

                if (!loading) {
                    if (allFetched) {
                        if (items.length > pageSize) {
                            tableMessage = allFetchedMessage;
                        }
                        if (!items.length) {
                            tableMessage = noItemsMessage;
                        }
                    } else if (!scrollToLoad) {
                        tableMessage = _react2.default.createElement(
                            'button',
                            { className: 'aui-button aui-button-link', onClick: onMoreItemsRequested },
                            loadMoreMessage
                        );
                    }
                }

                var table = showTableIfNoResults || items.length ? _react2.default.createElement(
                    'table',
                    {
                        className: (0, _classnames2.default)('aui paged-table', className),
                        'data-last-updated': lastUpdated //This is crappy but used to support func tests
                        , ref: function ref(tableEl) {
                            return _this2.table = tableEl;
                        }
                    },
                    header && _react2.default.createElement(
                        'thead',
                        null,
                        header()
                    ),
                    _react2.default.createElement(
                        'tbody',
                        null,
                        rows
                    )
                ) : null;

                return _react2.default.createElement(
                    'div',
                    { className: 'paged-table-container' },
                    scrollToLoad ? _react2.default.createElement(
                        _scrollHandler2.default,
                        {
                            bufferPx: bufferPx,
                            onScrollToBottom: onMoreItemsRequested,
                            scrollElement: scrollElement,
                            suspend: allFetched || loading
                        },
                        table
                    ) : table,
                    loading && _react2.default.createElement(_spinner2.default, null),
                    tableMessage && _react2.default.createElement(
                        'div',
                        { className: 'paged-table-message' },
                        tableMessage
                    )
                );
            }
        }], [{
            key: 'getDerivedStateFromProps',
            value: function getDerivedStateFromProps(_ref3, prevState) {
                var allFetched = _ref3.allFetched,
                    items = _ref3.items,
                    loading = _ref3.loading;

                var itemCount = items && items.length || 0;
                //Kinda crappy heuristic for detecting a "real" update to prevent churn on the `lastUpdated`
                var updated = !loading && (itemCount !== prevState.itemCount || allFetched !== prevState.allFetched);
                return {
                    allFetched: allFetched,
                    itemCount: itemCount,
                    loading: loading,
                    lastUpdated: updated ? Date.now() : prevState.lastUpdated
                };
            }
        }]);
        return PagedTable;
    }(_react.Component);

    PagedTable.propTypes = {
        allFetched: _propTypes2.default.bool.isRequired,
        allFetchedMessage: _propTypes2.default.string,
        bufferPx: _scrollHandler2.default.propTypes.bufferPx,
        className: _propTypes2.default.string,
        focusedIndex: _propTypes2.default.number,
        header: _propTypes2.default.func,
        items: _propTypes2.default.array.isRequired,
        loading: _propTypes2.default.bool.isRequired,
        loadMoreMessage: _propTypes2.default.string,
        noItemsMessage: _propTypes2.default.string,
        onMoreItemsRequested: _propTypes2.default.func.isRequired,
        openCallback: _propTypes2.default.func,
        pageSize: _propTypes2.default.number,
        row: _propTypes2.default.func.isRequired,

        // Should scroll window to the focused element
        shouldScrollOnFocus: _propTypes2.default.bool,

        scrollElement: _scrollHandler2.default.propTypes.scrollElement,
        scrollToLoad: _propTypes2.default.bool,
        shouldNativeFocus: _propTypes2.default.bool,
        showTableIfNoResults: _propTypes2.default.bool
    };
    PagedTable.defaultProps = {
        loadMoreMessage: _aui.I18n.getText('bitbucket.web.button.load.more'),
        pageSize: DEFAULT_PAGE_SIZE, //Used to only show `allFetchedMessage` when more than 1 page has been loaded
        scrollToLoad: true,
        shouldNativeFocus: true,
        shouldScrollOnFocus: true,
        showTableIfNoResults: true
    };
    exports.default = PagedTable;
});