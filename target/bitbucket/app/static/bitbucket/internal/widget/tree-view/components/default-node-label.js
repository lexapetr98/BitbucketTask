define('bitbucket/internal/widget/tree-view/components/default-node-label', ['module', 'exports', 'prop-types', 'react'], function (module, exports, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var DefaultNodeLabel = function (_PureComponent) {
        babelHelpers.inherits(DefaultNodeLabel, _PureComponent);

        function DefaultNodeLabel() {
            babelHelpers.classCallCheck(this, DefaultNodeLabel);
            return babelHelpers.possibleConstructorReturn(this, (DefaultNodeLabel.__proto__ || Object.getPrototypeOf(DefaultNodeLabel)).apply(this, arguments));
        }

        babelHelpers.createClass(DefaultNodeLabel, [{
            key: 'render',
            value: function render() {
                var _props = this.props,
                    name = _props.name,
                    isCollapsed = _props.isCollapsed;


                return _react2.default.createElement(
                    'div',
                    null,
                    isCollapsed ? '+' : '-',
                    ' ',
                    name
                );
            }
        }]);
        return DefaultNodeLabel;
    }(_react.PureComponent);

    DefaultNodeLabel.propTypes = {
        name: _propTypes2.default.node.isRequired,
        isCollapsed: _propTypes2.default.bool
    };
    DefaultNodeLabel.defaultProps = {
        isCollapsed: false
    };
    exports.default = DefaultNodeLabel;
    module.exports = exports['default'];
});