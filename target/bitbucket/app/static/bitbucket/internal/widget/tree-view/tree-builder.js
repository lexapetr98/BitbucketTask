define('bitbucket/internal/widget/tree-view/tree-builder', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.flattenTree = flattenTree;
    exports.sortTreeNodes = sortTreeNodes;
    exports.buildTreeFromNodes = buildTreeFromNodes;
    exports.buildNodesRelation = buildNodesRelation;
    exports.buildTree = buildTree;
    var PATH_SEPARATOR = '/';
    var NODE_TYPE_DIRECTORY = 'DIRECTORY';
    var SYMBOL_PREFIX_FILE_REGEXP = /\W/; // any non-alphanumeric char

    var ROOT_ID = null;

    var createRootNode = function createRootNode() {
        return {
            id: ROOT_ID,
            isRoot: true,
            children: {}
        };
    };

    var createParentNode = function createParentNode(_ref) {
        var id = _ref.id,
            name = _ref.name;
        return {
            id: id,
            name: name,
            type: NODE_TYPE_DIRECTORY,
            isCollapsed: false,
            children: {}
        };
    };

    var getParentId = function getParentId(name, index) {
        return name.slice(0, index + 1).join(PATH_SEPARATOR);
    };

    var getOrCreateNodeFromPath = function getOrCreateNodeFromPath(root, path) {
        return path.reduce(function (parent, name, index) {
            if (!parent.children[name]) {
                var parentId = getParentId(path, index);

                parent.children[name] = createParentNode({ id: parentId, name: name });
            }

            return parent.children[name];
        }, root);
    };

    /** @visibleForTesting */
    function flattenTree(tree) {
        var children = tree.children;


        var hasSingleChild = function hasSingleChild(node) {
            return node.children.length === 1;
        };
        var areAllChildrenADirectory = function areAllChildrenADirectory(node) {
            return node.children.every(function (childNode) {
                return childNode.type === NODE_TYPE_DIRECTORY;
            });
        };

        children.forEach(function (node, index) {
            var childNode = node;
            var path = [node.name];

            while (hasSingleChild(childNode) && areAllChildrenADirectory(childNode)) {
                childNode = childNode.children[0];

                path.push(childNode.name);
            }

            // If we didn't end up on the same tree level
            if (childNode !== node) {
                var newBranchName = path.join(PATH_SEPARATOR);

                children.splice(index, 1, babelHelpers.extends({}, childNode, {
                    id: childNode.id,
                    name: newBranchName
                }));

                flattenTree(childNode);
            } else if (childNode.type === NODE_TYPE_DIRECTORY) {
                flattenTree(childNode);
            }
        });
    }

    function transformChildrenToArray(node) {
        var children = Object.values(node.children);

        children.forEach(transformChildrenToArray);

        node.children = children;
    }

    var naturalLocaleCompare = function naturalLocaleCompare(a, b) {
        return a.localeCompare(b, undefined, {
            numeric: true
        });
    };

    var isDotFile = function isDotFile(filename) {
        return filename.charAt(0).match(SYMBOL_PREFIX_FILE_REGEXP);
    };

    /** @visibleForTesting */
    function sortTreeNodes(node) {
        var children = node.children;


        children.sort(function (_ref2, _ref3) {
            var nameA = _ref2.name,
                typeA = _ref2.type;
            var nameB = _ref3.name,
                typeB = _ref3.type;

            if (typeA === typeB) {
                if (isDotFile(nameA) && !isDotFile(nameB)) {
                    return -1;
                }

                if (!isDotFile(nameA) && isDotFile(nameB)) {
                    return 1;
                }

                return naturalLocaleCompare(nameA, nameB);
            }

            return typeA === NODE_TYPE_DIRECTORY ? -1 : 1;
        });

        children.forEach(sortTreeNodes);
    }

    var getPathToLeaf = function getPathToLeaf(path) {
        return path.slice(0, -1);
    };

    /** @visibleForTesting */
    function buildTreeFromNodes(nodes) {
        var tree = nodes.reduce(function (root, _ref4) {
            var name = _ref4.name,
                path = _ref4.path,
                node = babelHelpers.objectWithoutProperties(_ref4, ['name', 'path']);

            var pathToLeaf = getPathToLeaf(path);

            var _getOrCreateNodeFromP = getOrCreateNodeFromPath(root, pathToLeaf),
                children = _getOrCreateNodeFromP.children;

            children[name] = babelHelpers.extends({}, node, {
                name: name,
                isCollapsed: false,
                children: {}
            });

            return root;
        }, createRootNode());

        transformChildrenToArray(tree);

        return tree;
    }

    function buildNodesRelation(tree) {
        var parentsRelation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var children = tree.children,
            parentId = tree.id;


        children.forEach(function (child) {
            parentsRelation[child.id] = parentId;

            buildNodesRelation(child, parentsRelation);
        });

        return parentsRelation;
    }

    function buildTree(nodes) {
        var tree = buildTreeFromNodes(nodes);

        flattenTree(tree);
        sortTreeNodes(tree);

        return tree;
    }
});