define('bitbucket/internal/feature/commit-graph/commit-graph', ['exports', 'classnames', 'lodash', 'react', 'bitbucket/internal/util/components/react-functional', './graph-builder'], function (exports, _classnames, _lodash, _react, _reactFunctional, _graphBuilder) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Slice = exports.Graph = exports.CommitGraph = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var line = function line(x1, y1, x2, y2) {
        return 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2;
    };

    var curve = function curve(x1, y1, x2, y2) {
        var midY = Math.round((y2 - y1) / 2);

        var control1Y = y1 + midY;
        var control2Y = y2 - midY;

        return 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + control1Y + ' ' + x2 + ',' + control2Y + ' ' + x2 + ',' + y2;
    };

    //Will return `0` for an empty graph, `1` for a graph of 1 node, and `n` for a graph of n columns
    var getMaxColumns = function getMaxColumns(graph) {
        return graph.length && (0, _lodash.max)([1].concat(graph.map(function (node) {
            return node.segments.length;
        })));
    };

    var CommitGraph = exports.CommitGraph = function (_PureComponent) {
        babelHelpers.inherits(CommitGraph, _PureComponent);

        function CommitGraph() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, CommitGraph);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = CommitGraph.__proto__ || Object.getPrototypeOf(CommitGraph)).call.apply(_ref, [this].concat(args))), _this), _this.buildGraph = (0, _lodash.memoize)(_graphBuilder.buildGraph), _this.getMaxColumns = (0, _lodash.memoize)(getMaxColumns), _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(CommitGraph, [{
            key: 'render',
            value: function render() {
                var _props = this.props,
                    commits = _props.commits,
                    focusedCommitId = _props.focusedCommitId,
                    colWidth = _props.colWidth,
                    sliceHeight = _props.sliceHeight,
                    offsetX = _props.offsetX,
                    offsetY = _props.offsetY;


                if (!commits.length) {
                    return null;
                }

                var graph = this.buildGraph(commits);
                var width = offsetX + this.getMaxColumns(graph) * colWidth;
                var height = offsetY + graph.length * sliceHeight;

                return _react2.default.createElement(Graph, {
                    className: 'commit-graph',
                    graph: graph,
                    width: width,
                    height: height,
                    offsetX: offsetX,
                    offsetY: offsetY,
                    colWidth: colWidth,
                    sliceHeight: sliceHeight,
                    focusedId: focusedCommitId
                });
            }
        }]);
        return CommitGraph;
    }(_react.PureComponent);

    CommitGraph.defaultProps = {
        colWidth: 8,
        sliceHeight: 40,
        offsetX: 8, //Same as colWidth
        offsetY: 20 //Half sliceHeight
    };
    var Graph = exports.Graph = (0, _reactFunctional.pure)(function (_ref2) {
        var className = _ref2.className,
            graph = _ref2.graph,
            width = _ref2.width,
            height = _ref2.height,
            offsetX = _ref2.offsetX,
            offsetY = _ref2.offsetY,
            colWidth = _ref2.colWidth,
            sliceHeight = _ref2.sliceHeight,
            focusedId = _ref2.focusedId;
        return _react2.default.createElement(
            'svg',
            { className: className, width: width, height: height },
            graph.map(function (slice, index) {
                return _react2.default.createElement(Slice, babelHelpers.extends({ slice: slice, index: index, offsetX: offsetX, offsetY: offsetY, colWidth: colWidth, sliceHeight: sliceHeight }, {
                    focused: slice.id === focusedId,
                    key: 'slice-' + slice.id
                }));
            })
        );
    });

    var Slice = exports.Slice = function (_Component) {
        babelHelpers.inherits(Slice, _Component);

        function Slice() {
            babelHelpers.classCallCheck(this, Slice);
            return babelHelpers.possibleConstructorReturn(this, (Slice.__proto__ || Object.getPrototypeOf(Slice)).apply(this, arguments));
        }

        babelHelpers.createClass(Slice, [{
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(_ref3) {
                var slice = _ref3.slice,
                    focused = _ref3.focused;

                return !(0, _lodash.isEqual)(slice, this.props.slice) || focused !== this.props.focused;
            }
        }, {
            key: 'render',
            value: function render() {
                var _props2 = this.props,
                    slice = _props2.slice,
                    index = _props2.index,
                    offsetX = _props2.offsetX,
                    offsetY = _props2.offsetY,
                    colWidth = _props2.colWidth,
                    sliceHeight = _props2.sliceHeight,
                    focused = _props2.focused;
                var id = slice.id,
                    column = slice.column,
                    color = slice.color,
                    segments = slice.segments;

                var nodeX = offsetX + column * colWidth;
                var nodeY = offsetY + index * sliceHeight;

                return _react2.default.createElement(
                    _react.Fragment,
                    null,
                    segments.map(function (_ref4) {
                        var startColumn = _ref4.startColumn,
                            endColumn = _ref4.endColumn,
                            edgeColor = _ref4.color;

                        var fromX = offsetX + startColumn * colWidth;
                        var fromY = nodeY;
                        var toX = offsetX + endColumn * colWidth;
                        var toY = fromY + sliceHeight;
                        var buildPath = startColumn === endColumn ? line : curve;

                        return _react2.default.createElement('path', {
                            key: 'path-' + id + '-' + startColumn + '-' + endColumn,
                            d: buildPath(fromX, fromY, toX, toY),
                            className: 'color-' + edgeColor % 6
                        });
                    }),
                    _react2.default.createElement('circle', {
                        id: 'node-' + id,
                        key: 'node-' + id,
                        r: focused ? 4 : 3,
                        cx: nodeX,
                        cy: nodeY,
                        className: (0, _classnames2.default)('color-' + color % 6, { focused: focused })
                    })
                );
            }
        }]);
        return Slice;
    }(_react.Component);
});