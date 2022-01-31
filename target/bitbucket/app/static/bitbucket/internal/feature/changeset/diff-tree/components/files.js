define('bitbucket/internal/feature/changeset/diff-tree/components/files', ['module', 'exports', 'classnames', 'prop-types', 'react', 'bitbucket/internal/widget/transitions/collapse-transition'], function (module, exports, _classnames, _propTypes, _react, _collapseTransition) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _collapseTransition2 = babelHelpers.interopRequireDefault(_collapseTransition);

    var Files = function (_PureComponent) {
        babelHelpers.inherits(Files, _PureComponent);

        function Files() {
            babelHelpers.classCallCheck(this, Files);
            return babelHelpers.possibleConstructorReturn(this, (Files.__proto__ || Object.getPrototypeOf(Files)).apply(this, arguments));
        }

        babelHelpers.createClass(Files, [{
            key: 'render',
            value: function render() {
                var _props = this.props,
                    isCollapsed = _props.isCollapsed,
                    children = _props.children,
                    isRoot = _props.isRoot;

                var className = (0, _classnames2.default)('files', {
                    'root-directory': isRoot
                });

                if (isRoot) {
                    return _react2.default.createElement(
                        'ul',
                        { className: className },
                        children
                    );
                }

                return _react2.default.createElement(
                    _collapseTransition2.default,
                    { isCollapsed: isCollapsed },
                    function (styles) {
                        return _react2.default.createElement(
                            'ul',
                            { className: className, style: styles },
                            children
                        );
                    }
                );
            }
        }]);
        return Files;
    }(_react.PureComponent);

    Files.propTypes = {
        children: _propTypes2.default.node.isRequired,
        isCollapsed: _propTypes2.default.bool,
        isRoot: _propTypes2.default.bool
    };
    Files.defaultProps = {
        isCollapsed: false,
        isRoot: false
    };
    exports.default = Files;
    module.exports = exports['default'];
});