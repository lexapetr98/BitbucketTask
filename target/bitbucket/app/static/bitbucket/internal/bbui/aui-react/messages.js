define('bitbucket/internal/bbui/aui-react/messages', ['exports', 'classnames', 'prop-types', 'react'], function (exports, _classnames, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Message = exports.WarningMessage = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var MessageTypes = {
        ERROR: 'error',
        WARNING: 'warning',
        SUCCESS: 'success',
        INFO: 'info'
    };

    var WarningMessage = exports.WarningMessage = function WarningMessage(props) {
        return _react2.default.createElement(Message, babelHelpers.extends({ type: 'warning' }, props));
    };

    var Message = exports.Message = function Message(_ref) {
        var type = _ref.type,
            title = _ref.title,
            className = _ref.className,
            children = _ref.children;

        var messageClassnames = (0, _classnames2.default)('aui-message', 'aui-message-' + type, className);
        return _react2.default.createElement(
            'div',
            { className: messageClassnames },
            title && _react2.default.createElement(
                'p',
                { className: 'title' },
                title
            ),
            children
        );
    };

    Message.propTypes = {
        type: _propTypes2.default.oneOf(Object.values(MessageTypes)),
        title: _propTypes2.default.string,
        children: _propTypes2.default.node,
        className: _propTypes2.default.string
    };
});