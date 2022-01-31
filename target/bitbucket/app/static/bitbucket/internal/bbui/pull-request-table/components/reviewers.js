define('bitbucket/internal/bbui/pull-request-table/components/reviewers', ['module', 'exports', 'prop-types', 'react', 'bitbucket/internal/bbui/aui-react/avatar', '../../reviewer-avatar-list/reviewer-avatar-list'], function (module, exports, _propTypes, _react, _avatar, _reviewerAvatarList) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reviewerAvatarList2 = babelHelpers.interopRequireDefault(_reviewerAvatarList);

    var MAX_OPEN = 3;

    var Reviewers = function (_Component) {
        babelHelpers.inherits(Reviewers, _Component);

        function Reviewers() {
            babelHelpers.classCallCheck(this, Reviewers);
            return babelHelpers.possibleConstructorReturn(this, (Reviewers.__proto__ || Object.getPrototypeOf(Reviewers)).apply(this, arguments));
        }

        babelHelpers.createClass(Reviewers, [{
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(newProps) {
                return this.props.pullRequest !== newProps.pullRequest || this.props.pullRequest.reviewers !== newProps.pullRequest.reviewers;
            }
        }, {
            key: 'render',
            value: function render() {
                var pullRequest = this.props.pullRequest;

                return _react2.default.createElement(
                    'td',
                    { className: 'reviewers' },
                    _react2.default.createElement(_reviewerAvatarList2.default, {
                        avatarSize: _avatar.AvatarTShirtSize.MEDIUM,
                        currentUserAsReviewer: this.props.currentUser,
                        currentUserAvatarSize: this.props.currentUserAvatarSize,
                        dialogReviewersAsTooltip: this.props.dialogReviewersAsTooltip,
                        maxOpen: this.props.maxOpen || MAX_OPEN,
                        menuId: 'reviewers-' + pullRequest.id,
                        permissionToReview: false,
                        pullRequestIsOpen: pullRequest.state === 'OPEN',
                        reviewers: pullRequest.reviewers
                    })
                );
            }
        }]);
        return Reviewers;
    }(_react.Component);

    Reviewers.propTypes = {
        currentUser: _propTypes2.default.object,
        currentUserAvatarSize: _propTypes2.default.string,
        dialogReviewersAsTooltip: _reviewerAvatarList2.default.propTypes.dialogReviewersAsTooltip,
        pullRequest: _propTypes2.default.object.isRequired,
        maxOpen: _propTypes2.default.number
    };


    Reviewers.Header = function () {
        return _react2.default.createElement(
            'th',
            { className: 'reviewers', scope: 'col' },
            AJS.I18n.getText('bitbucket.pull.request.table.title.reviewers')
        );
    };

    exports.default = Reviewers;
    module.exports = exports['default'];
});