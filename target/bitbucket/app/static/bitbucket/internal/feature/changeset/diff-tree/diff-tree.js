define('bitbucket/internal/feature/changeset/diff-tree/diff-tree', ['module', 'exports', 'react-redux', 'bitbucket/internal/util/components/react-functional', 'bitbucket/internal/util/components/with-keyboard-list-selector', 'bitbucket/internal/widget/tree-view/tree-builder', './containers/diff-tree-view', './store/store'], function (module, exports, _reactRedux, _reactFunctional, _withKeyboardListSelector, _treeBuilder, _diffTreeView, _store) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _withKeyboardListSelector2 = babelHelpers.interopRequireDefault(_withKeyboardListSelector);

    var _diffTreeView2 = babelHelpers.interopRequireDefault(_diffTreeView);

    var selectNextItem = _store.actionCreators.selectNextItem,
        selectPrevItem = _store.actionCreators.selectPrevItem,
        updateList = _store.actionCreators.updateList,
        updateParentsMap = _store.actionCreators.updateParentsMap;


    var mapDispatchToProps = {
        selectNextItem: selectNextItem,
        selectPrevItem: selectPrevItem,
        updateList: updateList,
        updateParentsMap: updateParentsMap
    };

    var enhance = (0, _reactFunctional.compose)((0, _reactFunctional.withPropsMapper)(function (props) {
        var nodes = props.nodes;

        var tree = (0, _treeBuilder.buildTree)(nodes);

        return babelHelpers.extends({}, props, { tree: tree });
    }), (0, _reactRedux.connect)(null, mapDispatchToProps), (0, _reactFunctional.withLifecycle)({
        componentDidMount: function componentDidMount() {
            var _props = this.props,
                updateList = _props.updateList,
                updateParentsMap = _props.updateParentsMap,
                nodes = _props.nodes,
                tree = _props.tree;

            var parents = (0, _treeBuilder.buildNodesRelation)(tree);

            updateList({ list: nodes });
            updateParentsMap({ parents: parents });
        }
    }), (0, _withKeyboardListSelector2.default)());

    exports.default = enhance(_diffTreeView2.default);
    module.exports = exports['default'];
});