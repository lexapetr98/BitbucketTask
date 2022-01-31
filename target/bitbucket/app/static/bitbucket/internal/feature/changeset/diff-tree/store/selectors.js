define('bitbucket/internal/feature/changeset/diff-tree/store/selectors', ['exports', 'reselect', './constants'], function (exports, _reselect, _constants) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getSelectedNodeId = exports.isNodeCollapsed = undefined;


    var getDiffTree = function getDiffTree(state) {
        return state[_constants.STATE_NAMESPACE];
    };

    var getNodeId = function getNodeId(_, _ref) {
        var id = _ref.id;
        return id;
    };

    var getSelectedItem = (0, _reselect.createSelector)([getDiffTree], function (_ref2) {
        var list = _ref2.list,
            selectedIndex = _ref2.selectedIndex;
        return list[selectedIndex];
    });

    var isNodeCollapsed = exports.isNodeCollapsed = (0, _reselect.createSelector)([getDiffTree, getNodeId], function (_ref3, nodeId) {
        var collapsed = _ref3.collapsed;
        return collapsed[nodeId] === _constants.NODE_COLLAPSED;
    });

    var getSelectedNodeId = exports.getSelectedNodeId = (0, _reselect.createSelector)([getSelectedItem], function (selectedItem) {
        return selectedItem && selectedItem.id;
    });
});