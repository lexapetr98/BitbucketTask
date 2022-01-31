define('bitbucket/internal/feature/changeset/diff-tree/store/reducers', ['module', 'exports', 'lodash', 'bitbucket/internal/util/reducers', './constants'], function (module, exports, _lodash, _reducers, _constants) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = reducer;

    var _reduceByType2;

    /**
     * Select the item with the given ID. If the item isn't in the list, select the first item in the list.
     * @param {Array<{ id: * }>} list
     * @param {*} selectedId
     * @returns {number}
     */
    var selectById = function selectById(list, selectedId) {
        return Math.max(0, list.findIndex(function (_ref) {
            var id = _ref.id;
            return selectedId === id;
        }));
    };

    var getNodePath = function getNodePath(parents, nodeId) {
        var path = [];
        var currentNodeId = nodeId;

        while (parents.hasOwnProperty(currentNodeId)) {
            path.unshift(currentNodeId);

            currentNodeId = parents[currentNodeId];
        }

        return path;
    };

    var ensureNodePathIsExpanded = function ensureNodePathIsExpanded(collapsedState, parents, node) {
        var anyExpanded = false;
        var newCollapsedState = babelHelpers.extends({}, collapsedState);

        var path = node ? getNodePath(parents, node.id) : [];
        path.forEach(function (id) {
            if (collapsedState[id] !== _constants.NODE_EXPANDED) {
                anyExpanded = true;
                newCollapsedState[id] = _constants.NODE_EXPANDED;
            }
        });

        return anyExpanded ? newCollapsedState : collapsedState;
    };

    var reduceByNodeId = (0, _reducers.multiKeyedReducer)(function (_ref2) {
        var nodeId = _ref2.nodeId;
        return nodeId || null;
    });

    var listReducer = (0, _reducers.reduceByType)([], babelHelpers.defineProperty({}, _constants.UPDATE_LIST, function (prevList, _ref3) {
        var list = _ref3.list;
        return list;
    }));

    var selectedIndexReducer = (0, _reducers.reduceByType)(0, (_reduceByType2 = {}, babelHelpers.defineProperty(_reduceByType2, _constants.UPDATE_LIST, function (i, _ref4) {
        var list = _ref4.list,
            _ref4$defaultSelected = _ref4.defaultSelected,
            defaultSelected = _ref4$defaultSelected === undefined ? null : _ref4$defaultSelected;
        return defaultSelected ? selectById(list, defaultSelected.id) : 0;
    }), babelHelpers.defineProperty(_reduceByType2, _constants.SELECT_NEXT_ITEM, function (i, action, list) {
        return (0, _lodash.clamp)(i + 1, 0, list.length - 1);
    }), babelHelpers.defineProperty(_reduceByType2, _constants.SELECT_PREV_ITEM, function (i, action, list) {
        return (0, _lodash.clamp)(i - 1, 0, list.length - 1);
    }), babelHelpers.defineProperty(_reduceByType2, _constants.SELECT_ITEM, function (i, _ref5, list) {
        var selectedId = _ref5.selectedId;
        return selectById(list, selectedId);
    }), _reduceByType2));

    var parentsReducer = (0, _reducers.reduceByType)({}, babelHelpers.defineProperty({}, _constants.UPDATE_PARENTS_MAP, function (state, _ref6) {
        var parents = _ref6.parents;
        return parents;
    }));

    var collapsedReducer = (0, _reducers.reduceByTypes)({}, [[_constants.TOGGLE_COLLAPSE, reduceByNodeId(function () {
        var collapsedState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _constants.NODE_EXPANDED;
        return collapsedState === _constants.NODE_EXPANDED ? _constants.NODE_COLLAPSED : _constants.NODE_EXPANDED;
    })], [[_constants.SELECT_ITEM, _constants.SELECT_NEXT_ITEM, _constants.SELECT_PREV_ITEM], function (state, action, _ref7) {
        var parents = _ref7.parents,
            list = _ref7.list,
            selectedIndex = _ref7.selectedIndex;
        return ensureNodePathIsExpanded(state, parents, list[selectedIndex]);
    }]]);

    function reducer() {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var action = arguments[1];

        var list = listReducer(state.list, action);
        var selectedIndex = selectedIndexReducer(state.selectedIndex, action, list);
        var parents = parentsReducer(state.parents, action);
        var collapsed = collapsedReducer(state.collapsed, action, { parents: parents, list: list, selectedIndex: selectedIndex });

        return (0, _reducers.preserveIfEquivalent)(state, {
            list: list,
            selectedIndex: selectedIndex,
            parents: parents,
            collapsed: collapsed
        });
    }
    module.exports = exports['default'];
});