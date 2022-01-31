define('bitbucket/internal/bbui/branch-from-to/branch-from-to', ['module', 'exports', '@atlassian/aui', 'classnames', 'prop-types', 'react', 'react-dom', '../aui-react/avatar'], function (module, exports, _aui, _classnames, _propTypes, _react, _reactDom, _avatar) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var propTypes = {
        fromRef: _propTypes2.default.object.isRequired,
        toRef: _propTypes2.default.object.isRequired
    };

    var BranchFromTo = function (_Component) {
        babelHelpers.inherits(BranchFromTo, _Component);

        function BranchFromTo() {
            babelHelpers.classCallCheck(this, BranchFromTo);
            return babelHelpers.possibleConstructorReturn(this, (BranchFromTo.__proto__ || Object.getPrototypeOf(BranchFromTo)).apply(this, arguments));
        }

        babelHelpers.createClass(BranchFromTo, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var node = (0, _reactDom.findDOMNode)(this);
                _aui2.default.$('.ref-name', node).tooltip();
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                var node = (0, _reactDom.findDOMNode)(this);
                _aui2.default.$('.ref-name', node).tooltip('destroy');
            }
        }, {
            key: 'refItem',
            value: function refItem(ref, type, sameProject, sameRepo) {
                var showProject = !sameProject;
                var showRepo = sameProject && !sameRepo;
                var avatar = this.projectAvatar(ref, showProject);

                return _react2.default.createElement(
                    'div',
                    {
                        className: (0, _classnames2.default)('ref-name', 'ref-name-' + type, {
                            'with-avatar': avatar
                        }),
                        title: this.refTitle(ref)
                    },
                    avatar,
                    this.displayTitle(ref, showRepo)
                );
            }
        }, {
            key: 'projectAvatar',
            value: function projectAvatar(ref, differentProject) {
                if (differentProject) {
                    return _react2.default.createElement(
                        'span',
                        { className: 'avatar-to-project avatar-ref-project' },
                        _react2.default.createElement(_avatar.ProjectAvatar, { size: 'xsmall', project: ref.repository.project, tagName: 'span' })
                    );
                }
            }
        }, {
            key: 'displayTitle',
            value: function displayTitle(ref, showRepo) {
                if (showRepo) {
                    return _react2.default.createElement(
                        'span',
                        null,
                        _react2.default.createElement(
                            'span',
                            { className: 'repo-name' },
                            ref.repository.name
                        ),
                        _react2.default.createElement('span', { className: 'repo-name-icon' }),
                        _react2.default.createElement(
                            'span',
                            { className: 'branch-name' },
                            ref.displayId
                        )
                    );
                }
                return _react2.default.createElement(
                    'span',
                    { className: 'branch-name' },
                    ref.displayId
                );
            }
        }, {
            key: 'refTitle',
            value: function refTitle(ref) {
                return ref.repository.project.name + ' / ' + ref.repository.name + ' : ' + ref.displayId;
            }
        }, {
            key: 'render',
            value: function render() {
                var _props = this.props,
                    fromRef = _props.fromRef,
                    toRef = _props.toRef;

                var sameProject = fromRef.repository.project.id === toRef.repository.project.id;
                var sameRepo = fromRef.repository.id === toRef.repository.id;

                return _react2.default.createElement(
                    'div',
                    { className: 'branch-from-to' },
                    this.refItem(fromRef, 'from', sameProject, sameRepo),
                    _react2.default.createElement(
                        'div',
                        { className: 'aui-icon aui-icon-small aui-iconfont-devtools-arrow-right arrow' },
                        'to'
                    ),
                    this.refItem(toRef, 'to', sameProject, sameRepo)
                );
            }
        }]);
        return BranchFromTo;
    }(_react.Component);

    BranchFromTo.propTypes = propTypes;

    exports.default = BranchFromTo;
    module.exports = exports['default'];
});