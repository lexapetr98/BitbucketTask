define('bitbucket/internal/feature/dashboard/components/pull-request-row', ['module', 'exports', '@atlassian/aui', 'classnames', 'lodash', 'prop-types', 'react', 'react-dom', 'bitbucket/util/navbuilder', 'bitbucket/util/state', 'bitbucket/internal/bbui/pull-request-table/components/author-avatar', 'bitbucket/internal/bbui/pull-request-table/components/conflict', 'bitbucket/internal/bbui/pull-request-table/components/reviewers', 'bitbucket/internal/bbui/ref-label/ref-label', 'bitbucket/internal/enums', 'bitbucket/internal/feature/pull-request/state-lozenge', 'bitbucket/internal/util/text', 'bitbucket/internal/widget/icons/icons', './pull-request-table-web-section'], function (module, exports, _aui, _classnames, _lodash, _propTypes, _react, _reactDom, _navbuilder, _state, _authorAvatar, _conflict, _reviewers, _refLabel, _enums, _stateLozenge, _text, _icons, _pullRequestTableWebSection) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _authorAvatar2 = babelHelpers.interopRequireDefault(_authorAvatar);

    var _conflict2 = babelHelpers.interopRequireDefault(_conflict);

    var _reviewers2 = babelHelpers.interopRequireDefault(_reviewers);

    var _refLabel2 = babelHelpers.interopRequireDefault(_refLabel);

    var _stateLozenge2 = babelHelpers.interopRequireDefault(_stateLozenge);

    var MAX_REVIEWERS_SHOWN = window.innerWidth < 1360 ? 3 : 4; // This needs to be kept in sync with dashboard.less
    var UNCAPPED_MAX = 99;

    var CountIcon = function CountIcon(_ref) {
        var count = _ref.count,
            Icon = _ref.icon,
            title = _ref.title,
            label = _ref.label;

        if (!count) {
            return null;
        }
        return _react2.default.createElement(
            'span',
            { title: title, className: 'activity-count' },
            _react2.default.createElement(
                Icon,
                null,
                label
            ),
            _react2.default.createElement(
                'span',
                null,
                ' '
            ),
            _react2.default.createElement(
                'span',
                { className: 'count' },
                (0, _text.capInt)(count, UNCAPPED_MAX)
            )
        );
    };

    var NewCommitsIndicator = function NewCommitsIndicator(_ref2) {
        var currentUser = _ref2.currentUser,
            pullRequest = _ref2.pullRequest;
        var fromRef = pullRequest.fromRef,
            reviewers = pullRequest.reviewers,
            state = pullRequest.state;

        var selfAsReviewer = (0, _lodash.find)(reviewers, function (_ref3) {
            var user = _ref3.user;
            return currentUser.name === user.name;
        });

        if (state !== _enums.PullRequestState.OPEN || !selfAsReviewer || selfAsReviewer.lastReviewedCommit === fromRef.latestCommit) {
            return null;
        }

        return _react2.default.createElement(
            _icons.CommitsIcon,
            { title: _aui.I18n.getText('bitbucket.web.dashboard.pullrequests.newcommits.title') },
            _aui.I18n.getText('bitbucket.web.dashboard.pullrequests.newcommits')
        );
    };

    var PullRequestRow = function (_Component) {
        babelHelpers.inherits(PullRequestRow, _Component);

        function PullRequestRow() {
            babelHelpers.classCallCheck(this, PullRequestRow);
            return babelHelpers.possibleConstructorReturn(this, (PullRequestRow.__proto__ || Object.getPrototypeOf(PullRequestRow)).apply(this, arguments));
        }

        babelHelpers.createClass(PullRequestRow, [{
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(nextProps) {
                return nextProps.focused !== this.props.focused || this.props.pullRequest !== nextProps.pullRequest;
            }
        }, {
            key: 'componentDidUpdate',
            value: function componentDidUpdate(prevProps) {
                var currentSelected = (0, _reactDom.findDOMNode)(this).querySelector('.title a');
                currentSelected.blur();
                if (this.props.focused && prevProps.focusedPullRequestIndex !== this.props.focusedPullRequestIndex) {
                    // Because the focusedPullRequestIndex is based on the list of ALL PRs (not by section) the focused
                    // PR can change between renders if more PRs are added the list "above" the previously focused PR.
                    // This means we have to check if the focusedIndex changed (user explicitly changed focus) vs. the
                    // focused PR changing (the data might have updated underneath).
                    currentSelected.focus();
                }
            }
        }, {
            key: 'render',
            value: function render() {
                var _props = this.props,
                    pullRequest = _props.pullRequest,
                    onItemClick = _props.onItemClick,
                    webSections = _props.webSections,
                    showStateLozenge = _props.showStateLozenge,
                    focused = _props.focused;
                var author = pullRequest.author,
                    toRef = pullRequest.toRef,
                    _pullRequest$properti = pullRequest.properties,
                    _pullRequest$properti2 = _pullRequest$properti.commentCount,
                    commentCount = _pullRequest$properti2 === undefined ? 0 : _pullRequest$properti2,
                    _pullRequest$properti3 = _pullRequest$properti.openTaskCount,
                    taskCount = _pullRequest$properti3 === undefined ? 0 : _pullRequest$properti3;
                var repository = toRef.repository,
                    project = toRef.repository.project;


                var currentUser = (0, _state.getCurrentUser)();

                return _react2.default.createElement(
                    'tr',
                    { className: (0, _classnames2.default)({ focused: focused }) },
                    _react2.default.createElement(_authorAvatar2.default, { author: pullRequest.author }),
                    _react2.default.createElement(
                        'td',
                        { className: 'summary' },
                        _react2.default.createElement(
                            'div',
                            { className: 'title' },
                            showStateLozenge ? _react2.default.createElement(_stateLozenge2.default, { pullRequest: pullRequest }) : null,
                            _react2.default.createElement(
                                'a',
                                {
                                    href: _navbuilder2.default.project(project).repo(repository).pullRequest(pullRequest).build(),
                                    onClick: function onClick(e) {
                                        return onItemClick(e);
                                    },
                                    'data-pull-request-id': pullRequest.id,
                                    'data-repository-id': repository.id,
                                    'data-project-id': project.id
                                },
                                pullRequest.title
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'meta' },
                            _react2.default.createElement(
                                'span',
                                { title: author.user.displayName, className: 'author' },
                                author.user.displayName
                            ),
                            _react2.default.createElement(
                                'span',
                                { className: 'pull-request-id' },
                                '#',
                                pullRequest.id
                            ),
                            _react2.default.createElement(
                                'span',
                                {
                                    title: project.name + ' / ' + repository.name,
                                    className: 'project-and-repository'
                                },
                                _react2.default.createElement(
                                    'span',
                                    { className: 'project-name' },
                                    project.name
                                ),
                                _react2.default.createElement(
                                    'span',
                                    { className: 'separator' },
                                    ' / '
                                ),
                                _react2.default.createElement(
                                    'span',
                                    { className: 'name' },
                                    repository.name
                                )
                            ),
                            _react2.default.createElement(_refLabel2.default, { scmRef: pullRequest.toRef })
                        )
                    ),
                    _react2.default.createElement(_conflict2.default, { pullRequest: pullRequest }),
                    _react2.default.createElement(
                        'td',
                        { className: 'activity new-commits' },
                        _react2.default.createElement(NewCommitsIndicator, { currentUser: currentUser, pullRequest: pullRequest })
                    ),
                    _react2.default.createElement(
                        'td',
                        { className: 'activity' },
                        _react2.default.createElement(CountIcon, {
                            count: commentCount,
                            icon: _icons.CommentIcon,
                            title: _aui.I18n.getText('bitbucket.web.comment.count', commentCount),
                            label: _aui.I18n.getText('bitbucket.web.comment.label')
                        })
                    ),
                    _react2.default.createElement(
                        'td',
                        { className: 'activity' },
                        _react2.default.createElement(CountIcon, {
                            count: taskCount,
                            icon: _icons.TaskIcon,
                            title: _aui.I18n.getText('bitbucket.web.tasks.openTaskCount', taskCount),
                            label: _aui.I18n.getText('bitbucket.web.tasks.openTask.label')
                        })
                    ),
                    _react2.default.createElement(_reviewers2.default, {
                        pullRequest: pullRequest,
                        currentUser: (0, _state.getCurrentUser)(),
                        maxOpen: MAX_REVIEWERS_SHOWN
                    }),
                    webSections.map(function (section) {
                        return _react2.default.createElement(_pullRequestTableWebSection.WebSectionCell, {
                            key: section.key,
                            webSection: section,
                            pullRequest: pullRequest
                        });
                    })
                );
            }
        }]);
        return PullRequestRow;
    }(_react.Component);

    PullRequestRow.propTypes = {
        pullRequest: _propTypes2.default.object.isRequired,
        onItemClick: _propTypes2.default.func.isRequired,
        focusedPullRequestIndex: _propTypes2.default.number.isRequired
    };
    exports.default = PullRequestRow;
    module.exports = exports['default'];
});