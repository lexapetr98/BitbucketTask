define('bitbucket/internal/page/pull-request/list/pull-request-list-view', ['module', 'exports', 'jquery', 'react', 'bitbucket/internal/bbui/pull-request-list/pull-request-list', 'bitbucket/internal/enums', 'bitbucket/internal/feature/pull-request/list/pull-request-list-analytics', 'bitbucket/internal/impl/data-provider/participants', 'bitbucket/internal/impl/data-provider/pull-request-list', 'bitbucket/internal/impl/data-provider/ref', 'bitbucket/internal/util/events', 'bitbucket/internal/util/shortcuts'], function (module, exports, _jquery, _react, _pullRequestList, _enums, _pullRequestListAnalytics, _participants, _pullRequestList3, _ref2, _events, _shortcuts) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _pullRequestList2 = babelHelpers.interopRequireDefault(_pullRequestList);

    var _enums2 = babelHelpers.interopRequireDefault(_enums);

    var _pullRequestListAnalytics2 = babelHelpers.interopRequireDefault(_pullRequestListAnalytics);

    var _participants2 = babelHelpers.interopRequireDefault(_participants);

    var _pullRequestList4 = babelHelpers.interopRequireDefault(_pullRequestList3);

    var _ref3 = babelHelpers.interopRequireDefault(_ref2);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    var PreloadingParticipantsDataProvider = function (_ParticipantsDataProv) {
        babelHelpers.inherits(PreloadingParticipantsDataProvider, _ParticipantsDataProv);

        function PreloadingParticipantsDataProvider(options) {
            babelHelpers.classCallCheck(this, PreloadingParticipantsDataProvider);

            var _this = babelHelpers.possibleConstructorReturn(this, (PreloadingParticipantsDataProvider.__proto__ || Object.getPrototypeOf(PreloadingParticipantsDataProvider)).apply(this, arguments));

            _this._preloadItems = options.preload || [];
            _this._preloaded = _this._initialPreloadedState = _this._preloadItems.length === 0;
            _this._equalityCheck = options.equals || function (a, b) {
                return a.id === b.id;
            };
            return _this;
        }

        babelHelpers.createClass(PreloadingParticipantsDataProvider, [{
            key: 'reset',
            value: function reset() {
                this._preloaded = this._initialPreloadedState;
                return babelHelpers.get(PreloadingParticipantsDataProvider.prototype.__proto__ || Object.getPrototypeOf(PreloadingParticipantsDataProvider.prototype), 'reset', this).call(this);
            }
        }, {
            key: '_fetchNext',
            value: function _fetchNext(lastResponseData) {
                if (!this._preloaded) {
                    if (this.filter.term) {
                        this._preloaded = true;
                    } else {
                        var promise = _jquery2.default.Deferred();
                        promise.resolve(this._preloadItems);
                        promise.abort = _jquery2.default.noop;
                        return promise;
                    }
                }

                return babelHelpers.get(PreloadingParticipantsDataProvider.prototype.__proto__ || Object.getPrototypeOf(PreloadingParticipantsDataProvider.prototype), '_fetchNext', this).call(this, lastResponseData === this._preloadItems ? null : lastResponseData);
            }
        }, {
            key: '_transform',
            value: function _transform(data) {
                if (!this._preloaded) {
                    this._preloaded = true;
                    return this._preloadItems;
                }

                var equals = this._equalityCheck;
                var preloadItems = this._preloadItems;
                var out = babelHelpers.get(PreloadingParticipantsDataProvider.prototype.__proto__ || Object.getPrototypeOf(PreloadingParticipantsDataProvider.prototype), '_transform', this).call(this, data);
                if (this.filter.term) {
                    return out;
                }
                // if we're not filtering, exclude the preloaded items from the output
                return out.filter(function (item) {
                    return !preloadItems.some(function (preloadItem) {
                        return equals(preloadItem, item);
                    });
                });
            }
        }]);
        return PreloadingParticipantsDataProvider;
    }(_participants2.default);

    var PullRequestListView = function (_Component) {
        babelHelpers.inherits(PullRequestListView, _Component);

        function PullRequestListView(props) {
            babelHelpers.classCallCheck(this, PullRequestListView);

            var _this2 = babelHelpers.possibleConstructorReturn(this, (PullRequestListView.__proto__ || Object.getPrototypeOf(PullRequestListView)).call(this, props));

            _this2.moveFocus = function (inc) {
                return function () {
                    return _this2.setState(function (_ref) {
                        var focusedIndex = _ref.focusedIndex,
                            pullRequests = _ref.pullRequests;
                        return {
                            focusedIndex: Math.max(Math.min(focusedIndex + inc, pullRequests.length - 1), 0)
                        };
                    });
                };
            };

            _this2.openPullRequest = function () {
                _this2._openHandler && _this2._openHandler();
            };

            _this2.onFilterChange = function (filterState) {
                var _this2$state = _this2.state,
                    currentUser = _this2$state.currentUser,
                    filter = _this2$state.filter,
                    onMorePrsRequested = _this2$state.onMorePrsRequested,
                    prProvider = _this2$state.prProvider;
                var onFilterChange = _this2.props.onFilterChange;


                prProvider.setFilter('state', filterState.state);
                prProvider.setFilter('author_id', filterState.author_id);
                prProvider.setFilter('target_ref_id', filterState.target_ref_id);
                prProvider.setFilter('reviewer_id', filterState.reviewer_self && currentUser ? currentUser.name : null);
                prProvider.reset();

                var newFilter = babelHelpers.extends({}, filter, {
                    state: babelHelpers.extends({}, filter.state, {
                        value: filterState.state
                    }),
                    author: babelHelpers.extends({}, filter.author, {
                        value: filterState.author_id
                    }),
                    target_ref: babelHelpers.extends({}, filter.target_ref, {
                        value: filterState.target_ref_id
                    }),
                    reviewer_self: babelHelpers.extends({}, filter.reviewer_self, {
                        value: filterState.reviewer_self
                    })
                });

                _this2.setState({
                    pullRequests: [],
                    filter: newFilter
                }, onMorePrsRequested);

                onFilterChange(filterState);
            };

            _this2.state = _this2.getInitialState(props);
            return _this2;
        }

        babelHelpers.createClass(PullRequestListView, [{
            key: 'getInitialState',
            value: function getInitialState(props) {
                var _this3 = this;

                var currentUser = props.currentUser,
                    initialData = props.initialData,
                    initialFilter = props.initialFilter,
                    repository = props.repository,
                    selectedAuthor = props.selectedAuthor,
                    selectedTargetBranch = props.selectedTargetBranch;

                var authorProvider = new PreloadingParticipantsDataProvider({
                    equals: function equals(a, b) {
                        return a.name === b.name;
                    },
                    filter: { role: _enums2.default.ParticipantRole.AUTHOR },
                    preload: currentUser ? [currentUser] : null,
                    repository: repository
                });

                var branchProvider = new _ref3.default({
                    filter: {
                        repository: repository,
                        term: '',
                        type: 'branch'
                    }
                });

                var getAsyncSelectProps = function getAsyncSelectProps(provider, filterName) {
                    var extendFilter = function extendFilter(props, state) {
                        var oldFilter = state.filter || {};
                        var newFilter = babelHelpers.defineProperty({}, filterName, babelHelpers.extends({}, oldFilter[filterName], props));

                        return {
                            filter: babelHelpers.extends({}, oldFilter, newFilter)
                        };
                    };

                    var getProviderState = function getProviderState() {
                        return {
                            allFetched: provider.reachedEnd,
                            loading: provider.isFetching
                        };
                    };

                    var updateFilterFromProviderState = function updateFilterFromProviderState() {
                        _this3.setState(function (state) {
                            return extendFilter(getProviderState(), state);
                        });
                    };

                    return babelHelpers.extends({
                        onMoreItemsRequested: function onMoreItemsRequested(callback) {
                            if (provider.isFetching) {
                                return;
                            }
                            provider.fetchNext().then(callback).then(updateFilterFromProviderState);
                            updateFilterFromProviderState();
                        },
                        onResetRequested: function onResetRequested() {
                            provider.reset();
                            updateFilterFromProviderState();
                        },
                        onTermChanged: function onTermChanged(term) {
                            provider.setFilter('term', term || '');
                            updateFilterFromProviderState();
                        }
                    }, getProviderState());
                };

                var filter = {
                    author: babelHelpers.extends({}, getAsyncSelectProps(authorProvider, 'author'), {
                        value: selectedAuthor && selectedAuthor.name
                    }),
                    reviewer_self: {
                        value: initialFilter.reviewer_self || false
                    },
                    state: {
                        value: initialFilter.state
                    },
                    target_ref: babelHelpers.extends({}, getAsyncSelectProps(branchProvider, 'target_ref'), {
                        value: selectedTargetBranch && selectedTargetBranch.id
                    })
                };

                var prProvider = new _pullRequestList4.default({
                    filter: {
                        author_id: filter.author.value || null,
                        reviewer_id: filter.reviewer_self.value && currentUser ? currentUser.name : null,
                        state: filter.state.value || _enums2.default.PullRequestState.OPEN,
                        target_ref_id: filter.target_ref.value || null
                    },
                    repository: repository.id
                }, initialData);

                var onMorePrsRequested = function onMorePrsRequested() {
                    if (prProvider.isFetching) {
                        return;
                    }

                    _this3.setState({ loading: true });

                    prProvider.fetchNext().then(function (prs) {
                        _this3.setState(function (state) {
                            return {
                                allFetched: prProvider.reachedEnd,
                                loading: prProvider.isFetching,
                                page: state.page + 1,
                                pullRequests: state.pullRequests.concat(prs)
                            };
                        }, function () {
                            _events2.default.trigger('bitbucket.internal.pull.request.list.updated');
                            _pullRequestListAnalytics2.default.onPaginate({ page: _this3.state.page });
                        });
                    });
                };

                return {
                    page: 0,
                    pullRequests: [],
                    allFetched: prProvider.reachedEnd,
                    authorProvider: authorProvider,
                    branchProvider: branchProvider,
                    currentUser: currentUser,
                    filter: filter,
                    focusedIndex: 0,
                    loading: prProvider.isFetching,
                    onMorePrsRequested: onMorePrsRequested,
                    prProvider: prProvider,
                    repository: repository
                };
            }
        }, {
            key: 'componentDidMount',
            value: function componentDidMount() {
                _shortcuts2.default.bind('requestMoveToNextHandler', this.moveFocus(1));
                _shortcuts2.default.bind('requestMoveToPreviousHandler', this.moveFocus(-1));
                _shortcuts2.default.bind('requestOpenItemHandler', this.openPullRequest);
            }
        }, {
            key: 'render',
            value: function render() {
                var _this4 = this;

                var _state = this.state,
                    allFetched = _state.allFetched,
                    currentUser = _state.currentUser,
                    focusedIndex = _state.focusedIndex,
                    initialFilter = _state.filter,
                    loading = _state.loading,
                    onMorePrsRequested = _state.onMorePrsRequested,
                    pullRequests = _state.pullRequests,
                    repository = _state.repository;
                var _props = this.props,
                    gettingStarted = _props.gettingStarted,
                    selectedAuthor = _props.selectedAuthor,
                    selectedTargetBranch = _props.selectedTargetBranch;


                return _react2.default.createElement(_pullRequestList2.default, {
                    allFetched: allFetched,
                    currentUser: currentUser,
                    focusedIndex: focusedIndex,
                    gettingStarted: gettingStarted,
                    initialFilter: initialFilter,
                    loading: loading,
                    onFilterChange: this.onFilterChange,
                    onMorePrsRequested: onMorePrsRequested,
                    pullRequests: pullRequests,
                    repository: repository,
                    selectedAuthor: selectedAuthor,
                    selectedTargetBranch: selectedTargetBranch,
                    openPullRequestCallback: function openPullRequestCallback(fn) {
                        return _this4._openHandler = fn;
                    }
                });
            }
        }]);
        return PullRequestListView;
    }(_react.Component);

    exports.default = PullRequestListView;
    module.exports = exports['default'];
});