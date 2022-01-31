define('bitbucket/internal/feature/pull-request/header/pull-request-header-view', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'prop-types', 'react', 'react-redux', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/bbui/pull-request-header/pull-request-header', 'bitbucket/internal/enums', 'bitbucket/internal/feature/pull-request/action-creators/can-merge', 'bitbucket/internal/feature/pull-request/action-creators/change-reviewer-status', 'bitbucket/internal/feature/pull-request/action-creators/change-self-reviewer', 'bitbucket/internal/feature/pull-request/action-creators/watch', 'bitbucket/internal/feature/pull-request/edit/pull-request-edit', 'bitbucket/internal/feature/pull-request/merge-dialog/merge-dialog', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/participant', 'bitbucket/internal/model/pull-request-json', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/events', 'bitbucket/internal/util/set-dialog-buttons-disabled', 'bitbucket/internal/util/shortcuts', 'bitbucket/internal/widget/submit-spinner/submit-spinner'], function (module, exports, _aui, _jquery, _lodash, _propTypes, _react, _reactRedux, _navbuilder, _avatar, _pullRequestHeader, _enums, _canMerge, _changeReviewerStatus, _changeSelfReviewer, _watch, _pullRequestEdit, _mergeDialog, _pageState, _participant, _pullRequestJson, _ajax, _events, _setDialogButtonsDisabled, _shortcuts, _submitSpinner) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pullRequestHeader2 = babelHelpers.interopRequireDefault(_pullRequestHeader);

    var _enums2 = babelHelpers.interopRequireDefault(_enums);

    var _canMerge2 = babelHelpers.interopRequireDefault(_canMerge);

    var _changeReviewerStatus2 = babelHelpers.interopRequireDefault(_changeReviewerStatus);

    var _changeSelfReviewer2 = babelHelpers.interopRequireDefault(_changeSelfReviewer);

    var _watch2 = babelHelpers.interopRequireDefault(_watch);

    var _pullRequestEdit2 = babelHelpers.interopRequireDefault(_pullRequestEdit);

    var _mergeDialog2 = babelHelpers.interopRequireDefault(_mergeDialog);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _participant2 = babelHelpers.interopRequireDefault(_participant);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _setDialogButtonsDisabled2 = babelHelpers.interopRequireDefault(_setDialogButtonsDisabled);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    var _submitSpinner2 = babelHelpers.interopRequireDefault(_submitSpinner);

    var TRIGGERED_BY_KEYBOARD = { triggeredBy: 'keyboardShortcut' };
    var pullRequest = void 0;

    function initKeyboardFlags() {
        var shortcutFlag = void 0;

        function showApprovalUpdateFlag(options) {
            var flagTitle = options.approved ? _aui.I18n.getText('bitbucket.web.pullrequest.toolbar.approved.updateflag') : _aui.I18n.getText('bitbucket.web.pullrequest.toolbar.unapproved.updateflag');
            showUpdateFlag(flagTitle, options);
        }

        function showWatchUpdateFlag(options) {
            var flagTitle = options.watchState ? _aui.I18n.getText('bitbucket.web.watchable.watched.tooltip') : _aui.I18n.getText('bitbucket.web.watchable.unwatched.tooltip');
            showUpdateFlag(flagTitle, options);
        }

        function showUpdateFlag(flagTitle, options) {
            if ((0, _lodash.isMatch)(options, TRIGGERED_BY_KEYBOARD)) {
                if (shortcutFlag) {
                    shortcutFlag.close();
                }

                shortcutFlag = (0, _aui.flag)({
                    type: 'success',
                    title: flagTitle,
                    close: 'auto'
                });
            }
        }

        _events2.default.on('bitbucket.internal.widget.approve-button.added', showApprovalUpdateFlag);
        _events2.default.on('bitbucket.internal.widget.approve-button.removed', showApprovalUpdateFlag);
        _events2.default.on('bitbucket.internal.web.watch-button.added', showWatchUpdateFlag);
        _events2.default.on('bitbucket.internal.web.watch-button.removed', showWatchUpdateFlag);
    }

    function _createDialog(options) {
        var dialog = (0, _aui.dialog2)(options.templates.dialog());

        var xhr = void 0;

        dialog.$el.on('click', '.confirm-button', function (e) {
            var spinner = new _submitSpinner2.default(e.target, 'before');
            (0, _setDialogButtonsDisabled2.default)(dialog, true);
            spinner.show();

            xhr = _ajax2.default.rest(options.ajax);

            xhr.fail(function (xhr, textStatus, errorThrown, resp) {
                if (xhr.status === 400) {
                    var $dialogContent = dialog.$el.find('.aui-dialog2-content');

                    if (resp.errors) {
                        $dialogContent.children('.aui-message').remove();
                        $dialogContent.prepend(options.templates.error(resp.errors));
                    }
                } else {
                    dialog.hide();
                }
            }).always(function () {
                spinner.hide();
                (0, _setDialogButtonsDisabled2.default)(dialog, false);
                xhr = null;
            }).done(function (pullRequest) {
                _events2.default.trigger(options.events.done, null, {
                    user: _pageState2.default.getCurrentUser().toJSON(),
                    pullRequest: pullRequest
                });
                options.callback(pullRequest);
            });
        });

        dialog.$el.find('.cancel-button').on('click', function () {
            if (xhr) {
                xhr.abort();
                xhr = null;
            }
            dialog.hide();
        });

        // Focus cancel, rather than a destructive primary operation
        dialog.$el.on('aui-show', _lodash2.default.debounce(function () {
            return dialog.$el.find('.cancel-button').focus();
        }));

        return dialog;
    }

    /**
     *
     * @param {Object} newPullRequestJSON
     * @param {boolean} dispatch - whether or not to dispatch the new pull request data
     * @param {Object} props - pull-request-header react component props
     */
    function updatePullRequest(newPullRequestJSON, dispatch, props) {
        // pull request properties need to be filtered here as the pull request object could be used by code that will
        // try to create a Brace model.  Without filtering there would be additional props on the object that would fail
        // Brace validation.
        _pageState2.default.getPullRequest().set((0, _pullRequestJson.filter)(newPullRequestJSON));
        if (dispatch === true) {
            props.dispatch({
                type: 'PR_SET_PULL_REQUEST',
                payload: newPullRequestJSON
            });
        }
    }

    var PullRequestHeaderView = function (_Component) {
        babelHelpers.inherits(PullRequestHeaderView, _Component);

        function PullRequestHeaderView(props) {
            babelHelpers.classCallCheck(this, PullRequestHeaderView);

            var _this = babelHelpers.possibleConstructorReturn(this, (PullRequestHeaderView.__proto__ || Object.getPrototypeOf(PullRequestHeaderView)).call(this, props));

            _this.onMoreAction = function (action) {
                switch (action) {
                    case 'edit':
                        _this._pullRequestEdit.show();
                        break;
                    case 'watch':
                        _this.toggleWatch();
                        break;
                    case 'decline':
                        if (!_this.declineDialog) {
                            _this.createDeclineDialog();
                        }
                        _this.declineDialog.show();
                        break;
                    case 'delete':
                        if (!_this.deleteDialog) {
                            _this.createDeleteDialog();
                        }
                        _this.deleteDialog.show();
                        break;
                }
            };

            _this.onReOpenClick = function () {
                var reopenUrl = _navbuilder2.default.rest().currentPullRequest().reopen().withParams({
                    avatarSize: _avatar.AvatarSize.XSMALL,
                    version: _pageState2.default.getPullRequest().getVersion()
                }).build();

                // pass along the promise so sub components can deal with promise outcomes too
                return _ajax2.default.rest({
                    url: reopenUrl,
                    type: 'POST',
                    statusCode: {
                        409: function conflict(xhr, textStatus, errorThrown, errors, dominantError) {
                            return babelHelpers.extends({}, dominantError, {
                                title: _aui.I18n.getText('bitbucket.web.pullrequest.reopened.error.409.title'),
                                fallbackUrl: false,
                                shouldReload: false
                            });
                        }
                    }
                }).done(function (StashPullRequestJSON) {
                    _events2.default.trigger('bitbucket.internal.feature.pullRequest.reopened', null, {
                        user: _pageState2.default.getCurrentUser().toJSON(),
                        pullRequest: StashPullRequestJSON
                    });

                    updatePullRequest(StashPullRequestJSON, true, _this.props);
                    _this.mergeCheck();
                });
            };

            _this.onSelfClick = function (addOrRemoveSelf, unwatch) {
                _this.props.dispatch((0, _changeSelfReviewer2.default)(_this.props.pullRequest, _this.props.currentUser, addOrRemoveSelf, _this.props.currentUserAsReviewer && _this.props.currentUserAsReviewer.status));

                if (addOrRemoveSelf === 'ADD_SELF') {
                    _this.props.dispatch((0, _watch2.default)({
                        stateOnly: true,
                        watchState: true
                    }));
                }

                if (unwatch) {
                    _this.props.dispatch((0, _watch2.default)({ watchState: false }));
                }
            };

            _this.onStatusClick = function (options) {
                var _this$props = _this.props,
                    dispatch = _this$props.dispatch,
                    user = _this$props.currentUser,
                    currentUserAsReviewer = _this$props.currentUserAsReviewer,
                    pullRequest = _this$props.pullRequest;


                if (!currentUserAsReviewer) {
                    console.warn('Current user is not a reviewer');
                } else {
                    dispatch((0, _changeReviewerStatus2.default)((0, _lodash.merge)({
                        pullRequest: pullRequest,
                        user: user,
                        oldStatus: currentUserAsReviewer.status
                    }, options)));
                }
            };

            _this.onMergeHelpDialogClose = function () {
                _this.setState({ showMergeHelpDialog: false });
            };

            _this.getConditions = function () {
                var _this$props2 = _this.props,
                    canDelete = _this$props2.canDelete,
                    currentUser = _this$props2.currentUser,
                    hasRepoWrite = _this$props2.hasRepoWrite,
                    hasSourceRepoRead = _this$props2.hasSourceRepoRead,
                    hasSourceRepoWrite = _this$props2.hasSourceRepoWrite,
                    pullRequest = _this$props2.pullRequest;

                var isAuthor = pullRequest.author.user.name === currentUser.name;
                var canUpdateSourceBranch = hasSourceRepoWrite;
                var canReadSourceRepo = hasSourceRepoRead;
                var canWrite = hasRepoWrite;
                var canEdit = canWrite || isAuthor;

                return {
                    canMerge: canWrite,
                    canDecline: canEdit,
                    canDelete: canDelete,
                    canEdit: canEdit,
                    canReOpen: canEdit && canReadSourceRepo,
                    canUpdateSourceBranch: canUpdateSourceBranch
                };
            };

            _this.toggleWatch = function (options) {
                var _this$props3 = _this.props,
                    dispatch = _this$props3.dispatch,
                    pullRequest = _this$props3.pullRequest;


                dispatch((0, _watch2.default)((0, _lodash.merge)({}, { watchState: !pullRequest.isWatching }, options)));
            };

            _this.mergeCheck = function () {
                var _this$props4 = _this.props,
                    dispatch = _this$props4.dispatch,
                    pullRequest = _this$props4.pullRequest;


                if (pullRequest.state === _enums2.default.PullRequestState.OPEN) {
                    dispatch((0, _canMerge2.default)(pullRequest, _this.props.mergeTimeout));
                }
            };

            _this.initMergeEvents = function () {
                _events2.default.on('bitbucket.internal.feature.pull-request.merge-check', _this.mergeCheck);

                // Since there are so many reviewer-based merge checks it seems sensible to only check it once here when
                // a reviewer changes their status, rather than doing it for each plugin that requires it.
                ['bitbucket.internal.feature.pullRequest.reviewerStatus.changed', 'bitbucket.internal.feature.pullRequest.self.added', 'bitbucket.internal.feature.pullRequest.self.removed'].forEach(function (event) {
                    return _events2.default.on(event, _this.mergeCheck);
                });

                _events2.default.on('bitbucket.internal.branch.plugin.conflict.merge.help', function (mergeHelp) {
                    return _this.setState({ mergeHelp: mergeHelp });
                });

                // an internal component wants to show the merge help - lets pass that along to the PR header
                _events2.default.on('bitbucket.internal.pull-request.show.cant.merge.help', function () {
                    return _this.setState({ showMergeHelpDialog: true });
                });
            };

            _this.createDeclineDialog = function () {
                _this.declineDialog = _createDialog({
                    buttonSelector: '.decline-pull-request',
                    ajax: {
                        url: _navbuilder2.default.rest().currentPullRequest().decline().withParams({
                            avatarSize: _avatar.AvatarSize.XSMALL,
                            version: _pageState2.default.getPullRequest().getVersion()
                        }).build(),
                        type: 'POST',
                        statusCode: {
                            401: function _(xhr, textStatus, errorThrown, errors, dominantError) {
                                return babelHelpers.extends({}, dominantError, {
                                    title: _aui.I18n.getText('bitbucket.web.pullrequest.decline.error.401.title'),
                                    message: _aui.I18n.getText('bitbucket.web.pullrequest.decline.error.401.message'),
                                    fallbackUrl: false,
                                    shouldReload: true
                                });
                            }
                        }
                    },
                    callback: function callback(StashPullRequestJSON) {
                        updatePullRequest(StashPullRequestJSON, true, _this.props);
                        _this.declineDialog.hide();
                    },
                    templates: {
                        dialog: function dialog() {
                            return bitbucket.internal.feature.pullRequest.decline.dialog({
                                content: '<p class="decline-message">\n                        ' + _aui.I18n.getText('bitbucket.web.pullrequest.decline.dialog.message') + '\n                    </p>'
                            });
                        },
                        error: function error(errors) {
                            return bitbucket.internal.feature.pullRequest.decline.errors({
                                errors: errors
                            });
                        }
                    },
                    events: {
                        done: 'bitbucket.internal.feature.pullRequest.declined'
                    }
                });
            };

            _this.createDeleteDialog = function () {
                _this.deleteDialog = _createDialog({
                    buttonSelector: '.delete-pull-request',
                    ajax: {
                        url: _navbuilder2.default.rest().currentPullRequest().build(),
                        type: 'DELETE',
                        data: {
                            version: _pageState2.default.getPullRequest().getVersion()
                        },
                        statusCode: {
                            400: false,
                            401: function _(xhr, textStatus, errorThrown, errors, dominantError) {
                                return babelHelpers.extends({}, dominantError, {
                                    title: _aui.I18n.getText('bitbucket.web.pullrequest.delete.error.401.title'),
                                    message: _aui.I18n.getText('bitbucket.web.pullrequest.delete.error.401.message'),
                                    fallbackUrl: false,
                                    shouldReload: true
                                });
                            }
                        }
                    },
                    callback: function callback() {
                        _this.deleteDialog.hide();
                        window.location = _navbuilder2.default.currentRepo().allPullRequests().build();
                    },
                    templates: {
                        dialog: function dialog() {
                            return bitbucket.internal.feature.pullRequest.delete.dialog({
                                content: '<p class="delete-message">\n                        ' + _aui.I18n.getText('bitbucket.web.pullrequest.delete.dialog.message') + '\n                    </p>'
                            });
                        },
                        error: function error(errors) {
                            return bitbucket.internal.feature.pullRequest.delete.errors({
                                errors: errors
                            });
                        }
                    },
                    events: {
                        done: 'bitbucket.internal.feature.pullRequest.deleted'
                    }
                });
            };

            _this.state = {};
            return _this;
        }

        babelHelpers.createClass(PullRequestHeaderView, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                var pullRequest = _pageState2.default.getPullRequest();
                // TODO destroy / re-init if Pull Request changes
                // use the pageState pullRequest for legacy PullRequestEdit, it expects a Brace model
                this._pullRequestEdit = new _pullRequestEdit2.default(pullRequest);

                _shortcuts2.default.bind('pullRequestApprove', function () {
                    var currentUserStatus = _this2.props.currentUserAsReviewer && _this2.props.currentUserAsReviewer.status;
                    var newStatus = currentUserStatus === _enums2.default.ApprovalStatus.APPROVED ? _enums2.default.ApprovalStatus.UNAPPROVED : _enums2.default.ApprovalStatus.APPROVED;
                    _this2.onStatusClick((0, _lodash.merge)({ newStatus: newStatus }, TRIGGERED_BY_KEYBOARD));
                });

                _shortcuts2.default.bind('pullRequestEdit', function () {
                    if (pullRequest.getState() !== _enums2.default.PullRequestState.MERGED) {
                        _this2._pullRequestEdit.show();
                    }
                });

                (0, _jquery2.default)(document).on('click', '.add-description', function () {
                    _this2._pullRequestEdit.show();
                });

                _shortcuts2.default.bind('pullRequestWatch', function () {
                    _this2.toggleWatch(TRIGGERED_BY_KEYBOARD);
                });

                _events2.default.once('bitbucket.internal.feature.comments.commentAdded', function () {
                    // When a user comments check if they were already a participant
                    // if they weren't then they should be set to watch the PR
                    var currentUser = _pageState2.default.getCurrentUser();
                    var participantsJSON = pullRequest.getParticipants().toJSON();
                    var allParticipants = [pullRequest.getAuthor().toJSON()].concat(pullRequest.getReviewers().toJSON()).concat(participantsJSON);
                    var isParticipant = allParticipants.some(function (model) {
                        return model.user.name === currentUser.id;
                    });

                    if (!isParticipant) {
                        pullRequest.setParticipants(participantsJSON.concat([new _participant2.default({ user: currentUser })]));
                        _this2.toggleWatch({ watchState: true });
                    }
                });

                this.mergeCheck();
                _mergeDialog2.default.initMergeDialog({
                    callback: function callback(StashPullRequestJSON) {
                        return updatePullRequest(StashPullRequestJSON, true, _this2.props);
                    },
                    mergeTimeout: this.props.mergeTimeout
                });
                this.initMergeEvents();

                initKeyboardFlags();
            }
        }, {
            key: 'render',
            value: function render() {
                var props = {
                    pullRequest: this.props.pullRequest,
                    conditions: this.getConditions(),
                    currentUser: this.props.currentUser,
                    currentUserAsReviewer: this.props.currentUserAsReviewer,
                    currentUserIsWatching: this.props.pullRequest.isWatching,
                    mergeHelp: this.state.mergeHelp,
                    onMoreAction: this.onMoreAction,
                    currentUserStatus: this.props.currentUserAsReviewer && this.props.currentUserAsReviewer.status,
                    onMergeClick: _mergeDialog2.default.onMergeClick,
                    onReOpenClick: this.onReOpenClick,
                    onSelfClick: this.onSelfClick,
                    onStatusClick: this.onStatusClick,
                    permissionToReview: this.props.currentUser.name !== this.props.pullRequest.author.user.name,
                    showMergeHelpDialog: this.state.showMergeHelpDialog,
                    onMergeHelpDialogClose: this.onMergeHelpDialogClose
                };
                return _react2.default.createElement(_pullRequestHeader2.default, props);
            }
        }]);
        return PullRequestHeaderView;
    }(_react.Component);

    PullRequestHeaderView.propTypes = {
        canDelete: _propTypes2.default.bool.isRequired,
        hasRepoWrite: _propTypes2.default.bool.isRequired,
        hasSourceRepoWrite: _propTypes2.default.bool.isRequired,
        hasSourceRepoRead: _propTypes2.default.bool.isRequired,
        mergeTimeout: _propTypes2.default.number.isRequired
    };


    function mapStateToProps(state) {
        var currentUser = state.currentUser,
            pullRequest = state.pullRequest;

        var currentUserAsReviewer = function currentUserAsReviewer() {
            return (0, _lodash.find)(pullRequest.reviewers, function (reviewer) {
                return reviewer.user.name === currentUser.name;
            });
        };

        return {
            pullRequest: pullRequest,
            currentUser: currentUser,
            currentUserAsReviewer: currentUserAsReviewer()
        };
    }

    exports.default = (0, _reactRedux.connect)(mapStateToProps)(PullRequestHeaderView);
    module.exports = exports['default'];
});