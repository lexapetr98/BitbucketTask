define('bitbucket/internal/feature/repository/search-results/search-results-list', ['module', 'exports', 'prop-types', 'react', 'react-dom', './search-results-item'], function (module, exports, _propTypes, _react, _reactDom, _searchResultsItem) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _searchResultsItem2 = babelHelpers.interopRequireDefault(_searchResultsItem);

    // the offset to which focused elements should be scrolled
    var REPOSITORY_LIST_OFFSET = 20;

    var isNotFirstOrLast = function isNotFirstOrLast(el) {
        return el.previousSibling && el.nextSibling;
    };

    var SearchResultsList = function (_Component) {
        babelHelpers.inherits(SearchResultsList, _Component);

        function SearchResultsList() {
            babelHelpers.classCallCheck(this, SearchResultsList);
            return babelHelpers.possibleConstructorReturn(this, (SearchResultsList.__proto__ || Object.getPrototypeOf(SearchResultsList)).apply(this, arguments));
        }

        babelHelpers.createClass(SearchResultsList, [{
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(nextProps) {
                return nextProps.query !== this.props.query || // the query has changed, so the results will be different
                nextProps.repositories !== this.props.repositories || // the total number of repos has changed (clicked "load more")
                nextProps.focusedIndex !== this.props.focusedIndex // the highlighted row has changed
                ;
            }
        }, {
            key: 'componentDidUpdate',
            value: function componentDidUpdate(prevProps) {
                // don't scroll the focused element into view if the focused index didn't change
                // this avoids unnecessary updates (and scroll jank) for unrelated component updates.
                if (prevProps && this.props.focusedIndex === prevProps.focusedIndex) {
                    return;
                }
                var focusedEl = this.focusedListEl;
                if (focusedEl) {
                    var prevEl = focusedEl.previousSibling;
                    if (isNotFirstOrLast(focusedEl)) {
                        // Try to make the focused element be the second element in the list if possible
                        this.scrollIntoView(prevEl, prevEl);
                    } else {
                        this.scrollIntoView(focusedEl, prevEl);
                    }
                }
            }
        }, {
            key: 'scrollIntoView',
            value: function scrollIntoView(element, prevEl) {
                if (this.repoList) {
                    this.repoList.scrollTop = prevEl ? element.offsetTop - REPOSITORY_LIST_OFFSET : 0;
                }
            }
        }, {
            key: 'renderListWrapper',
            value: function renderListWrapper(repositories, focusedIndex, onItemClick) {
                var _this2 = this;

                return _react2.default.createElement(
                    'ul',
                    { className: 'repository-list search-results-container' },
                    repositories.map(function (repo, index) {
                        return _react2.default.createElement(_searchResultsItem2.default, {
                            focused: focusedIndex === index,
                            key: repo.id,
                            repository: repo,
                            onItemClick: onItemClick,
                            query: _this2.props.query,
                            ref: function ref(el) {
                                focusedIndex === index ? _this2.focusedListEl = _reactDom2.default.findDOMNode(el) : null;
                            }
                        });
                    })
                );
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                var _props = this.props,
                    EmptyState = _props.EmptyState,
                    focusedIndex = _props.focusedIndex,
                    LoadMore = _props.LoadMore,
                    onItemClick = _props.onItemClick,
                    _onScroll = _props.onScroll,
                    repositories = _props.repositories,
                    title = _props.title;

                return _react2.default.createElement(
                    'div',
                    {
                        className: 'repository-list-container',
                        ref: function ref(el) {
                            _this3.repoList = el;
                        },
                        onScroll: function onScroll(e) {
                            return _onScroll(e.target.scrollTop);
                        }
                    },
                    title,
                    repositories && repositories.length > 0 ? this.renderListWrapper(repositories, focusedIndex, onItemClick) : EmptyState,
                    LoadMore
                );
            }
        }]);
        return SearchResultsList;
    }(_react.Component);

    SearchResultsList.propTypes = {
        repositories: _propTypes2.default.array,
        title: _propTypes2.default.node,
        focusedIndex: _propTypes2.default.number,
        onItemClick: _propTypes2.default.func,
        EmptyState: _propTypes2.default.element,
        LoadMore: _propTypes2.default.element,
        query: _propTypes2.default.string
    };
    exports.default = SearchResultsList;
    module.exports = exports['default'];
});