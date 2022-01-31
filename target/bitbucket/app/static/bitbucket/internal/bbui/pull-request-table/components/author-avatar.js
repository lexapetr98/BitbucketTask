define('bitbucket/internal/bbui/pull-request-table/components/author-avatar', ['module', 'exports', 'prop-types', 'react', '../../aui-react/avatar'], function (module, exports, _propTypes, _react, _avatar) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var AuthorAvatar = function (_Component) {
        babelHelpers.inherits(AuthorAvatar, _Component);

        function AuthorAvatar() {
            babelHelpers.classCallCheck(this, AuthorAvatar);
            return babelHelpers.possibleConstructorReturn(this, (AuthorAvatar.__proto__ || Object.getPrototypeOf(AuthorAvatar)).apply(this, arguments));
        }

        babelHelpers.createClass(AuthorAvatar, [{
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(newProps) {
                return this.props.author !== newProps.author;
            }
        }, {
            key: 'render',
            value: function render() {
                return _react2.default.createElement(
                    'td',
                    { className: 'author-avatar' },
                    _react2.default.createElement(_avatar.UserAvatar, { person: this.props.author, size: 'medium' })
                );
            }
        }]);
        return AuthorAvatar;
    }(_react.Component);

    AuthorAvatar.propTypes = {
        author: _propTypes2.default.object.isRequired
    };
    exports.default = AuthorAvatar;
    module.exports = exports['default'];
});