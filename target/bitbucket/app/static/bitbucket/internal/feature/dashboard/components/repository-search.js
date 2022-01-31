define('bitbucket/internal/feature/dashboard/components/repository-search', ['exports', 'lodash', 'prop-types', 'react', 'react-dom', 'react-redux', 'bitbucket/util/events', 'bitbucket/internal/impl/web-fragments', 'bitbucket/internal/util/shortcuts', '../action-creators/load-repositories', '../repository-type'], function (exports, _lodash, _propTypes, _react, _reactDom, _reactRedux, _events, _webFragments, _shortcuts, _loadRepositories, _repositoryType) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.RepositorySearch = undefined;

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _webFragments2 = babelHelpers.interopRequireDefault(_webFragments);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    var SEARCH_LOCATION = 'internal.bitbucket.dashboard.repository.search';

    var RepositorySearch = exports.RepositorySearch = function (_Component) {
        babelHelpers.inherits(RepositorySearch, _Component);

        function RepositorySearch() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, RepositorySearch);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = RepositorySearch.__proto__ || Object.getPrototypeOf(RepositorySearch)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
                // getWebPanels in the SPI version of webFragments (as opposed to WebFragments global) returns the result
                // of calling the view function as .html, but really it's just whatever the "view" in the client-web-panel
                // returns, which in this case is a React component
                Search: (0, _lodash.get)(_webFragments2.default.getWebPanels(SEARCH_LOCATION) || [], '0.html', null)
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(RepositorySearch, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                _shortcuts2.default.bind('dashboardRepositories', function () {
                    return _this2.focusRepositorySearch();
                });
            }
        }, {
            key: 'onSearchStart',
            value: function onSearchStart(query) {
                this.props.onQueryChange(query);
                this.props.dispatch((0, _loadRepositories.loadRepositories)({ repoType: _repositoryType.SEARCH, query: query }));
            }
        }, {
            key: 'onSearchEnd',
            value: function onSearchEnd(query) {
                // TODO ???
            }
        }, {
            key: 'onSearchClear',
            value: function onSearchClear() {
                this.props.onQueryChange('');
                this.props.dispatch((0, _loadRepositories.clearRepositories)({ repoType: _repositoryType.SEARCH }));
            }
        }, {
            key: 'onSearchError',
            value: function onSearchError() {
                this.props.dispatch((0, _loadRepositories.loadRepositoriesFailure)({ repoType: _repositoryType.SEARCH }));
            }
        }, {
            key: 'onSearchResults',
            value: function onSearchResults(query, page, nextSearch) {
                if (page.start === 0) {
                    // analytics for search results loaded
                    _events2.default.trigger('bitbucket.internal.ui.dashboard.repository-list.search.results.loaded', null, {
                        queryLength: query.length
                    });
                }
                this.props.dispatch((0, _loadRepositories.loadRepositoriesSuccess)(page, { repoType: _repositoryType.SEARCH, nextSearch: nextSearch, query: query }));
            }

            /**
             * Call a given callback if the event target is an input (from which we infer that it is the search field input)
             *
             * @param {DOMEvent} event
             * @param {Function} cb - The callback to call if the filter passes
             */

        }, {
            key: 'onSearchFieldEvent',
            value: function onSearchFieldEvent(event, cb) {
                if (event.target.nodeName === 'INPUT') {
                    cb(event);
                }
            }
        }, {
            key: 'focusRepositorySearch',
            value: function focusRepositorySearch() {
                var input = (0, _reactDom.findDOMNode)(this).querySelector('input.search');
                if (input) {
                    input.focus();
                }
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                var Search = this.state.Search;
                var _props = this.props,
                    _onKeyDown = _props.onKeyDown,
                    _onBlur = _props.onBlur,
                    _onFocus = _props.onFocus,
                    pageSize = _props.pageSize;


                return Search ? _react2.default.createElement(
                    'div',
                    { // the wrapper div is to catch any DOM events that bubble up from the Search plugin
                        onKeyDown: function onKeyDown(e) {
                            return _this3.onSearchFieldEvent(e, _onKeyDown);
                        },
                        onBlur: function onBlur(e) {
                            return _this3.onSearchFieldEvent(e, _onBlur);
                        },
                        onFocus: function onFocus(e) {
                            return _this3.onSearchFieldEvent(e, _onFocus);
                        },
                        role: 'presentation'
                    },
                    _react2.default.createElement(Search, {
                        onSearchStart: function onSearchStart(query) {
                            return _this3.onSearchStart(query);
                        },
                        onSearchEnd: function onSearchEnd(query) {
                            return _this3.onSearchEnd(query);
                        },
                        onSearchResults: function onSearchResults(query, page, nextSearch) {
                            return _this3.onSearchResults(query, page, nextSearch);
                        },
                        onSearchError: function onSearchError() {
                            return _this3.onSearchError();
                        },
                        onSearchClear: function onSearchClear() {
                            return _this3.onSearchClear();
                        },
                        pageSize: pageSize
                    })
                ) : null;
            }
        }]);
        return RepositorySearch;
    }(_react.Component);

    RepositorySearch.propTypes = {
        onKeyDown: _propTypes2.default.func,
        onBlur: _propTypes2.default.func,
        onFocus: _propTypes2.default.func,
        onQueryChange: _propTypes2.default.func,
        pageSize: _propTypes2.default.number
    };
    exports.default = (0, _reactRedux.connect)()(RepositorySearch);
});