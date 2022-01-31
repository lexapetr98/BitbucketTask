define('bitbucket/internal/bbui/reviewer-avatar-list/reviewer-avatar-list', ['module', 'exports', '@atlassian/aui', 'classnames', 'jquery', 'lodash', 'prop-types', 'react', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/enums', '../aui-react/inline-dialog', '../reviewer-avatar/reviewer-avatar', '../self-reviewer/self-reviewer'], function (module, exports, _aui, _classnames, _jquery, _lodash, _propTypes, _react, _avatar, _enums, _inlineDialog, _reviewerAvatar, _selfReviewer) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _enums2 = babelHelpers.interopRequireDefault(_enums);

    var _inlineDialog2 = babelHelpers.interopRequireDefault(_inlineDialog);

    var _reviewerAvatar2 = babelHelpers.interopRequireDefault(_reviewerAvatar);

    var _selfReviewer2 = babelHelpers.interopRequireDefault(_selfReviewer);

    var _statusMap;

    var propTypes = {
        avatarSize: _propTypes2.default.string,
        currentUserAsReviewer: _propTypes2.default.object,
        currentUserAvatarSize: _propTypes2.default.string,
        dialogReviewersAsTooltip: _propTypes2.default.bool,
        isWatching: _propTypes2.default.bool,
        maxOpen: _propTypes2.default.number,
        menuId: _propTypes2.default.string.isRequired,
        onSelfClick: _propTypes2.default.func,
        permissionToReview: _propTypes2.default.bool.isRequired,
        pullRequestIsOpen: _propTypes2.default.bool.isRequired,
        reverse: _propTypes2.default.bool,
        reviewers: _propTypes2.default.array.isRequired,
        triggerClass: _propTypes2.default.string
    };

    var approvalOrder = {
        APPROVED: 1,
        NEEDS_WORK: 2,
        UNAPPROVED: 3
    };

    var statusMap = (_statusMap = {}, babelHelpers.defineProperty(_statusMap, _enums2.default.ApprovalStatus.APPROVED, _aui.I18n.getText('bitbucket.component.avatar.badge.approved')), babelHelpers.defineProperty(_statusMap, _enums2.default.ApprovalStatus.NEEDS_WORK, _aui.I18n.getText('bitbucket.component.avatar.badge.needs.work')), _statusMap);

    function sortReviewers(reviewers) {
        return reviewers.slice().sort(function (a, b) {
            return approvalOrder[a.status] - approvalOrder[b.status] || a.user.displayName.localeCompare(b.user.displayName);
        });
    }

    /**
     * Displays a list of avatars
     *
     * @param {Object} props - Component properties
     * @param {Array} props.reviewers - The reviewers
     * @param {string} props.menuId - ID for the overflow dialog
     * @param {string?} props.triggerClass - Additional classes for the overflow dialog trigger
     * @param {number?} props.maxOpen - Maximum number of reviewers to show before overflow
     * @param {string?} props.avatarSize - Avatar size to show reviewers at
     * @param {boolean?} props.reverse - Order to show reviewers
     * @returns {ReactElement} - rendered component
     */
    var ReviewerAvatarList = function ReviewerAvatarList(props) {
        var avatarSize = props.avatarSize || _avatar.AvatarTShirtSize.SMALL;
        var sortedReviewers = sortReviewers(props.reviewers);
        var currentUserIndex = props.currentUserAsReviewer ? _lodash2.default.findIndex(sortedReviewers, function (user) {
            return user.user.name === (props.currentUserAsReviewer.name || props.currentUserAsReviewer.user.name);
        }) : -1;

        var showingSelfReviewer = props.permissionToReview && props.pullRequestIsOpen;
        var maxOpen = showingSelfReviewer ? props.maxOpen - 1 : props.maxOpen;
        if (currentUserIndex > -1) {
            // remove current user from ReviewerAvatarList,
            // instead shown in SelfReviewer component
            var currentUser = sortedReviewers.splice(currentUserIndex, 1)[0];

            // put the currentUser in front when
            // SelfReviewer component is hidden
            // or if we want to change the current user's avatar size
            if (!showingSelfReviewer || props.currentUserAvatarSize) {
                sortedReviewers.unshift(currentUser);
            }
        }

        var visibleReviewers = void 0;
        var dialogReviewers = void 0;
        if (sortedReviewers.length > maxOpen) {
            visibleReviewers = sortedReviewers.slice(0, maxOpen - 1);
            dialogReviewers = sortedReviewers.slice(maxOpen - 1);
        } else {
            visibleReviewers = sortedReviewers;
            dialogReviewers = [];
        }

        var visibleAvatars = visibleReviewers.map(function (reviewer) {
            return _react2.default.createElement(_reviewerAvatar2.default, {
                reviewer: reviewer,
                key: reviewer.user.name,
                avatarSize: props.currentUserAsReviewer && props.currentUserAvatarSize && reviewer.user.name === props.currentUserAsReviewer.name ? props.currentUserAvatarSize : avatarSize
            });
        });
        var children = visibleAvatars.slice();

        if (showingSelfReviewer) {
            children.unshift(_react2.default.createElement(_selfReviewer2.default, {
                removeSelfModalId: 'remove-self-modal',
                currentUserAsReviewer: props.currentUserAsReviewer,
                isWatching: props.isWatching,
                key: 'self_reviewer',
                onSelfClick: props.onSelfClick
            }));
        }

        if (dialogReviewers.length) {
            if (props.dialogReviewersAsTooltip) {
                var tooltipString = '';
                dialogReviewers.map(function (reviewer, i, arr) {
                    tooltipString += (0, _aui.escapeHtml)(reviewer.user.displayName);
                    if (reviewer.status !== _enums2.default.ApprovalStatus.UNAPPROVED) {
                        tooltipString += ' (' + statusMap[reviewer.status] + ')';
                    }
                    if (i + 1 < arr.length) {
                        tooltipString += '<br>';
                    }
                });
                children.push(_react2.default.createElement(
                    'button',
                    {
                        className: 'overflow-reviewers-trigger overflow-reviewers-tooltip aui-button aui-button-subtle',
                        key: 'overflow-reviewers-tooltip',
                        title: tooltipString,
                        ref: function ref(el) {
                            return (0, _jquery2.default)(el).tooltip({
                                html: true
                            });
                        }
                    },
                    '+',
                    dialogReviewers.length
                ));
            } else {
                children.push(_react2.default.createElement(
                    _inlineDialog.InlineDialogTrigger,
                    {
                        key: 'trigger',
                        dialogId: props.menuId,
                        className: (0, _classnames2.default)('aui-button-subtle overflow-reviewers-trigger', props.triggerClass)
                    },
                    '+',
                    dialogReviewers.length
                ));
                children.push(_react2.default.createElement(
                    _inlineDialog2.default,
                    {
                        key: 'dialog',
                        id: props.menuId,
                        className: 'overflow-reviewers',
                        alignment: props.reverse ? 'left top' : 'bottom right'
                    },
                    _react2.default.createElement(
                        'div',
                        { className: 'avatar-dropdown' },
                        _react2.default.createElement(
                            'ul',
                            { className: 'aui-list-truncate' },
                            dialogReviewers.map(function (reviewer) {
                                return _react2.default.createElement(
                                    'li',
                                    { key: reviewer.user.name },
                                    _react2.default.createElement(_reviewerAvatar2.default, {
                                        reviewer: reviewer,
                                        tooltip: false,
                                        nameOnly: true,
                                        withName: true
                                    })
                                );
                            })
                        )
                    )
                ));
            }
        }

        return _react2.default.createElement(
            'div',
            {
                className: (0, _classnames2.default)('reviewer-avatar-list', {
                    reviewing: props.currentUserAsReviewer,
                    reversed: props.reverse
                })
            },
            props.reverse ? children.reverse() : children
        );
    };

    ReviewerAvatarList.propTypes = propTypes;
    exports.default = ReviewerAvatarList;
    module.exports = exports['default'];
});