define('bitbucket/internal/feature/dashboard/components/pull-request-table', ['exports', '@atlassian/aui', 'classnames', 'prop-types', 'react', 'bitbucket/internal/bbui/aui-react/spinner', 'bitbucket/internal/bbui/utils/pull-request-unique-id', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/client-storage', 'bitbucket/internal/widget/icons/icons', '../pull-request-type', './pull-request-row', './pull-request-table-web-section'], function (exports, _aui, _classnames, _propTypes, _react, _spinner, _pullRequestUniqueId, _analytics, _clientStorage, _icons, _pullRequestType, _pullRequestRow, _pullRequestTableWebSection) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.PullRequestTable = exports.PullRequestEmptyState = exports.CountTitleDisplay = exports.LoadMoreButton = undefined;

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _spinner2 = babelHelpers.interopRequireDefault(_spinner);

    var _pullRequestUniqueId2 = babelHelpers.interopRequireDefault(_pullRequestUniqueId);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var _pullRequestRow2 = babelHelpers.interopRequireDefault(_pullRequestRow);

    var _EmptyStateMessage;

    var webSections = (0, _pullRequestTableWebSection.getWebSections)();

    var CollapsedCountTooltip = babelHelpers.defineProperty({}, _pullRequestType.CLOSED, _aui2.default.I18n.getText('bitbucket.web.dashboard.pullrequests.closed.tooltip'));

    var EmptyStateMessage = (_EmptyStateMessage = {}, babelHelpers.defineProperty(_EmptyStateMessage, _pullRequestType.REVIEWING, _aui2.default.I18n.getText('bitbucket.web.dashboard.pullrequests.reviewing.empty')), babelHelpers.defineProperty(_EmptyStateMessage, _pullRequestType.CREATED, _aui2.default.I18n.getText('bitbucket.web.dashboard.pullrequests.created.empty')), babelHelpers.defineProperty(_EmptyStateMessage, _pullRequestType.CLOSED, _aui2.default.I18n.getText('bitbucket.web.dashboard.pullrequests.closed.empty')), _EmptyStateMessage);

    var EmptyStateDescription = babelHelpers.defineProperty({}, _pullRequestType.CREATED, _aui2.default.I18n.getText('bitbucket.web.dashboard.pullrequests.created.empty.description'));

    var LoadMoreButton = exports.LoadMoreButton = function LoadMoreButton(_ref) {
        var _onClick = _ref.onClick;
        return _react2.default.createElement(
            'button',
            { className: 'aui-button aui-button-link', type: 'button', onClick: function onClick() {
                    return _onClick();
                } },
            _aui2.default.I18n.getText('bitbucket.web.dashboard.pullrequests.loadmore')
        );
    };

    var CountTitleDisplay = exports.CountTitleDisplay = function CountTitleDisplay(_ref2) {
        var title = _ref2.title,
            collapsedCountTooltip = _ref2.collapsedCountTooltip,
            lozengeDisplayCount = _ref2.lozengeDisplayCount;
        return _react2.default.createElement(
            'span',
            null,
            title,
            _react2.default.createElement(
                'span',
                { className: 'aui-badge', title: collapsedCountTooltip },
                lozengeDisplayCount
            )
        );
    };

    var PullRequestEmptyState = exports.PullRequestEmptyState = function PullRequestEmptyState(_ref3) {
        var message = _ref3.message,
            description = _ref3.description;
        return _react2.default.createElement(
            'div',
            { className: 'pull-request-list-empty-state' },
            _react2.default.createElement(_icons.ApproveIcon, null),
            _react2.default.createElement(
                'p',
                { className: 'pull-request-empty-state-title' },
                message
            ),
            description && _react2.default.createElement(
                'p',
                { className: 'pull-request-empty-state-description' },
                description
            )
        );
    };

    var PullRequestTable = exports.PullRequestTable = function PullRequestTable(_ref4) {
        var pullRequests = _ref4.pullRequests,
            showStateLozenge = _ref4.showStateLozenge,
            _onItemClick = _ref4.onItemClick,
            focusedPullRequest = _ref4.focusedPullRequest,
            focusedPullRequestIndex = _ref4.focusedPullRequestIndex;
        return _react2.default.createElement(
            'table',
            { className: (0, _classnames2.default)('aui table', 'dashboard-pull-requests-table') },
            _react2.default.createElement(
                'thead',
                null,
                _react2.default.createElement(
                    'tr',
                    null,
                    _react2.default.createElement(
                        'th',
                        { className: 'header-summary', scope: 'col', colSpan: '6' },
                        '\xA0'
                    ),
                    _react2.default.createElement(
                        'th',
                        { className: 'reviewers' },
                        _aui2.default.I18n.getText('bitbucket.web.dashboard.pullrequests.heading.reviewers')
                    ),
                    webSections.map(function (section) {
                        return _react2.default.createElement(_pullRequestTableWebSection.WebSectionHeader, { key: section.key, webSection: section });
                    })
                )
            ),
            _react2.default.createElement(
                'tbody',
                null,
                pullRequests.map(function (pullRequest) {
                    return _react2.default.createElement(_pullRequestRow2.default, {
                        key: (0, _pullRequestUniqueId2.default)(pullRequest),
                        focused: (0, _pullRequestUniqueId2.default)(pullRequest) === (0, _pullRequestUniqueId2.default)(focusedPullRequest),
                        focusedPullRequestIndex: focusedPullRequestIndex,
                        pullRequest: pullRequest,
                        onItemClick: function onItemClick(e) {
                            return _onItemClick(e);
                        },
                        webSections: webSections,
                        showStateLozenge: showStateLozenge
                    });
                })
            )
        );
    };

    var PullRequestsTable = function (_Component) {
        babelHelpers.inherits(PullRequestsTable, _Component);

        function PullRequestsTable(props) {
            babelHelpers.classCallCheck(this, PullRequestsTable);

            var _this = babelHelpers.possibleConstructorReturn(this, (PullRequestsTable.__proto__ || Object.getPrototypeOf(PullRequestsTable)).call(this, props));

            // note that `props.type` is expected to be static for the lifetime of the component.
            _this.CLIENT_STORAGE_KEY = _clientStorage2.default.buildKey(['dashboard', 'pull-requests', props.type, 'table', 'collapsed'], 'user');
            _this.state = {
                collapsed: Boolean(props.collapsible) && _clientStorage2.default.getItem(_this.CLIENT_STORAGE_KEY) !== false
            };
            return _this;
        }

        babelHelpers.createClass(PullRequestsTable, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                if (this.props.collapsible) {
                    _analytics2.default.add('dashboard.pullrequest-list.' + this.props.type.toLowerCase() + '.collapsed.initial', {
                        collapsed: this.state.collapsed
                    });
                }
            }
        }, {
            key: 'collapsedDisplay',
            value: function collapsedDisplay(_ref5) {
                var _this2 = this;

                var title = _ref5.title,
                    collapsedCountTooltip = _ref5.collapsedCountTooltip,
                    lozengeDisplayCount = _ref5.lozengeDisplayCount;

                return _react2.default.createElement(
                    'button',
                    {
                        onClick: function onClick(e) {
                            e.preventDefault();
                            _this2.toggleTableCollapsed();
                        },
                        className: 'table-expander',
                        href: '#'
                    },
                    _react2.default.createElement(_icons.ChevronRightIcon, null),
                    title,
                    _react2.default.createElement(
                        'span',
                        { className: 'aui-badge', title: collapsedCountTooltip },
                        lozengeDisplayCount
                    )
                );
            }
        }, {
            key: 'toggleTableCollapsed',
            value: function toggleTableCollapsed() {
                var newCollapsed = !this.state.collapsed;

                this.setState({
                    collapsed: newCollapsed
                });

                _clientStorage2.default.setItem(this.CLIENT_STORAGE_KEY, newCollapsed);
                _analytics2.default.add('dashboard.pullrequest-list.' + this.props.type.toLowerCase() + '.collapsed.toggle', {
                    collapsed: newCollapsed
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var _props = this.props,
                    type = _props.type,
                    title = _props.title,
                    pullRequests = _props.pullRequests,
                    loading = _props.loading,
                    lozengeDisplayCount = _props.lozengeDisplayCount,
                    hasMore = _props.hasMore,
                    onLoadMoreClick = _props.onLoadMoreClick,
                    onItemClick = _props.onItemClick,
                    showStateLozenge = _props.showStateLozenge,
                    collapsible = _props.collapsible,
                    focusedPullRequest = _props.focusedPullRequest,
                    focusedPullRequestIndex = _props.focusedPullRequestIndex;

                var button = hasMore ? _react2.default.createElement(LoadMoreButton, { onClick: function onClick() {
                        return onLoadMoreClick();
                    } }) : null;
                var pullRequestCount = pullRequests.length;
                var displayCollapsible = pullRequestCount ? collapsible : false;
                var collapsedCountTooltip = CollapsedCountTooltip[type];
                var collapsed = displayCollapsible && this.state.collapsed;

                return _react2.default.createElement(
                    'div',
                    {
                        className: (0, _classnames2.default)('dashboard-pull-requests-table-container', 'dashboard-pull-requests-table-' + type.toLowerCase(), {
                            collapsed: collapsed,
                            'dashboard-pull-requests-empty': !pullRequestCount
                        }),
                        'aria-hidden': collapsed
                    },
                    _react2.default.createElement(
                        'h4',
                        null,
                        pullRequestCount && displayCollapsible ? this.collapsedDisplay({
                            title: title,
                            collapsedCountTooltip: collapsedCountTooltip,
                            lozengeDisplayCount: lozengeDisplayCount
                        }) : pullRequestCount ? _react2.default.createElement(CountTitleDisplay, {
                            title: title,
                            collapsedCountTooltip: collapsedCountTooltip,
                            lozengeDisplayCount: lozengeDisplayCount
                        }) : title
                    ),
                    pullRequestCount ? _react2.default.createElement(PullRequestTable, {
                        pullRequests: pullRequests,
                        showStateLozenge: showStateLozenge,
                        onItemClick: onItemClick,
                        focusedPullRequest: focusedPullRequest,
                        focusedPullRequestIndex: focusedPullRequestIndex
                    }) : _react2.default.createElement(PullRequestEmptyState, {
                        message: EmptyStateMessage[type],
                        description: EmptyStateDescription[type]
                    }),
                    _react2.default.createElement(
                        'div',
                        { className: 'more-container' },
                        loading ? _react2.default.createElement(_spinner2.default, null) : button
                    )
                );
            }
        }], [{
            key: 'getDerivedStateFromProps',
            value: function getDerivedStateFromProps(_ref6, prevState) {
                var pullRequests = _ref6.pullRequests,
                    focusedPullRequest = _ref6.focusedPullRequest;

                if (!focusedPullRequest || !prevState.collapsed) {
                    return null;
                }
                var focusedId = (0, _pullRequestUniqueId2.default)(focusedPullRequest);
                if (pullRequests.some(function (pr) {
                    return (0, _pullRequestUniqueId2.default)(pr) === focusedId;
                })) {
                    return { collapsed: false };
                }
                return null;
            }
        }]);
        return PullRequestsTable;
    }(_react.Component);

    PullRequestsTable.propTypes = {
        type: _propTypes2.default.string.isRequired,
        title: _propTypes2.default.string.isRequired,
        pullRequests: _propTypes2.default.array.isRequired,
        lozengeDisplayCount: _propTypes2.default.string.isRequired,
        loading: _propTypes2.default.bool,
        hasMore: _propTypes2.default.bool,
        onLoadMoreClick: _propTypes2.default.func.isRequired,
        onItemClick: _propTypes2.default.func.isRequired,
        showStateLozenge: _propTypes2.default.bool,
        collapsible: _propTypes2.default.bool,
        focusedPullRequest: _propTypes2.default.object,
        focusedPullRequestIndex: _propTypes2.default.number.isRequired
    };
    exports.default = PullRequestsTable;
});