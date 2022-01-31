define('bitbucket/internal/feature/labels/repository/label', ['module', 'exports', '@atlassian/aui', 'prop-types', 'react'], function (module, exports, _aui, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var Label = function (_PureComponent) {
        babelHelpers.inherits(Label, _PureComponent);

        function Label() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, Label);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = Label.__proto__ || Object.getPrototypeOf(Label)).call.apply(_ref, [this].concat(args))), _this), _this.onClick = function (event) {
                event.preventDefault();

                _this.props.onClick(_this.props.label);
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(Label, [{
            key: 'render',
            value: function render() {
                var label = this.props.label;


                return _react2.default.createElement(
                    'button',
                    { className: 'aui-label', onClick: this.onClick, title: label },
                    label
                );
            }
        }]);
        return Label;
    }(_react.PureComponent);

    Label.propTypes = {
        label: _propTypes2.default.string.isRequired,
        onClick: _propTypes2.default.func
    };
    Label.defaultProps = {
        onClick: function onClick() {}
    };
    exports.default = Label;
    module.exports = exports['default'];
});