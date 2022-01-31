define('bitbucket/internal/widget/tree-view/tree-view', ['exports', 'prop-types', 'react', './components/default-leaf', './components/default-node', './components/default-node-label', './components/default-nodes'], function (exports, _propTypes, _react, _defaultLeaf, _defaultNode, _defaultNodeLabel, _defaultNodes) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.DefaultLeaf = exports.DefaultNodeLabel = exports.DefaultNode = exports.DefaultNodes = undefined;
    exports.renderTree = renderTree;

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _defaultLeaf2 = babelHelpers.interopRequireDefault(_defaultLeaf);

    var _defaultNode2 = babelHelpers.interopRequireDefault(_defaultNode);

    var _defaultNodeLabel2 = babelHelpers.interopRequireDefault(_defaultNodeLabel);

    var _defaultNodes2 = babelHelpers.interopRequireDefault(_defaultNodes);

    function renderTree(components) {
        var NodeComponent = components.NodeComponent;


        return function renderNodes(nodes) {
            return nodes.map(function (_ref) {
                var childNodes = _ref.children,
                    node = babelHelpers.objectWithoutProperties(_ref, ['children']);
                var id = node.id;

                var props = babelHelpers.extends({}, node, components);

                return _react2.default.createElement(
                    NodeComponent,
                    babelHelpers.extends({}, props, { key: id }),
                    renderNodes(childNodes)
                );
            });
        };
    }

    var TreeView = function (_PureComponent) {
        babelHelpers.inherits(TreeView, _PureComponent);

        function TreeView() {
            babelHelpers.classCallCheck(this, TreeView);
            return babelHelpers.possibleConstructorReturn(this, (TreeView.__proto__ || Object.getPrototypeOf(TreeView)).apply(this, arguments));
        }

        babelHelpers.createClass(TreeView, [{
            key: 'render',
            value: function render() {
                var _props = this.props,
                    tree = _props.tree,
                    className = _props.className,
                    components = babelHelpers.objectWithoutProperties(_props, ['tree', 'className']);
                var NodesComponent = components.NodesComponent;


                var rootNodes = tree.children;
                var treeView = renderTree(components)(rootNodes);

                return _react2.default.createElement(
                    'div',
                    { className: className },
                    _react2.default.createElement(
                        NodesComponent,
                        { isRoot: true },
                        treeView
                    )
                );
            }
        }]);
        return TreeView;
    }(_react.PureComponent);

    TreeView.propTypes = {
        tree: _propTypes2.default.object.isRequired,
        NodesComponent: _propTypes2.default.func,
        NodeComponent: _propTypes2.default.func,
        NodeLabelComponent: _propTypes2.default.func,
        LeafComponent: _propTypes2.default.func,
        className: _propTypes2.default.string
    };
    TreeView.defaultProps = {
        NodesComponent: _defaultNodes2.default,
        NodeComponent: _defaultNode2.default,
        NodeLabelComponent: _defaultNodeLabel2.default,
        LeafComponent: _defaultLeaf2.default,
        className: null
    };
    exports.default = TreeView;
    exports.DefaultNodes = _defaultNodes2.default;
    exports.DefaultNode = _defaultNode2.default;
    exports.DefaultNodeLabel = _defaultNodeLabel2.default;
    exports.DefaultLeaf = _defaultLeaf2.default;
});