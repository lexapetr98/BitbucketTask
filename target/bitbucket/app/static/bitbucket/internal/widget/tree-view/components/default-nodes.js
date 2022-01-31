define('bitbucket/internal/widget/tree-view/components/default-nodes', ['module', 'exports', 'prop-types', 'react'], function (module, exports, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var DefaultNodes = function (_PureComponent) {
        babelHelpers.inherits(DefaultNodes, _PureComponent);

        function DefaultNodes() {
            babelHelpers.classCallCheck(this, DefaultNodes);
            return babelHelpers.possibleConstructorReturn(this, (DefaultNodes.__proto__ || Object.getPrototypeOf(DefaultNodes)).apply(this, arguments));
        }

        babelHelpers.createClass(DefaultNodes, [{
            key: 'render',
            value: function render() {
                var _props = this.props,
                    isCollapsed = _props.isCollapsed,
                    children = _props.children;


                return _react2.default.createElement(
                    'ul',
                    { hidden: isCollapsed },
                    children
                );
            }
        }]);
        return DefaultNodes;
    }(_react.PureComponent);

    DefaultNodes.propTypes = {
        children: _propTypes2.default.node.isRequired,
        isCollapsed: _propTypes2.default.bool
    };
    DefaultNodes.defaultProps = {
        isCollapsed: false
    };
    exports.default = DefaultNodes;
    module.exports = exports['default'];
});