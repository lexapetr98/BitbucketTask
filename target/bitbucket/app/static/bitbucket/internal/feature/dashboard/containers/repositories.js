define('bitbucket/internal/feature/dashboard/containers/repositories', ['exports', '@atlassian/aui', 'classnames', 'lodash', 'react', 'react-redux', 'redux', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/internal/util/error-boundary', 'bitbucket/internal/util/i18n-html', 'bitbucket/internal/util/text', '../action-creators/repository-list-navigation', '../components/repository-list', '../components/repository-search', '../repository-type', '../selectors/repositories'], function (exports, _aui, _classnames, _lodash, _react, _reactRedux, _redux, _events, _navbuilder, _errorBoundary, _i18nHtml, _text, _repositoryListNavigation, _repositoryList, _repositorySearch, _repositoryType, _repositories) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Repositories = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _errorBoundary2 = babelHelpers.interopRequireDefault(_errorBoundary);

    var _i18nHtml2 = babelHelpers.interopRequireDefault(_i18nHtml);

    var _repositoryListNavigation2 = babelHelpers.interopRequireDefault(_repositoryListNavigation);

    var _repositoryList2 = babelHelpers.interopRequireDefault(_repositoryList);

    var _repositorySearch2 = babelHelpers.interopRequireDefault(_repositorySearch);

    // cap the amount of repos shown at this number
    var MAX_REPO_COUNT = 999;
    var REPOSITORY_SEARCH_PAGE_SIZE = 25;

    /**
     * Get the 1-based next page we'll request based on the current paging meta information.
     * @param {number} nextStart
     * @param {number} start
     * @returns {number}
     */
    function getNextPageFromInfo(_ref) {
        var nextStart = _ref.nextStart,
            start = _ref.start;

        var pageSize = nextStart - start;
        return nextStart / pageSize + 1; // for analytics this is 1-based
    }

    var SearchReposEmptyState = function SearchReposEmptyState() {
        return _react2.default.createElement(
            'div',
            { className: 'dashboard-search-repo-empty' },
            _react2.default.createElement(
                'p',
                null,
                _aui.I18n.getText('bitbucket.web.dashboard.repositories.search.empty')
            )
        );
    };

    var RecentReposEmptyState = function RecentReposEmptyState() {
        return _react2.default.createElement(
            'div',
            { className: 'dashboard-recent-repo-empty' },
            _react2.default.createElement(
                'p',
                null,
                _aui.I18n.getText('bitbucket.web.dashboard.repositories.recent.empty.message')
            ),
            _react2.default.createElement('p', {
                className: 'empty-action',
                dangerouslySetInnerHTML: {
                    __html: _aui.I18n.getText('bitbucket.web.dashboard.repositories.recent.empty.action.html', _navbuilder2.default.allProjects().build())
                }
            })
        );
    };

    var SearchErrorState = function SearchErrorState() {
        return _react2.default.createElement(
            'div',
            { className: 'dashboard-search-repo-error' },
            _react2.default.createElement('div', { className: 'warning-icon' }),
            _react2.default.createElement(
                'div',
                { className: 'error-text' },
                _react2.default.createElement(
                    'div',
                    { className: 'error-text-primary' },
                    _aui.I18n.getText('bitbucket.web.dashboard.repositories.search.error')
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'error-text-secondary' },
                    _aui.I18n.getText('bitbucket.web.dashboard.repositories.search.error.message')
                )
            )
        );
    };

    var Repositories = exports.Repositories = function (_Component) {
        babelHelpers.inherits(Repositories, _Component);

        function Repositories() {
            var _ref2;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, Repositories);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref2 = Repositories.__proto__ || Object.getPrototypeOf(Repositories)).call.apply(_ref2, [this].concat(args))), _this), _this.state = {}, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(Repositories, [{
            key: 'onMoreClick',
            value: function onMoreClick() {
                var paging = this.props.paging;

                _events2.default.trigger('bitbucket.internal.ui.nav.pagination', null, {
                    context: 'dashboard-repository-list',
                    page: getNextPageFromInfo(paging)
                });
                if (paging.loadMore) {
                    paging.loadMore();
                }
            }
        }, {
            key: 'onRepositoryListItemClick',
            value: function onRepositoryListItemClick(e) {
                var _e$target$dataset = e.target.dataset,
                    entity = _e$target$dataset.entity,
                    repositoryId = _e$target$dataset.repositoryId,
                    projectId = _e$target$dataset.projectId;
                var activeRepositoryType = this.props.activeRepositoryType;

                // assume repository entity by default

                var eventName = 'bitbucket.internal.ui.dashboard.repository-list.repository.clicked';
                if (entity === 'project') {
                    eventName = 'bitbucket.internal.ui.dashboard.repository-list.project.clicked';
                }
                _events2.default.trigger(eventName, null, {
                    source: 'link',
                    activeRepositoryType: activeRepositoryType,
                    repositoryId: repositoryId,
                    projectId: projectId
                });
            }
        }, {
            key: 'onSearchFieldKeyDown',
            value: function onSearchFieldKeyDown(event) {
                var keyCode = event.keyCode;
                var _props = this.props,
                    repositories = _props.repositories,
                    focusedIndex = _props.focusedIndex,
                    activeRepositoryType = _props.activeRepositoryType;


                if (keyCode === _aui.keyCode.ENTER) {
                    event.preventDefault();
                    event.nativeEvent.stopImmediatePropagation();
                    var repo = repositories[focusedIndex];
                    _events2.default.trigger('bitbucket.internal.ui.dashboard.repository-list.repository.clicked', null, {
                        source: 'keyboard-shortcut',
                        activeRepositoryType: activeRepositoryType
                    });
                    this._navigateToURL(_navbuilder2.default.project(repo.project).repo(repo).build());
                } else if (keyCode === _aui.keyCode.ESCAPE) {
                    event.preventDefault();
                    event.target.blur();
                } else {
                    this.props.repositoryNavigation({ event: event });
                }
            }
        }, {
            key: 'onSearchFieldFocus',
            value: function onSearchFieldFocus(event) {
                this.props.repositoryNavigation({ event: event });
            }
        }, {
            key: 'onSearchFieldBlur',
            value: function onSearchFieldBlur(event) {
                this.props.repositoryNavigation({ event: event });
            }
        }, {
            key: 'onQueryChange',
            value: function onQueryChange(query) {
                this.setState({
                    query: query
                });
            }
        }, {
            key: 'onScroll',
            value: function onScroll(scrollTop) {
                this.setState({
                    scrolled: scrollTop > 0
                });
            }
        }, {
            key: '_navigateToURL',
            value: function _navigateToURL(url) {
                // separate method to facilitate testing.
                window.location.href = url;
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                var _props2 = this.props,
                    activeRepositoryType = _props2.activeRepositoryType,
                    focusedIndex = _props2.focusedIndex,
                    hasError = _props2.hasError,
                    isLoading = _props2.isLoading,
                    paging = _props2.paging,
                    repositories = _props2.repositories;
                var _state = this.state,
                    query = _state.query,
                    scrolled = _state.scrolled;


                var EmptyState = void 0;
                if (hasError) {
                    EmptyState = _react2.default.createElement(SearchErrorState, null);
                } else {
                    EmptyState = activeRepositoryType === _repositoryType.RECENT ? _react2.default.createElement(RecentReposEmptyState, null) : _react2.default.createElement(SearchReposEmptyState, null);
                }

                var title = void 0;
                switch (activeRepositoryType) {
                    case _repositoryType.RECENT:
                        title = _react2.default.createElement(
                            'h4',
                            { className: 'title' },
                            _aui.I18n.getText('bitbucket.web.dashboard.repositories.list.recent.title')
                        );
                        break;
                    case _repositoryType.SEARCH:
                        title = repositories ? _react2.default.createElement(
                            _i18nHtml2.default,
                            {
                                tag: 'h4',
                                className: 'results',
                                params: [(0, _text.capInt)(paging.count, MAX_REPO_COUNT)]
                            },
                            _aui.I18n.getText('bitbucket.web.dashboard.repositories.list.search.title.html')
                        ) : null;
                        break;
                }

                return _react2.default.createElement(
                    'div',
                    {
                        id: 'dashboard-repositories',
                        className: (0, _classnames2.default)('dashboard-repositories', { scrolled: scrolled })
                    },
                    _react2.default.createElement(
                        'h3',
                        null,
                        _aui.I18n.getText('bitbucket.web.dashboard.repositories.title')
                    ),
                    _react2.default.createElement(_repositorySearch2.default, {
                        onKeyDown: function onKeyDown(e) {
                            return _this2.onSearchFieldKeyDown(e);
                        },
                        onBlur: function onBlur(e) {
                            return _this2.onSearchFieldBlur(e);
                        },
                        onFocus: function onFocus(e) {
                            return _this2.onSearchFieldFocus(e);
                        },
                        onQueryChange: function onQueryChange(newQuery) {
                            return _this2.onQueryChange(newQuery);
                        },
                        pageSize: REPOSITORY_SEARCH_PAGE_SIZE
                    }),
                    _react2.default.createElement(
                        _errorBoundary2.default,
                        {
                            renderFallback: function renderFallback(error, children) {
                                return !_this2.state.query ? children : _react2.default.createElement(SearchErrorState, null);
                            }
                        },
                        _react2.default.createElement(_repositoryList2.default, {
                            repositories: repositories,
                            title: title,
                            showMore: activeRepositoryType !== _repositoryType.RECENT && !paging.isLastPage && !isLoading,
                            nextPageSize: Math.min(paging.count - (0, _lodash.get)(repositories, 'length', 0), REPOSITORY_SEARCH_PAGE_SIZE),
                            onMoreClick: function onMoreClick() {
                                return _this2.onMoreClick();
                            },
                            focusedIndex: focusedIndex,
                            onItemClick: function onItemClick(e) {
                                return _this2.onRepositoryListItemClick(e);
                            },
                            EmptyState: EmptyState,
                            query: query,
                            onScroll: function onScroll(scrollTop) {
                                return _this2.onScroll(scrollTop);
                            }
                        })
                    )
                );
            }
        }]);
        return Repositories;
    }(_react.Component);

    Repositories.defaultProps = {
        paging: {
            isLastPage: true
        }
    };


    function mapDispatchToProps(dispatch) {
        return (0, _redux.bindActionCreators)({ repositoryNavigation: _repositoryListNavigation2.default }, dispatch);
    }

    function mapStateToProps(state) {
        return {
            activeRepositoryType: state.ui.repositories.activeType,
            hasError: state.ui.repositories.hasError,
            focusedIndex: state.ui.repositories.focusedIndex,
            isLoading: state.ui.repositories.loading,
            paging: (0, _repositories.repositoriesPagingSelector)(state),
            repositories: (0, _repositories.repositoriesSelector)(state)
        };
    }

    exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Repositories);
});