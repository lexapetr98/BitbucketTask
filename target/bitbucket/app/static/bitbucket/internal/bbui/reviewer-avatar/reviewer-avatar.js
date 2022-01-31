define('bitbucket/internal/bbui/reviewer-avatar/reviewer-avatar', ['module', 'exports', '@atlassian/aui', 'lodash', 'prop-types', 'react', 'bitbucket/internal/enums', '../aui-react/avatar'], function (module, exports, _aui, _lodash, _propTypes, _react, _enums, _avatar) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var propTypes = {
        avatarSize: _propTypes2.default.string,
        reviewer: _propTypes2.default.shape({
            user: _propTypes2.default.object.isRequired,
            status: _propTypes2.default.oneOf(_lodash2.default.values(_enums.ApprovalStatus)).isRequired
        }).isRequired,
        withName: _propTypes2.default.bool,
        tooltip: _propTypes2.default.bool,
        nameOnly: _propTypes2.default.bool
    };

    var visibleBadgeCssClass = {
        APPROVED: 'approved',
        NEEDS_WORK: 'needs-work'
    };

    var avatarBadges = [{
        className: visibleBadgeCssClass.APPROVED,
        text: _aui.I18n.getText('bitbucket.component.avatar.badge.approved')
    }, {
        className: visibleBadgeCssClass.NEEDS_WORK,
        text: _aui.I18n.getText('bitbucket.component.avatar.badge.needs.work')
    }];

    function reviewerTooltip(reviewer, nameOnly) {
        var name = reviewer.user.displayName || reviewer.user.name;
        var displayText = void 0;
        if (nameOnly || !reviewer.status || reviewer.status === _enums.ApprovalStatus.UNAPPROVED) {
            displayText = name;
        } else if (reviewer.status === _enums.ApprovalStatus.APPROVED) {
            displayText = _aui.I18n.getText('bitbucket.component.pull.request.reviewer.tooltip.approved', name);
        } else {
            displayText = _aui.I18n.getText('bitbucket.component.pull.request.reviewer.tooltip.needs.work', name);
        }
        return displayText;
    }

    var ReviewerAvatar = function (_Component) {
        babelHelpers.inherits(ReviewerAvatar, _Component);

        function ReviewerAvatar() {
            babelHelpers.classCallCheck(this, ReviewerAvatar);
            return babelHelpers.possibleConstructorReturn(this, (ReviewerAvatar.__proto__ || Object.getPrototypeOf(ReviewerAvatar)).apply(this, arguments));
        }

        babelHelpers.createClass(ReviewerAvatar, [{
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(newProps) {
                return this.props.reviewer.user.name !== newProps.reviewer.user.name || this.props.reviewer.status !== newProps.reviewer.status || this.props.avatarSize !== newProps.avatarSize || Boolean(this.props.nameOnly) !== Boolean(newProps.nameOnly) || Boolean(this.props.tooltip) !== Boolean(newProps.tooltip) || Boolean(this.props.withName) !== Boolean(newProps.withName);
            }
        }, {
            key: 'render',
            value: function render() {
                var props = this.props;
                return _react2.default.createElement(_avatar.UserAvatar, {
                    person: props.reviewer.user,
                    size: props.avatarSize,
                    badges: avatarBadges,
                    tooltipText: reviewerTooltip(props.reviewer, props.nameOnly),
                    visibleBadge: props.reviewer.status ? visibleBadgeCssClass[props.reviewer.status] : '',
                    withName: props.withName,
                    tooltip: props.tooltip
                });
            }
        }]);
        return ReviewerAvatar;
    }(_react.Component);

    ReviewerAvatar.propTypes = propTypes;
    exports.default = ReviewerAvatar;
    module.exports = exports['default'];
});