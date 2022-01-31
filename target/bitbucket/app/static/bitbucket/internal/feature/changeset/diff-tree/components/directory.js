define('bitbucket/internal/feature/changeset/diff-tree/components/directory', ['module', 'exports', 'prop-types', 'react', 'bitbucket/internal/widget/icons/icons'], function (module, exports, _propTypes, _react, _icons) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var Directory = function (_PureComponent) {
        babelHelpers.inherits(Directory, _PureComponent);

        function Directory() {
            babelHelpers.classCallCheck(this, Directory);
            return babelHelpers.possibleConstructorReturn(this, (Directory.__proto__ || Object.getPrototypeOf(Directory)).apply(this, arguments));
        }

        babelHelpers.createClass(Directory, [{
            key: 'render',
            value: function render() {
                var _props = this.props,
                    id = _props.id,
                    isCollapsed = _props.isCollapsed,
                    toggleCollapse = _props.toggleCollapse,
                    name = _props.name;

                var CollapseIcon = isCollapsed ? _icons.ChevronRight : _icons.ChevronDown;

                return _react2.default.createElement(
                    'div',
                    { className: 'directory' },
                    _react2.default.createElement(
                        'button',
                        {
                            className: 'aui-button aui-button-link collapse-button',
                            onClick: function onClick() {
                                return toggleCollapse(id);
                            }
                        },
                        _react2.default.createElement(CollapseIcon, { className: 'collapse-icon' })
                    ),
                    _react2.default.createElement(
                        'button',
                        { className: 'directory-label', onClick: function onClick() {
                                return toggleCollapse(id);
                            } },
                        _react2.default.createElement(_icons.FolderFilled, null),
                        name
                    )
                );
            }
        }]);
        return Directory;
    }(_react.PureComponent);

    Directory.propTypes = {
        name: _propTypes2.default.node.isRequired,
        toggleCollapse: _propTypes2.default.func.isRequired,
        isCollapsed: _propTypes2.default.bool
    };
    Directory.defaultProps = {
        isCollapsed: false
    };
    exports.default = Directory;
    module.exports = exports['default'];
});