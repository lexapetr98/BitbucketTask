define('bitbucket/internal/bbui/filter-bar/components/async-select', ['module', 'exports', 'classnames', 'jquery', 'lodash', 'prop-types', 'react', 'react-dom', 'bitbucket/internal/util/navigator', '../../aui-react/spinner', './filter'], function (module, exports, _classnames, _jquery, _lodash, _propTypes, _react, _reactDom, _navigator, _spinner, _filter) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _spinner2 = babelHelpers.interopRequireDefault(_spinner);

    var _filter2 = babelHelpers.interopRequireDefault(_filter);

    var AsyncSelect = function (_Filter) {
        babelHelpers.inherits(AsyncSelect, _Filter);
        babelHelpers.createClass(AsyncSelect, null, [{
            key: 'propTypes',
            get: function get() {
                return {
                    id: _propTypes2.default.string.isRequired,
                    label: _propTypes2.default.string.isRequired,
                    loading: _propTypes2.default.bool,
                    menu: _propTypes2.default.any,
                    onChange: _propTypes2.default.func,
                    onMoreItemsRequested: _propTypes2.default.func.isRequired,
                    onResetRequested: _propTypes2.default.func.isRequired,
                    onTermChanged: _propTypes2.default.func.isRequired,
                    searchPlaceholder: _propTypes2.default.string,
                    value: _propTypes2.default.string
                };
            }
        }]);

        function AsyncSelect() {
            var _ref;

            babelHelpers.classCallCheck(this, AsyncSelect);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var _this = babelHelpers.possibleConstructorReturn(this, (_ref = AsyncSelect.__proto__ || Object.getPrototypeOf(AsyncSelect)).call.apply(_ref, [this].concat(args)));

            _this._state = {
                pendingItems: [],
                pendingQuery: null,
                term: '',
                searchBoxSpinnerContainer: document.createElement('div'),
                moreResultsEl: null
            };
            return _this;
        }

        babelHelpers.createClass(AsyncSelect, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                var defaults = {
                    minimumInputLength: 0,
                    minimumResultsForSearch: 0,
                    dropdownAutoWidth: true,
                    formatSearching: function formatSearching() {
                        return AJS.I18n.getText('bitbucket.component.filter.bar.searching');
                    },
                    formatNoMatches: function formatNoMatches() {
                        return AJS.I18n.getText('bitbucket.component.filter.bar.nomatches');
                    }
                };
                var overrides = {
                    allowClear: true,
                    containerCssClass: (0, _classnames2.default)('filter-bar-async', this.props.menu.containerCssClass),
                    dropdownCssClass: (0, _classnames2.default)('filter-bar-async', 'filter-bar-dropdown-' + this.props.id, this.props.menu.dropdownCssClass),
                    query: function query(_query) {
                        if (_this2._state.pendingQuery && _query.page === _this2._state.pendingQuery.page && _query.term === _this2._state.pendingQuery.term) {
                            return; // Select2 is being dumb and calling query multiple times.
                        }

                        if (_query.page <= 1 || _this2._state.pendingQuery) {
                            _this2.props.onResetRequested(); // make sure the caller knows to start fresh with sending items.
                        }

                        if (_this2._state.term !== _query.term) {
                            _this2.props.onTermChanged(_query.term);
                        }

                        _this2._setState({
                            pendingQuery: _query,
                            term: _query.term,
                            moreResultsEl: document.getElementsByClassName('select2-more-results')[0]
                        }, function (state) {
                            _this2.props.onMoreItemsRequested(function (newItems) {
                                if (state.pendingQuery !== _query) {
                                    // something else happened in the meantime?
                                    return;
                                }

                                _this2._setState({
                                    pendingItems: state.pendingItems.concat(newItems)
                                });
                            });
                        });
                    },
                    formatLoadMore: function formatLoadMore() {
                        return ' ';
                    }, // blank out the default text because we're replacing it with the spinner
                    formatResult: function formatResult(value, $container) {
                        _reactDom2.default.render(_this2.props.menu.formatResult(value), $container[0]);
                    },
                    formatSelection: function formatSelection(value, $container) {
                        _reactDom2.default.render(_this2.props.menu.formatSelection(value), $container[0]);
                    },
                    ajax: undefined
                };

                var $filter = this.get$Input();
                $filter.auiSelect2(_lodash2.default.assign(defaults, this.props.menu, overrides));
                $filter.on('change', function () {
                    return _this2.props.onChange();
                });
                $filter.on('select2-opening', function (e) {
                    if ($filter.select2('val')) {
                        // if there's a selection, force the clearing of it instead of opening.
                        e.preventDefault();
                        _reactDom2.default.unmountComponentAtNode($filter.select2('container').find('.select2-chosen')[0]);
                        $filter.select2('val', '', true); // clear and trigger change
                    }
                });
                if (this.props.searchPlaceholder && !(0, _navigator.isIE)()) {
                    // IE11 & below will fail - see STASHDEV-10518
                    $filter.one('select2-open', function () {
                        // make sure it's filtered by specific dropdown so this only affects the select2 that $filter belongs to
                        (0, _jquery2.default)('.filter-bar-dropdown-' + _this2.props.id + ' .select2-search > input').attr('placeholder', _this2.props.searchPlaceholder).after(_this2._state.searchBoxSpinnerContainer);
                        if (_this2.props.loading) {
                            _reactDom2.default.render(_react2.default.createElement(_spinner2.default, null), _this2._state.searchBoxSpinnerContainer);
                        }
                    });
                }
            }
        }, {
            key: '_setState',
            value: function _setState() {
                var stateChanges = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var callback = arguments[1];

                var newState = babelHelpers.extends({}, this._state, stateChanges);
                this.reconcileComponent(this.props, newState);
                this._state = newState;
                if (callback) {
                    callback(newState);
                }
            }
        }, {
            key: 'reconcileComponent',
            value: function reconcileComponent(newProps, newState) {
                if (newProps.loading && newState.pendingQuery) {
                    // loading and there's a known query in the works
                    if (newState.pendingQuery.page <= 1 && newState.searchBoxSpinnerContainer.parentNode) {
                        _reactDom2.default.render(_react2.default.createElement(_spinner2.default, null), newState.searchBoxSpinnerContainer);
                    }
                    if (newState.moreResultsEl) {
                        _reactDom2.default.render(_react2.default.createElement(_spinner2.default, null), newState.moreResultsEl);
                    }
                } else if (!newProps.loading && this._state.pendingQuery && newState.pendingQuery) {
                    // loaded pre-existing query
                    if (newState.moreResultsEl) {
                        _reactDom2.default.unmountComponentAtNode(newState.moreResultsEl);
                    }
                    if (newState.searchBoxSpinnerContainer.children.length) {
                        _reactDom2.default.unmountComponentAtNode(newState.searchBoxSpinnerContainer);
                    }

                    var query = newState.pendingQuery; // grab the new one - grabbing the old one could get us into a loop.
                    var results = newState.pendingItems;
                    var more = !newProps.allFetched;

                    this._setState({
                        pendingQuery: null,
                        pendingItems: []
                    }, function () {
                        query.callback({
                            context: query.context,
                            results: results,
                            more: more
                        });
                    });
                }
            }
        }, {
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(newProps) {
                // since we're not using real state, this should only be called
                // when we get new props. So calling it here should be the same as
                // UNSAFE_componentWillReceiveProps()
                this.reconcileComponent(newProps, this._state);

                // Note - we return false so that render never reruns.
                return false;
            }
        }, {
            key: 'get$Input',
            value: function get$Input() {
                return (0, _jquery2.default)(_reactDom2.default.findDOMNode(this)).children('input');
            }
        }, {
            key: 'render',
            value: function render() {
                return _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: this.props.id, className: 'assistive' },
                        this.props.label
                    ),
                    _react2.default.createElement('input', { type: 'hidden', id: this.props.id, value: this.props.value || '' })
                );
            }
        }, {
            key: 'value',
            value: function value() {
                return this.props.value;
            }
        }, {
            key: 'domValue',
            value: function domValue() {
                return this.get$Input().val();
            }
        }, {
            key: 'set',
            value: function set(value) {
                var $filter = this.get$Input();
                _reactDom2.default.unmountComponentAtNode($filter.select2('container').find('.select2-chosen')[0]);
                $filter.select2('val', value);
                return _jquery2.default.Deferred().resolve();
            }
        }]);
        return AsyncSelect;
    }(_filter2.default);

    exports.default = AsyncSelect;
    module.exports = exports['default'];
});