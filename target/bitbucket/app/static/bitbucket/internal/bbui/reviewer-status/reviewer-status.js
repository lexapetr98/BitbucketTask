define('bitbucket/internal/bbui/reviewer-status/reviewer-status', ['module', 'exports', '@atlassian/aui', 'classnames', 'lodash', 'prop-types', 'react', 'bitbucket/internal/enums'], function (module, exports, _aui, _classnames, _lodash, _propTypes, _react, _enums) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var propTypes = {
        currentUserAsReviewer: _propTypes2.default.object,
        onStatusClick: _propTypes2.default.func.isRequired,
        status: _propTypes2.default.oneOf(_lodash2.default.values(_enums.ApprovalStatus))
    };

    var titles = {
        approve: _aui2.default.I18n.getText('bitbucket.component.reviewer.status.tooltip.approve'),
        'approve-deselect': _aui2.default.I18n.getText('bitbucket.component.reviewer.status.tooltip.approve.deselect'),
        'needs-work': _aui2.default.I18n.getText('bitbucket.component.reviewer.status.tooltip.needswork'),
        'needs-work-deselect': _aui2.default.I18n.getText('bitbucket.component.reviewer.status.tooltip.needswork.deselect')
    };

    var ReviewerStatus = function ReviewerStatus(props) {
        function makeStatus(status, cssClass) {
            var isPressed = props.status === status;
            var title = titles[cssClass + (isPressed ? '-deselect' : '')];

            var onClick = function onClick() {
                return props.onStatusClick({
                    newStatus: isPressed ? _enums.ApprovalStatus.UNAPPROVED : status
                });
            };

            var setRef = function setRef(el) {
                return _aui2.default.$(el).tooltip({
                    html: true
                });
            };

            return _react2.default.createElement(
                'button',
                {
                    className: 'aui-button ' + cssClass,
                    'aria-pressed': isPressed,
                    title: title,
                    onClick: onClick,
                    ref: setRef
                },
                _react2.default.createElement(
                    'span',
                    { className: 'aui-icon aui-icon-small aui-iconfont-' + cssClass },
                    title
                )
            );
        }

        return _react2.default.createElement(
            'div',
            {
                className: (0, _classnames2.default)('aui-buttons', 'reviewer-status-selector', {
                    reviewing: props.currentUserAsReviewer
                }),
                'data-status': props.status
            },
            makeStatus(_enums.ApprovalStatus.NEEDS_WORK, 'needs-work'),
            makeStatus(_enums.ApprovalStatus.APPROVED, 'approve')
        );
    };
    ReviewerStatus.propTypes = propTypes;

    exports.default = ReviewerStatus;
    module.exports = exports['default'];
});