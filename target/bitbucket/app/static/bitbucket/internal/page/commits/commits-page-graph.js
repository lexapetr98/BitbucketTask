define('bitbucket/internal/page/commits/commits-page-graph', ['exports', 'lodash', 'react', 'bitbucket/util/events', 'bitbucket/internal/feature/commit-graph/commit-graph'], function (exports, _lodash, _react, _events, _commitGraph) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.CommitsPageGraph = undefined;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var emptyArray = []; //Enable PureComponent to avoid re-renders by reusing the same empty array

    var getRowCommit = function getRowCommit(row) {
        return JSON.parse(row.getAttribute('data-commit-json'));
    };

    var parseCommits = function parseCommits(tableRows) {
        return tableRows.map(getRowCommit);
    };

    var CommitsPageGraph = exports.CommitsPageGraph = function (_PureComponent) {
        babelHelpers.inherits(CommitsPageGraph, _PureComponent);

        function CommitsPageGraph() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, CommitsPageGraph);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = CommitsPageGraph.__proto__ || Object.getPrototypeOf(CommitsPageGraph)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _this.addCommits = function (_ref2) {
                var $tableRows = _ref2.values;
                return setTimeout(function () {
                    _this.setState(function (_ref3) {
                        var commits = _ref3.commits;
                        return {
                            commits: commits.concat(parseCommits($tableRows.toArray()))
                        };
                    });
                });
            }, _this.focusCommit = function (row) {
                _this.setState({
                    focusedCommitId: getRowCommit(row).id
                });
            }, _this.reset = function () {
                return _this.setState({ commits: emptyArray });
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(CommitsPageGraph, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                _events2.default.on('bitbucket.internal.widget.commitsTable.contentAdded', this.addCommits);
                _events2.default.on('bitbucket.internal.widget.commitsTable.rowFocused', this.focusCommit);
                _events2.default.on('bitbucket.internal.history.changestate', this.reset);
                _events2.default.on('bitbucket.internal.layout.branch.revisionRefChanged', this.reset);
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                _events2.default.off('bitbucket.internal.widget.commitsTable.contentAdded', this.addCommits);
                _events2.default.off('bitbucket.internal.widget.commitsTable.rowFocused', this.focusCommit);
                _events2.default.off('bitbucket.internal.history.changestate', this.reset);
                _events2.default.off('bitbucket.internal.layout.branch.revisionRefChanged', this.reset);
            }
        }, {
            key: 'render',
            value: function render() {
                var _state = this.state,
                    commits = _state.commits,
                    focusedCommitId = _state.focusedCommitId;
                var _props = this.props,
                    headerRowHeight = _props.headerRowHeight,
                    rowHeight = _props.rowHeight;


                return _react2.default.createElement(_commitGraph.CommitGraph, {
                    commits: commits,
                    focusedCommitId: focusedCommitId,
                    offsetY: Math.round(rowHeight / 2) + headerRowHeight,
                    sliceHeight: rowHeight
                });
            }
        }], [{
            key: 'getDerivedStateFromProps',
            value: function getDerivedStateFromProps(_ref4, state) {
                var initialRows = _ref4.initialRows;

                if (!state.commits) {
                    //First time only
                    return {
                        commits: initialRows ? parseCommits(initialRows) : emptyArray
                    };
                }

                return null;
            }
        }]);
        return CommitsPageGraph;
    }(_react.PureComponent);
});