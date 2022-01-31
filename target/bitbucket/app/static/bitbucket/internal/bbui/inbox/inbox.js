define('bitbucket/internal/bbui/inbox/inbox', ['exports', '@atlassian/aui', 'jquery', 'lodash', 'prop-types', 'react', 'bitbucket/internal/enums', '../aui-react/spinner', '../paged-table/paged-table', '../pull-request-table/components/author-avatar', '../pull-request-table/components/comments', '../pull-request-table/components/pull-request-row', '../pull-request-table/components/reviewers', '../pull-request-table/components/tasks', '../pull-request-table/components/web-section', '../utils/pull-request-unique-id', './components/summary'], function (exports, _aui, _jquery, _lodash, _propTypes, _react, _enums, _spinner, _pagedTable, _authorAvatar, _comments, _pullRequestRow, _reviewers, _tasks, _webSection, _pullRequestUniqueId, _summary) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.DEFAULT_PAGE_SIZE = undefined;

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _enums2 = babelHelpers.interopRequireDefault(_enums);

    var _spinner2 = babelHelpers.interopRequireDefault(_spinner);

    var _pagedTable2 = babelHelpers.interopRequireDefault(_pagedTable);

    var _authorAvatar2 = babelHelpers.interopRequireDefault(_authorAvatar);

    var _comments2 = babelHelpers.interopRequireDefault(_comments);

    var _pullRequestRow2 = babelHelpers.interopRequireDefault(_pullRequestRow);

    var _reviewers2 = babelHelpers.interopRequireDefault(_reviewers);

    var _tasks2 = babelHelpers.interopRequireDefault(_tasks);

    var _pullRequestUniqueId2 = babelHelpers.interopRequireDefault(_pullRequestUniqueId);

    var _summary2 = babelHelpers.interopRequireDefault(_summary);

    var DEFAULT_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = 10;

    var beforeSections = (0, _webSection.getBeforeSections)();

    var Inbox = function (_Component) {
        babelHelpers.inherits(Inbox, _Component);

        function Inbox() {
            babelHelpers.classCallCheck(this, Inbox);
            return babelHelpers.possibleConstructorReturn(this, (Inbox.__proto__ || Object.getPrototypeOf(Inbox)).apply(this, arguments));
        }

        babelHelpers.createClass(Inbox, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                (0, _jquery2.default)(document).on('click', '.inbox-table-wrapper .tabs-menu a', this.changeTabs);

                this.props.created.onMoreItemsRequested();
                this.props.reviewing.onMoreItemsRequested();
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                (0, _jquery2.default)(document).off('click', '.inbox-table-wrapper .tabs-menu a', this.changeTabs);
            }
        }, {
            key: 'changeTabs',
            value: function changeTabs(event) {
                _aui2.default.tabs.change((0, _jquery2.default)(event.currentTarget), event);
                event.preventDefault();
            }
        }, {
            key: 'isPrReviewed',
            value: function isPrReviewed(reviewers, currentUser) {
                return _lodash2.default.some(reviewers, function (reviewer) {
                    return reviewer.user.name === currentUser.name && reviewer.status === _enums2.default.ApprovalStatus.NEEDS_WORK;
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                var props = this.props;
                var emptyInbox = _react2.default.createElement(
                    'div',
                    { className: 'empty-inbox-message' },
                    _react2.default.createElement(
                        'span',
                        { className: 'aui-icon aui-icon-large aui-iconfont-tray-empty' },
                        _aui2.default.I18n.getText('bitbucket.component.inbox.empty.description')
                    ),
                    _react2.default.createElement(
                        'h3',
                        null,
                        _aui2.default.I18n.getText('bitbucket.component.inbox.empty.title')
                    )
                );

                var reviewingContent = props.reviewing.pullRequests.length || props.reviewing.loading ? _react2.default.createElement(_pagedTable2.default, babelHelpers.extends({}, props.reviewing, {
                    className: 'pull-requests-table',
                    allFetchedMessage: _aui2.default.I18n.getText('bitbucket.pull.request.all.fetched'),
                    items: props.reviewing.pullRequests,
                    onMoreItemsRequested: props.reviewing.onMoreItemsRequested,
                    scrollElement: '.inbox-table-wrapper',
                    pageSize: props.pageSize,
                    row: function row(_ref) {
                        var item = _ref.item,
                            focused = _ref.focused;

                        var pullRequest = item;
                        return _react2.default.createElement(
                            _pullRequestRow2.default,
                            {
                                key: (0, _pullRequestUniqueId2.default)(pullRequest),
                                focused: focused,
                                prNeedsWork: _this2.isPrReviewed(pullRequest.reviewers, props.currentUser)
                            },
                            _react2.default.createElement(_authorAvatar2.default, { author: pullRequest.author }),
                            _react2.default.createElement(_summary2.default, { pullRequest: pullRequest }),
                            beforeSections.map(function (section) {
                                return _react2.default.createElement(_webSection.WebSectionCell, {
                                    key: section.key + '::before',
                                    where: 'before',
                                    webSection: section,
                                    pullRequest: pullRequest
                                });
                            }),
                            _react2.default.createElement(_reviewers2.default, {
                                currentUser: props.currentUser,
                                currentUserAvatarSize: 'medium',
                                dialogReviewersAsTooltip: true,
                                pullRequest: pullRequest
                            }),
                            _react2.default.createElement(_comments2.default, { pullRequest: pullRequest }),
                            _react2.default.createElement(_tasks2.default, { pullRequest: pullRequest })
                        );
                    }
                })) : emptyInbox;

                var createdContent = props.created.pullRequests.length || props.created.loading ? _react2.default.createElement(_pagedTable2.default, babelHelpers.extends({}, props.created, {
                    className: 'pull-requests-table',
                    allFetchedMessage: _aui2.default.I18n.getText('bitbucket.pull.request.all.fetched'),
                    items: props.created.pullRequests,
                    onMoreItemsRequested: props.created.onMoreItemsRequested,
                    scrollElement: '.inbox-table-wrapper',
                    pageSize: props.pageSize,
                    row: function row(_ref2) {
                        var item = _ref2.item,
                            focused = _ref2.focused;

                        var pullRequest = item;
                        return _react2.default.createElement(
                            _pullRequestRow2.default,
                            { key: (0, _pullRequestUniqueId2.default)(pullRequest), focused: focused },
                            _react2.default.createElement(_summary2.default, { pullRequest: pullRequest }),
                            beforeSections.map(function (section) {
                                return _react2.default.createElement(_webSection.WebSectionCell, {
                                    key: section.key + '::before',
                                    where: 'before',
                                    webSection: section,
                                    pullRequest: pullRequest
                                });
                            }),
                            _react2.default.createElement(_reviewers2.default, { pullRequest: pullRequest, dialogReviewersAsTooltip: true }),
                            _react2.default.createElement(_comments2.default, { pullRequest: pullRequest }),
                            _react2.default.createElement(_tasks2.default, { pullRequest: pullRequest })
                        );
                    }
                })) : emptyInbox;

                var dialogContent = !props.reviewing.pullRequests.length && !props.created.pullRequests.length && (props.reviewing.loading || props.created.loading) ? _react2.default.createElement(
                    'div',
                    { className: 'inbox-spinner-padding' },
                    _react2.default.createElement(_spinner2.default, null)
                ) : _react2.default.createElement(
                    'div',
                    { id: 'inbox-wapper' },
                    _react2.default.createElement(
                        'h2',
                        null,
                        _aui2.default.I18n.getText('bitbucket.component.inbox.title')
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'inbox-table-wrapper aui-tabs horizontal-tabs' },
                        _react2.default.createElement(
                            'ul',
                            { className: 'tabs-menu' },
                            _react2.default.createElement(
                                'li',
                                { className: 'active-tab inbox-reviewer-tab menu-item' },
                                _react2.default.createElement(
                                    'a',
                                    { href: '#inbox-pull-request-reviewer' },
                                    _aui2.default.I18n.getText('bitbucket.component.inbox.reviewing')
                                )
                            ),
                            _react2.default.createElement(
                                'li',
                                { className: 'inbox-created-tab menu-item' },
                                _react2.default.createElement(
                                    'a',
                                    { href: '#inbox-pull-request-created' },
                                    _aui2.default.I18n.getText('bitbucket.component.inbox.created')
                                )
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { id: 'inbox-pull-request-reviewer', className: 'tabs-pane active-pane' },
                            reviewingContent
                        ),
                        _react2.default.createElement(
                            'div',
                            { id: 'inbox-pull-request-created', className: 'tabs-pane' },
                            createdContent
                        )
                    )
                );

                return dialogContent;
            }
        }]);
        return Inbox;
    }(_react.Component);

    Inbox.propTypes = {
        created: _propTypes2.default.shape({
            allFetched: _propTypes2.default.bool.isRequired,
            loading: _propTypes2.default.bool.isRequired,
            onMoreItemsRequested: _propTypes2.default.func.isRequired,
            pullRequests: _propTypes2.default.array.isRequired
        }).isRequired,
        currentUser: _propTypes2.default.object.isRequired,
        pageSize: _propTypes2.default.number,
        reviewing: _propTypes2.default.shape({
            allFetched: _propTypes2.default.bool.isRequired,
            loading: _propTypes2.default.bool.isRequired,
            onMoreItemsRequested: _propTypes2.default.func.isRequired,
            pullRequests: _propTypes2.default.array.isRequired
        }).isRequired
    };
    Inbox.defaultProps = {
        pageSize: DEFAULT_PAGE_SIZE
    };
    exports.default = Inbox;
});