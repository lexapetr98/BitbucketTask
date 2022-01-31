define('bitbucket/internal/feature/changeset/diff-tree/containers/diff-tree-view', ['exports', 'prop-types', 'react', 'bitbucket/internal/widget/tree-view/tree-view', './directory', './file', './files'], function (exports, _propTypes, _react, _treeView, _directory, _file, _files) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.DiffTreeView = undefined;

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _treeView2 = babelHelpers.interopRequireDefault(_treeView);

    var _directory2 = babelHelpers.interopRequireDefault(_directory);

    var _file2 = babelHelpers.interopRequireDefault(_file);

    var _files2 = babelHelpers.interopRequireDefault(_files);

    var DiffTreeView = exports.DiffTreeView = function (_PureComponent) {
        babelHelpers.inherits(DiffTreeView, _PureComponent);

        function DiffTreeView() {
            babelHelpers.classCallCheck(this, DiffTreeView);
            return babelHelpers.possibleConstructorReturn(this, (DiffTreeView.__proto__ || Object.getPrototypeOf(DiffTreeView)).apply(this, arguments));
        }

        babelHelpers.createClass(DiffTreeView, [{
            key: 'render',
            value: function render() {
                return _react2.default.createElement(_treeView2.default, {
                    NodesComponent: _files2.default,
                    NodeLabelComponent: _directory2.default,
                    LeafComponent: _file2.default,
                    tree: this.props.tree,
                    className: 'diff-tree-view'
                });
            }
        }]);
        return DiffTreeView;
    }(_react.PureComponent);

    DiffTreeView.propTypes = {
        tree: _propTypes2.default.object.isRequired
    };
    exports.default = DiffTreeView;
});