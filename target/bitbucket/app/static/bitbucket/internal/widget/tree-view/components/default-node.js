define('bitbucket/internal/widget/tree-view/components/default-node', ['module', 'exports', 'prop-types', 'react'], function (module, exports, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var DefaultNode = function (_Component) {
        babelHelpers.inherits(DefaultNode, _Component);

        function DefaultNode() {
            babelHelpers.classCallCheck(this, DefaultNode);
            return babelHelpers.possibleConstructorReturn(this, (DefaultNode.__proto__ || Object.getPrototypeOf(DefaultNode)).apply(this, arguments));
        }

        babelHelpers.createClass(DefaultNode, [{
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(nextProps) {
                return nextProps.isCollapsed !== this.props.isCollapsed;
            }
        }, {
            key: 'render',
            value: function render() {
                var _props = this.props,
                    children = _props.children,
                    NodesComponent = _props.NodesComponent,
                    NodeLabelComponent = _props.NodeLabelComponent,
                    LeafComponent = _props.LeafComponent,
                    props = babelHelpers.objectWithoutProperties(_props, ['children', 'NodesComponent', 'NodeLabelComponent', 'LeafComponent']);


                var hasChildren = Boolean(children.length);

                if (!hasChildren) {
                    return _react2.default.createElement(LeafComponent, props);
                }

                return _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(NodeLabelComponent, props),
                    _react2.default.createElement(
                        NodesComponent,
                        props,
                        children
                    )
                );
            }
        }]);
        return DefaultNode;
    }(_react.Component);

    DefaultNode.propTypes = {
        NodesComponent: _propTypes2.default.func.isRequired,
        NodeLabelComponent: _propTypes2.default.func.isRequired,
        LeafComponent: _propTypes2.default.func.isRequired,
        children: _propTypes2.default.node,
        isCollapsed: _propTypes2.default.bool
    };
    DefaultNode.defaultProps = {
        children: [],
        isCollapsed: false
    };
    exports.default = DefaultNode;
    module.exports = exports['default'];
});