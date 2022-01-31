define('bitbucket/internal/widget/filterable-entity-table/filterable-entity-table', ['exports', '@atlassian/aui', 'classnames', 'lodash', 'prop-types', 'react', 'react-redux', 'bitbucket/internal/bbui/paged-table/paged-table', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/scroll', 'bitbucket/internal/util/shortcuts', './action-creators', './selectors'], function (exports, _aui, _classnames, _lodash, _propTypes, _react, _reactRedux, _pagedTable, _domEvent, _scroll, _shortcuts, _actionCreators, _selectors) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.connectEntityTable = exports.filterableOverrideMerge = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _pagedTable2 = babelHelpers.interopRequireDefault(_pagedTable);

    var shortcuts = babelHelpers.interopRequireWildcard(_shortcuts);
    var createKeyboardShortcutsHandler = shortcuts.createKeyboardShortcutsHandler;
    // FIXME: Remove me once we fix the babel export/import issue

    /**
     * Allow the `filterable` prop from state to override ownProps only when it is explicitly set.
     * @param {Object} stateProps
     * @param {Object} dispatchProps
     * @param {Object} ownProps
     */
    var filterableOverrideMerge = exports.filterableOverrideMerge = function filterableOverrideMerge(stateProps, dispatchProps, ownProps) {
        return babelHelpers.extends({}, ownProps, (0, _lodash.omit)(stateProps, 'filterable'), dispatchProps, {
            filterable: (0, _lodash.isBoolean)(stateProps.filterable) ? stateProps.filterable : ownProps.filterable
        });
    };

    /**
     * Connect a given entity table to the store using the entity helpers
     *
     * @param {String} entityName
     * @param {String} loadAction
     * @param {FilterableEntityTable} Table
     */
    var connectEntityTable = exports.connectEntityTable = function connectEntityTable(entityName, loadAction, Table) {
        return (0, _reactRedux.connect)((0, _selectors.getStateForEntity)(entityName), (0, _actionCreators.entityActionCreators)(loadAction), filterableOverrideMerge)(Table);
    };

    var FilterableEntityTable = function (_PureComponent) {
        babelHelpers.inherits(FilterableEntityTable, _PureComponent);

        function FilterableEntityTable() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, FilterableEntityTable);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = FilterableEntityTable.__proto__ || Object.getPrototypeOf(FilterableEntityTable)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
                focusedEntity: null,
                filterFocused: false,
                filter: null,
                entities: null
            }, _this.onFilterChange = (0, _lodash.debounce)(function (filter) {
                return _this.props.setFilter(filter);
            }, 250), _this.blurFilter = function () {
                return _this.setState({ filterFocused: false });
            }, _this.focusFilter = function () {
                return _this.setState({ filterFocused: true });
            }, _this.focusNext = function () {
                var entities = _this.props.entities;


                _this.setState(function (_ref2) {
                    var focusedEntity = _ref2.focusedEntity;
                    return {
                        focusedEntity: entities[Math.min(entities.indexOf(focusedEntity) + 1, entities.length - 1)]
                    };
                });
            }, _this.focusPrev = function () {
                var entities = _this.props.entities;


                _this.setState(function (_ref3) {
                    var focusedEntity = _ref3.focusedEntity;
                    return {
                        focusedEntity: entities[Math.max(entities.indexOf(focusedEntity) - 1, 0)]
                    };
                });
            }, _this.open = function () {
                _this._openHandler && _this._openHandler();
            }, _this.onKeydown = createKeyboardShortcutsHandler({
                f: _this.focusFilter,
                j: _this.focusNext,
                k: _this.focusPrev,
                o: _this.open
            }), _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(FilterableEntityTable, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                document.addEventListener('keydown', this.onKeydown);
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                document.removeEventListener('keydown', this.onKeydown);
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                var _props = this.props,
                    bufferPx = _props.bufferPx,
                    className = _props.className,
                    emptyState = _props.emptyState,
                    entities = _props.entities,
                    filter = _props.filter,
                    filterable = _props.filterable,
                    filterPlaceholder = _props.filterPlaceholder,
                    header = _props.header,
                    isLastPage = _props.isLastPage,
                    lastPageMessage = _props.lastPageMessage,
                    _props$limit = _props.limit,
                    limit = _props$limit === undefined ? this.props.pageSize : _props$limit,
                    loadEntities = _props.loadEntities,
                    loading = _props.loading,
                    loadMoreMessage = _props.loadMoreMessage,
                    start = _props.nextPageStart,
                    noItemsMessage = _props.noItemsMessage,
                    _props$row = _props.row,
                    row = _props$row === undefined ? this.row : _props$row,
                    scrollToLoad = _props.scrollToLoad,
                    shouldScrollOnFocus = _props.shouldScrollOnFocus,
                    scrollElement = _props.scrollElement,
                    showTableIfNoResults = _props.showTableIfNoResults;
                var _state = this.state,
                    filterFocused = _state.filterFocused,
                    focusedEntity = _state.focusedEntity;


                //If the unfiltered list is empty, don't show the filter input
                var listIsFilterable = !(!filter && !entities.length);

                if (!filter && !entities.length && isLastPage && emptyState) {
                    //Only show empty state when there are no unfiltered results
                    return emptyState;
                }

                return _react2.default.createElement(
                    'div',
                    { className: (0, _classnames2.default)(className, 'filterable-entity-table') },
                    filterable && listIsFilterable && _react2.default.createElement(FilterInput, {
                        onKeyDown: createKeyboardShortcutsHandler({
                            ArrowDown: this.focusNext,
                            ArrowUp: this.focusPrev,
                            Enter: this.open
                        }),
                        onInput: function onInput(e) {
                            return _this2.onFilterChange(e.target.value);
                        },
                        onBlur: this.blurFilter,
                        onFocus: this.focusFilter,
                        focused: filterFocused,
                        placeholder: filterPlaceholder
                    }),
                    _react2.default.createElement(_pagedTable2.default, {
                        allFetched: isLastPage,
                        allFetchedMessage: lastPageMessage,
                        bufferPx: bufferPx,
                        className: 'entity-table',
                        focusedIndex: entities.indexOf(focusedEntity),
                        header: header,
                        items: entities,
                        loading: loading,
                        loadMoreMessage: loadMoreMessage,
                        noItemsMessage: noItemsMessage,
                        onMoreItemsRequested: function onMoreItemsRequested() {
                            return loadEntities({ filter: filter, start: start, limit: limit });
                        },
                        pageSize: limit,
                        row: row,
                        openCallback: function openCallback(fn) {
                            return _this2._openHandler = fn;
                        },
                        scrollElement: scrollElement,
                        scrollToLoad: scrollToLoad,
                        shouldScrollOnFocus: shouldScrollOnFocus,
                        shouldNativeFocus: !filterFocused,
                        showTableIfNoResults: showTableIfNoResults
                    })
                );
            }
        }], [{
            key: 'getDerivedStateFromProps',
            value: function getDerivedStateFromProps(_ref4, prevState) {
                var entities = _ref4.entities,
                    filter = _ref4.filter;

                var changes = {
                    entities: entities,
                    filter: filter
                };
                if (!prevState.focusedEntity || // initializing.
                (0, _lodash.get)(filter, 'length', 0) < prevState.filter.length || //Filter cleared or shortened (i.e. backspaced)
                entities.length && !(0, _lodash.includes)(entities, prevState.focusedEntity) || //Entity is not in new list
                !prevState.filter && filter && prevState.focusedEntity === prevState.entities[0] //Initial auto-focus
                ) {
                        // Always reset the focused entity to the first entity:
                        // when clearing or shortening the filter,
                        // when the focusedEntity doesn't exist in the new list and
                        // don't preserve the initial auto-focus of first item in unfiltered list when transitioning to filtered
                        changes.focusedEntity = entities[0];
                    }
                return changes;
            }
        }]);
        return FilterableEntityTable;
    }(_react.PureComponent);

    FilterableEntityTable.propTypes = {
        bufferPx: _propTypes2.default.number,
        className: _propTypes2.default.string,
        emptyState: _propTypes2.default.element,
        entities: _propTypes2.default.array,
        filter: _propTypes2.default.string,
        filterable: _propTypes2.default.bool,
        filterPlaceholder: _propTypes2.default.string,
        header: _propTypes2.default.func,
        isLastPage: _propTypes2.default.bool,
        lastPageMessage: _propTypes2.default.string,
        limit: _propTypes2.default.number,
        loadEntities: _propTypes2.default.func,
        loading: _propTypes2.default.bool,
        loadMoreMessage: _propTypes2.default.string,
        nextPageStart: _propTypes2.default.number,
        noItemsMessage: _propTypes2.default.string,
        pageSize: _propTypes2.default.number,
        row: _propTypes2.default.func,
        scrollToLoad: _propTypes2.default.bool,
        scrollElement: _pagedTable2.default.propTypes.scrollElement,

        // Should scroll window to the focused element
        shouldScrollOnFocus: _propTypes2.default.bool,
        showTableIfNoResults: _propTypes2.default.bool
    };
    FilterableEntityTable.defaultProps = {
        filterable: false,
        header: function header() {
            return _react2.default.createElement(
                'tr',
                null,
                _react2.default.createElement(
                    'th',
                    null,
                    _aui.I18n.getText('bitbucket.web.entity.col.name')
                )
            );
        },
        isLastPage: false, //For tables with no initial page of data, the default should be to request it
        lastPageMessage: _aui.I18n.getText('bitbucket.web.entity.allfetched'),
        loading: false,
        loadMoreMessage: _aui.I18n.getText('bitbucket.web.entity.loadmore'),
        noItemsMessage: _aui.I18n.getText('bitbucket.web.entity.nonefound'),
        filterPlaceholder: _aui.I18n.getText('bitbucket.web.entity.filter.placeholder'),
        scrollElement: window,
        scrollToLoad: true,
        shouldScrollOnFocus: true,
        showTableIfNoResults: true
    };
    exports.default = FilterableEntityTable;

    var FilterInput = function (_PureComponent2) {
        babelHelpers.inherits(FilterInput, _PureComponent2);

        function FilterInput() {
            babelHelpers.classCallCheck(this, FilterInput);
            return babelHelpers.possibleConstructorReturn(this, (FilterInput.__proto__ || Object.getPrototypeOf(FilterInput)).apply(this, arguments));
        }

        babelHelpers.createClass(FilterInput, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                if (this.props.focused) {
                    this.input.focus();
                }
            }
        }, {
            key: 'componentDidUpdate',
            value: function componentDidUpdate(_ref5) {
                var focused = _ref5.focused;

                if (this.props.focused && !focused) {
                    //Only trigger a `.focus` if the element wasn't already focused
                    this.input.focus();
                }
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                if (this.props.onBlur) {
                    this.props.onBlur();
                }
            }
        }, {
            key: 'render',
            value: function render() {
                var _this4 = this;

                var _props2 = this.props,
                    onKeyDown = _props2.onKeyDown,
                    onInput = _props2.onInput,
                    onFocus = _props2.onFocus,
                    onBlur = _props2.onBlur,
                    placeholder = _props2.placeholder;


                return _react2.default.createElement(
                    'div',
                    { className: 'paged-table-filter' },
                    _react2.default.createElement('input', {
                        className: 'paged-table-filter-input',
                        onBlur: onBlur,
                        onFocus: onFocus,
                        onInput: onInput,
                        onKeyDown: onKeyDown,
                        placeholder: placeholder,
                        ref: function ref(input) {
                            _this4.input = input;
                        }
                    })
                );
            }
        }]);
        return FilterInput;
    }(_react.PureComponent);
});