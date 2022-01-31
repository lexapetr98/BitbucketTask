define('bitbucket/internal/feature/commit-graph/graph-builder', ['exports', 'lodash'], function (exports, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.buildGraph = buildGraph;


    var addNodes = function addNodes(dest, source, pos) {
        return [].concat(dest.slice(0, pos), source, dest.slice(pos + 1, dest.length));
    };

    // Similar to _.invert, but accepts a transform for the value
    // (_.invertBy supports transforming the key)
    var invertWith = function invertWith(collection) {
        var valTransform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (a) {
            return a;
        };
        return (0, _lodash.fromPairs)((0, _lodash.map)(collection, function (v, k) {
            return [v, valTransform(k)];
        }));
    };

    function buildGraph(commits) {
        var nextColor = 1;
        var columns = {};
        var colors = {};
        var seen = [];

        return commits.map(function (_ref) {
            var commitId = _ref.id,
                parents = _ref.parents;

            if (!seen.includes(commitId)) {
                columns[commitId] = seen.length;
                colors[commitId] = nextColor++;
                seen.push(commitId);
            }

            var column = columns[commitId];
            var color = colors[commitId];
            delete colors[commitId];

            var unseenParents = parents.map(function (_ref2) {
                var parentId = _ref2.id;

                if (!seen.includes(parentId)) {
                    return parentId;
                }
            }).filter(function (a) {
                return a;
            });

            var next = addNodes(seen, unseenParents, column);

            columns = invertWith(next, parseInt);

            unseenParents.forEach(function (item, i) {
                if (i === 0) {
                    //First parent is the same color
                    colors[item] = color;
                } else {
                    colors[item] = nextColor++;
                }
            });

            var segments = (0, _lodash.flatMap)(seen, function (seenId, currColumn) {
                if (next.includes(seenId)) {
                    return {
                        startColumn: currColumn,
                        endColumn: columns[seenId],
                        color: colors[seenId]
                    };
                }

                if (seenId === commitId) {
                    return parents.map(function (_ref3) {
                        var parentId = _ref3.id;

                        return {
                            startColumn: currColumn,
                            endColumn: columns[parentId],
                            color: colors[parentId]
                        };
                    });
                }
            });

            seen = next;

            return { id: commitId, column: column, color: color, segments: segments };
        });
    }
});