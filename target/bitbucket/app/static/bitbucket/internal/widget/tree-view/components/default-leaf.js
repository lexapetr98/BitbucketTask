define('bitbucket/internal/widget/tree-view/components/default-leaf', ['module', 'exports', 'prop-types', 'react'], function (module, exports, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var DefaultLeaf = function (_PureComponent) {
        babelHelpers.inherits(DefaultLeaf, _PureComponent);

        function DefaultLeaf() {
            babelHelpers.classCallCheck(this, DefaultLeaf);
            return babelHelpers.possibleConstructorReturn(this, (DefaultLeaf.__proto__ || Object.getPrototypeOf(DefaultLeaf)).apply(this, arguments));
        }

        babelHelpers.createClass(DefaultLeaf, [{
            key: 'render',
            value: function render() {
                var name = this.props.name;


                return _react2.default.createElement(
                    'li',
                    null,
                    name
                );
            }
        }]);
        return DefaultLeaf;
    }(_react.PureComponent);

    DefaultLeaf.propTypes = {
        name: _propTypes2.default.node.isRequired
    };
    exports.default = DefaultLeaf;
    module.exports = exports['default'];
});