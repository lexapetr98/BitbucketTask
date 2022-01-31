define('bitbucket/internal/feature/changeset/diff-tree/store/action-creators', ['exports', './constants'], function (exports, _constants) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.toggleCollapse = exports.selectItem = exports.selectPrevItem = exports.selectNextItem = exports.updateParentsMap = exports.updateList = undefined;
    var updateList = exports.updateList = function updateList(_ref) {
        var list = _ref.list,
            _ref$defaultSelected = _ref.defaultSelected,
            defaultSelected = _ref$defaultSelected === undefined ? null : _ref$defaultSelected;
        return {
            type: _constants.UPDATE_LIST,
            list: list,
            defaultSelected: defaultSelected
        };
    };

    var updateParentsMap = exports.updateParentsMap = function updateParentsMap(_ref2) {
        var parents = _ref2.parents;
        return {
            type: _constants.UPDATE_PARENTS_MAP,
            parents: parents
        };
    };

    var selectNextItem = exports.selectNextItem = function selectNextItem() {
        return {
            type: _constants.SELECT_NEXT_ITEM
        };
    };

    var selectPrevItem = exports.selectPrevItem = function selectPrevItem() {
        return {
            type: _constants.SELECT_PREV_ITEM
        };
    };

    var selectItem = exports.selectItem = function selectItem(selectedId) {
        return {
            type: _constants.SELECT_ITEM,
            selectedId: selectedId
        };
    };

    var toggleCollapse = exports.toggleCollapse = function toggleCollapse(nodeId) {
        return {
            type: _constants.TOGGLE_COLLAPSE,
            nodeId: nodeId
        };
    };
});