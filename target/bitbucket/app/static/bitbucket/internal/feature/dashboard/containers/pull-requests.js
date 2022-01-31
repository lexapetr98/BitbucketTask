define('bitbucket/internal/feature/dashboard/containers/pull-requests', ['exports', '@atlassian/aui', 'lodash', 'react', 'react-redux', 'redux', 'bitbucket/util/events', 'bitbucket/util/scheduler', 'bitbucket/internal/util/property', 'bitbucket/internal/util/shortcuts', '../action-creators/load-pull-requests', '../action-creators/more-pull-requests', '../components/pull-request-table', '../more-items-type', '../pull-request-type', '../selectors/pull-requests'], function (exports, _aui, _lodash, _react, _reactRedux, _redux, _events, _scheduler, _property, _shortcuts, _loadPullRequests, _morePullRequests, _pullRequestTable, _moreItemsType, _pullRequestType, _pullRequests) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.PullRequests = undefined;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _scheduler2 = babelHelpers.interopRequireDefault(_scheduler);

    var _property2 = babelHelpers.interopRequireDefault(_property);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    var _loadPullRequests2 = babelHelpers.interopRequireDefault(_loadPullRequests);

    var _morePullRequests2 = babelHelpers.interopRequireDefault(_morePullRequests);

    var _pullRequestTable2 = babelHelpers.interopRequireDefault(_pullRequestTable);

    var _moreItemsType2 = babelHelpers.interopRequireDefault(_moreItemsType);

    var UNCAPPED_MAX = 99;
    var pollIntervalPromise = _property2.default.getFromProvider('dashboard.poll.pull-requests.interval');

    var PullRequests = exports.PullRequests = function (_Component) {
        babelHelpers.inherits(PullRequests, _Component);

        function PullRequests(props) {
            babelHelpers.classCallCheck(this, PullRequests);

            var _this = babelHelpers.possibleConstructorReturn(this, (PullRequests.__proto__ || Object.getPrototypeOf(PullRequests)).call(this, props));

            _this.state = {
                focusedPullRequestIndex: 0
            };
            return _this;
        }

        babelHelpers.createClass(PullRequests, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                _shortcuts2.default.bind('requestMoveToNextHandler', this.moveFocus(1));
                _shortcuts2.default.bind('requestMoveToPreviousHandler', this.moveFocus(-1));
                _shortcuts2.default.bind('requestOpenItemHandler', this.openItem);

                document.addEventListener('keydown', function (event) {
                    if (!event.target.getAttribute('type') && event.keyCode === _aui.keyCode.ENTER) {
                        event.preventDefault();
                        document.querySelector('tr.focused .title a').click();
                    }
                });

                pollIntervalPromise.done(function (pollInterval) {
                    if (pollInterval < 1) {
                        // If the interval is configured with a 0 or negative value, don't enable polling
                        return;
                    }
                    _this2.schedule = new _scheduler2.default({
                        backoff: {
                            onBlur: true,
                            onInactive: true
                        },
                        maxInterval: 10 * _scheduler.MINUTE, // keep the maxInterval value in sync with the max value mentioned in application-internal.properties
                        interval: pollInterval,
                        job: function job() {
                            return _this2.props.updatePullRequestsByTypes(_this2.props.pullRequestCountsByType);
                        }
                    });
                    _this2.schedule.start();
                });
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                if (this.schedule) {
                    this.schedule.stop();
                }
            }
        }, {
            key: 'onMorePullRequests',
            value: function onMorePullRequests(type) {
                var hasMoreType = this.props[type].hasMore;
                var page = void 0;
                switch (hasMoreType) {
                    case _moreItemsType2.default.LOCAL:
                        this.props.morePullRequests(type);
                        page = 1; // the local page is the first page
                        break;
                    case _moreItemsType2.default.REMOTE:
                        this.props.loadPullRequests(type, _loadPullRequests.MAX_PAGE_SIZE);
                        page = 2; // we only ask for one more page
                        break;
                    default:
                        console.warn('onMorePullRequests(' + type + ') called when hasMoreType is ' + hasMoreType);
                }

                _events2.default.trigger('bitbucket.internal.ui.nav.pagination', null, {
                    context: 'dashboard-pull-request-list',
                    page: page
                });
            }
        }, {
            key: 'onItemClick',
            value: function onItemClick(e, listType) {
                var _e$target$dataset = e.target.dataset,
                    pullRequestId = _e$target$dataset.pullRequestId,
                    repositoryId = _e$target$dataset.repositoryId,
                    projectId = _e$target$dataset.projectId;

                _events2.default.trigger('bitbucket.internal.ui.dashboard.pullrequest-list.' + listType.toLowerCase() + '.item.clicked', null, {
                    pullRequestId: pullRequestId,
                    repositoryId: repositoryId,
                    projectId: projectId
                });
            }
        }, {
            key: 'getDisplayableNumber',
            value: function getDisplayableNumber(_ref) {
                var limit = _ref.limit,
                    locallyLoadedCount = _ref.locallyLoadedCount,
                    isLastRemotePage = _ref.isLastRemotePage;

                limit = Math.min(limit, UNCAPPED_MAX);
                if (locallyLoadedCount > limit || locallyLoadedCount === limit && !isLastRemotePage) {
                    return limit + '+';
                }

                return '' + locallyLoadedCount;
            }
        }, {
            key: 'moveFocus',
            value: function moveFocus(inc) {
                var _this3 = this;

                return function () {
                    _this3.setState({
                        focusedPullRequestIndex: Math.max(Math.min(_this3.state.focusedPullRequestIndex + inc, _this3.props.allPullRequests.length - 1), 0)
                    });
                };
            }
        }, {
            key: 'pullRequestsTable',
            value: function pullRequestsTable(type, title) {
                var _this4 = this;

                var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
                    _ref2$showMore = _ref2.showMore,
                    showMore = _ref2$showMore === undefined ? true : _ref2$showMore,
                    _ref2$showStateLozeng = _ref2.showStateLozenge,
                    showStateLozenge = _ref2$showStateLozeng === undefined ? false : _ref2$showStateLozeng,
                    _ref2$collapsible = _ref2.collapsible,
                    collapsible = _ref2$collapsible === undefined ? false : _ref2$collapsible,
                    focusedPullRequest = _ref2.focusedPullRequest;

                var typeProps = this.props[type];
                return _react2.default.createElement(_pullRequestTable2.default, {
                    type: type,
                    title: title,
                    pullRequests: typeProps.pullRequests,
                    focusedPullRequest: focusedPullRequest,
                    focusedPullRequestIndex: this.state.focusedPullRequestIndex,
                    loading: typeProps.loading,
                    lozengeDisplayCount: this.getDisplayableNumber(typeProps),
                    hasMore: showMore && typeProps.hasMore !== _moreItemsType2.default.NONE,
                    onLoadMoreClick: function onLoadMoreClick() {
                        return _this4.onMorePullRequests(type);
                    },
                    onItemClick: function onItemClick(e) {
                        return _this4.onItemClick(e, type);
                    },
                    showStateLozenge: showStateLozenge,
                    collapsible: collapsible
                });
            }
        }, {
            key: 'pullRequestTableList',
            value: function pullRequestTableList() {
                var _this5 = this;

                var firstPopulatedTableType = (0, _lodash.find)([_pullRequestType.REVIEWING, _pullRequestType.CREATED, _pullRequestType.CLOSED], function (type) {
                    return _this5.props[type].pullRequests.length;
                });
                var focusedPullRequest = this.props.allPullRequests[this.state.focusedPullRequestIndex];
                return _react2.default.createElement(
                    'div',
                    { className: 'dashboard-pull-requests-table' },
                    this.pullRequestsTable(_pullRequestType.REVIEWING, _aui.I18n.getText('bitbucket.web.dashboard.pullrequests.title.reviewing'), { focusedPullRequest: focusedPullRequest }),
                    this.pullRequestsTable(_pullRequestType.CREATED, _aui.I18n.getText('bitbucket.web.dashboard.pullrequests.title.created'), { focusedPullRequest: focusedPullRequest }),
                    this.pullRequestsTable(_pullRequestType.CLOSED, _aui.I18n.getText('bitbucket.web.dashboard.pullrequests.title.closed'), {
                        showMore: false,
                        showStateLozenge: true,
                        collapsible: true,
                        focusedPullRequest: focusedPullRequest
                    })
                );
            }
        }, {
            key: 'pullRequestTableEmptyState',
            value: function pullRequestTableEmptyState() {
                return _react2.default.createElement(
                    'div',
                    { className: 'dashboard-pull-requests-all-empty' },
                    _react2.default.createElement(
                        'h3',
                        null,
                        _aui.I18n.getText('bitbucket.web.dashboard.pullrequests.empty.heading')
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        _aui.I18n.getText('bitbucket.web.dashboard.pullrequests.empty.description')
                    )
                );
            }
        }, {
            key: 'render',
            value: function render() {
                var _this6 = this;

                return _react2.default.createElement(
                    'div',
                    { className: 'dashboard-pull-requests' },
                    [_pullRequestType.REVIEWING, _pullRequestType.CREATED, _pullRequestType.CLOSED].reduce(function (count, type) {
                        return count + _this6.props[type].pullRequests.length;
                    }, 0) ? this.pullRequestTableList() : this.pullRequestTableEmptyState()
                );
            }
        }]);
        return PullRequests;
    }(_react.Component);

    function mapDispatchToProps(dispatch) {
        return (0, _redux.bindActionCreators)({
            loadPullRequests: _loadPullRequests2.default,
            morePullRequests: _morePullRequests2.default,
            updatePullRequestsByTypes: _loadPullRequests.updatePullRequestsByTypes
        }, dispatch);
    }

    function makeMapStateToProps() {
        var selectorForType = function selectorForType(type) {
            return function (state) {
                return {
                    pullRequests: (0, _pullRequests.getPullRequestsForType)(type)(state),
                    hasMore: (0, _pullRequests.hasMorePullRequestsForType)(type)(state),
                    locallyLoadedCount: (0, _pullRequests.countLocallyLoadedRequests)(type)(state),
                    loading: (0, _lodash.get)(state, ['ui', 'pullRequests', type, 'loading']),
                    isLastRemotePage: (0, _lodash.get)(state, ['paging', 'pullRequests', type, 'lastPageMeta', 'isLastPage'], false),
                    limit: (0, _lodash.get)(state, ['paging', 'pullRequests', type, 'lastPageMeta', 'limit'], _loadPullRequests.DEFAULT_PAGE_SIZE)
                };
            };
        };

        var reviewingSelector = selectorForType(_pullRequestType.REVIEWING);
        var createdSelector = selectorForType(_pullRequestType.CREATED);
        var closedSelector = selectorForType(_pullRequestType.CLOSED);
        var allSelector = (0, _pullRequests.getPullRequestsForTypes)([_pullRequestType.REVIEWING, _pullRequestType.CREATED, _pullRequestType.CLOSED]);

        return function (state) {
            var _ref3;

            return _ref3 = {}, babelHelpers.defineProperty(_ref3, _pullRequestType.REVIEWING, reviewingSelector(state)), babelHelpers.defineProperty(_ref3, _pullRequestType.CREATED, createdSelector(state)), babelHelpers.defineProperty(_ref3, _pullRequestType.CLOSED, closedSelector(state)), babelHelpers.defineProperty(_ref3, 'allPullRequests', allSelector(state)), babelHelpers.defineProperty(_ref3, 'pullRequestCountsByType', (0, _pullRequests.getPullRequestCountsForTypes)([_pullRequestType.REVIEWING, _pullRequestType.CREATED, _pullRequestType.CLOSED])(state)), _ref3;
        };
    }

    exports.default = (0, _reactRedux.connect)(makeMapStateToProps, mapDispatchToProps)(PullRequests);
});