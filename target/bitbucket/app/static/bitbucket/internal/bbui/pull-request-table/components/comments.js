define('bitbucket/internal/bbui/pull-request-table/components/comments', ['module', 'exports', '@atlassian/aui', 'prop-types', 'react', 'bitbucket/internal/widget/icons/icons', './count-cell'], function (module, exports, _aui, _propTypes, _react, _icons, _countCell) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _countCell2 = babelHelpers.interopRequireDefault(_countCell);

    var propTypes = {
        pullRequest: _propTypes2.default.object.isRequired
    };

    var Comments = function (_Component) {
        babelHelpers.inherits(Comments, _Component);

        function Comments() {
            babelHelpers.classCallCheck(this, Comments);
            return babelHelpers.possibleConstructorReturn(this, (Comments.__proto__ || Object.getPrototypeOf(Comments)).apply(this, arguments));
        }

        babelHelpers.createClass(Comments, [{
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(newProps) {
                return this.props.pullRequest.properties.commentCount !== newProps.pullRequest.properties.commentCount;
            }
        }, {
            key: 'render',
            value: function render() {
                var commentCount = this.props.pullRequest.properties.commentCount || 0;
                return _react2.default.createElement(_countCell2.default, {
                    count: commentCount,
                    tooltip: _aui2.default.I18n.getText('bitbucket.web.comment.count', commentCount),
                    className: 'comments',
                    icon: _react2.default.createElement(
                        _icons.CommentIcon,
                        null,
                        _aui2.default.I18n.getText('bitbucket.web.comment.label')
                    )
                });
            }
        }]);
        return Comments;
    }(_react.Component);

    Comments.Header = _countCell2.default.Header;
    Comments.propTypes = propTypes;

    exports.default = Comments;
    module.exports = exports['default'];
});