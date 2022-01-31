define('bitbucket/internal/bbui/pull-request-header/pull-request-header', ['module', 'exports', '@atlassian/aui', 'classnames', 'jquery', 'lodash', 'prop-types', 'react', 'bitbucket/internal/enums', '../aui-react/avatar', '../branch-from-to/branch-from-to', '../reviewer-avatar-list/reviewer-avatar-list', '../reviewer-status/reviewer-status', './components/merge', './components/pull-request-more', './components/reopen-button', './pull-request-title-enricher'], function (module, exports, _aui, _classnames, _jquery, _lodash, _propTypes, _react, _enums, _avatar, _branchFromTo, _reviewerAvatarList, _reviewerStatus, _merge, _pullRequestMore, _reopenButton, _pullRequestTitleEnricher) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _branchFromTo2 = babelHelpers.interopRequireDefault(_branchFromTo);

    var _reviewerAvatarList2 = babelHelpers.interopRequireDefault(_reviewerAvatarList);

    var _reviewerStatus2 = babelHelpers.interopRequireDefault(_reviewerStatus);

    var _merge2 = babelHelpers.interopRequireDefault(_merge);

    var _pullRequestMore2 = babelHelpers.interopRequireDefault(_pullRequestMore);

    var _reopenButton2 = babelHelpers.interopRequireDefault(_reopenButton);

    var _pullRequestTitleEnricher2 = babelHelpers.interopRequireDefault(_pullRequestTitleEnricher);

    var propTypes = {
        conditions: _propTypes2.default.objectOf(_propTypes2.default.bool),
        mergeHelp: _propTypes2.default.object,
        currentUserAsReviewer: _propTypes2.default.object,
        currentUserIsWatching: _propTypes2.default.bool,
        currentUserStatus: _propTypes2.default.oneOf(_lodash2.default.values(_enums.ApprovalStatus)),
        onMergeClick: _propTypes2.default.func.isRequired,
        onReOpenClick: _propTypes2.default.func.isRequired,
        onMergeHelpDialogClose: _propTypes2.default.func,
        onMoreAction: _propTypes2.default.func.isRequired,
        onSelfClick: _propTypes2.default.func.isRequired,
        onStatusClick: _propTypes2.default.func.isRequired,
        pullRequest: _propTypes2.default.object.isRequired,
        permissionToReview: _propTypes2.default.bool.isRequired,
        showMergeHelpDialog: _propTypes2.default.bool
    };

    var REVIEWERS_MAX_OPEN = 4;

    var PullRequestHeader = function (_Component) {
        babelHelpers.inherits(PullRequestHeader, _Component);

        function PullRequestHeader(props) {
            babelHelpers.classCallCheck(this, PullRequestHeader);

            var _this = babelHelpers.possibleConstructorReturn(this, (PullRequestHeader.__proto__ || Object.getPrototypeOf(PullRequestHeader)).call(this, props));

            _this.state = {
                prTitle: {
                    __html: _aui2.default.escapeHtml(_this.props.pullRequest.title)
                }
            };
            return _this;
        }

        babelHelpers.createClass(PullRequestHeader, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                // string-replacer plugins must register themselves before document.ready
                // without this there is a chance the string is processed before all plugins are registered
                (0, _jquery2.default)(document).ready(function () {
                    return _this2.enrichPullRequestTitle(_this2.props.pullRequest.title);
                });
            }
        }, {
            key: 'componentDidUpdate',
            value: function componentDidUpdate(prevProps) {
                if (prevProps.pullRequest.title !== this.props.pullRequest.title) {
                    this.enrichPullRequestTitle(this.props.pullRequest.title);
                }
            }
        }, {
            key: 'pullRequestStateReadable',
            value: function pullRequestStateReadable(state) {
                var _stateToReadable;

                var stateToReadable = (_stateToReadable = {}, babelHelpers.defineProperty(_stateToReadable, _enums.PullRequestState.OPEN, _aui2.default.I18n.getText('bitbucket.component.pull.request.list.state.open')), babelHelpers.defineProperty(_stateToReadable, _enums.PullRequestState.DECLINED, _aui2.default.I18n.getText('bitbucket.component.pull.request.list.state.declined')), babelHelpers.defineProperty(_stateToReadable, _enums.PullRequestState.MERGED, _aui2.default.I18n.getText('bitbucket.component.pull.request.list.state.merged')), _stateToReadable);
                return stateToReadable.hasOwnProperty(state) ? stateToReadable[state] : '';
            }
        }, {
            key: 'enrichPullRequestTitle',
            value: function enrichPullRequestTitle(title) {
                var _this3 = this;

                _pullRequestTitleEnricher2.default.process(title, {}, _aui2.default.escapeHtml).then(function (replacements) {
                    _this3.setState({
                        prTitle: {
                            __html: replacements
                        }
                    });
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var pullRequest = this.props.pullRequest;

                var pullRequestIsOpen = pullRequest.state === _enums.PullRequestState.OPEN;
                var reOpenButton = void 0;
                var reviewerStatus = void 0;

                if (pullRequest.state === _enums.PullRequestState.DECLINED && this.props.conditions.canReOpen) {
                    reOpenButton = _react2.default.createElement(_reopenButton2.default, { onReOpenClick: this.props.onReOpenClick });
                }

                if (pullRequestIsOpen) {
                    reviewerStatus = _react2.default.createElement(_reviewerStatus2.default, {
                        currentUserAsReviewer: this.props.currentUserAsReviewer,
                        onStatusClick: this.props.onStatusClick,
                        status: this.props.currentUserStatus
                    });
                }

                return _react2.default.createElement(
                    'div',
                    { className: 'pull-request-header' },
                    _react2.default.createElement(
                        'div',
                        { className: 'flexible' },
                        _react2.default.createElement(
                            'div',
                            { className: 'pull-request-metadata' },
                            _react2.default.createElement(_avatar.UserAvatar, {
                                className: 'author',
                                person: pullRequest.author,
                                withName: true,
                                withLink: true
                            }),
                            _react2.default.createElement(_branchFromTo2.default, { fromRef: pullRequest.fromRef, toRef: pullRequest.toRef }),
                            _react2.default.createElement('div', { className: 'divider' }),
                            _react2.default.createElement(
                                'div',
                                {
                                    className: (0, _classnames2.default)('status', 'aui-lozenge', {
                                        'aui-lozenge-current': pullRequest.state === _enums.PullRequestState.OPEN,
                                        'aui-lozenge-error': pullRequest.state === _enums.PullRequestState.DECLINED,
                                        'aui-lozenge-success': pullRequest.state === _enums.PullRequestState.MERGED
                                    })
                                },
                                this.pullRequestStateReadable(pullRequest.state)
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            {
                                className: (0, _classnames2.default)('pull-request-actions', {
                                    pullRequestIsOpen: pullRequestIsOpen
                                })
                            },
                            _react2.default.createElement(_reviewerAvatarList2.default, {
                                reviewers: pullRequest.reviewers,
                                menuId: 'overflow-reviewers',
                                triggerClass: 'overflow-reviewers-trigger',
                                maxOpen: REVIEWERS_MAX_OPEN,
                                avatarSize: 'small',
                                reverse: true,
                                onSelfClick: this.props.onSelfClick,
                                currentUserAsReviewer: this.props.currentUserAsReviewer,
                                isWatching: this.props.currentUserIsWatching,
                                permissionToReview: this.props.permissionToReview,
                                pullRequestIsOpen: pullRequestIsOpen
                            }),
                            reviewerStatus,
                            _react2.default.createElement(_merge2.default, {
                                conditions: this.props.conditions,
                                mergeHelp: this.props.mergeHelp,
                                onMergeClick: this.props.onMergeClick,
                                onMergeHelpDialogClose: this.props.onMergeHelpDialogClose,
                                pullRequest: pullRequest,
                                showMergeHelpDialog: this.props.showMergeHelpDialog
                            }),
                            reOpenButton,
                            _react2.default.createElement(_pullRequestMore2.default, {
                                onMoreAction: this.props.onMoreAction,
                                isWatching: this.props.currentUserIsWatching,
                                conditions: this.props.conditions,
                                pullRequest: pullRequest
                            })
                        )
                    ),
                    _react2.default.createElement('h2', { dangerouslySetInnerHTML: this.state.prTitle })
                );
            }
        }]);
        return PullRequestHeader;
    }(_react.Component);

    PullRequestHeader.propTypes = propTypes;

    exports.default = PullRequestHeader;
    module.exports = exports['default'];
});