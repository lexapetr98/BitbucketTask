define('bitbucket/internal/feature/labels/repository/label-option', ['module', 'exports', 'prop-types', 'react', './closeable-label'], function (module, exports, _propTypes, _react, _closeableLabel) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _closeableLabel2 = babelHelpers.interopRequireDefault(_closeableLabel);

    var LabelOption = function (_PureComponent) {
        babelHelpers.inherits(LabelOption, _PureComponent);

        function LabelOption() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, LabelOption);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = LabelOption.__proto__ || Object.getPrototypeOf(LabelOption)).call.apply(_ref, [this].concat(args))), _this), _this.onRemove = function () {
                _this.props.onRemove(_this.props.value);
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(LabelOption, [{
            key: 'render',
            value: function render() {
                var label = this.props.value.label;


                return _react2.default.createElement(_closeableLabel2.default, { label: label, onRemove: this.onRemove });
            }
        }]);
        return LabelOption;
    }(_react.PureComponent);

    LabelOption.propTypes = {
        value: _propTypes2.default.shape({
            label: _propTypes2.default.string.isRequired,
            value: _propTypes2.default.string.isRequired
        }).isRequired,
        onRemove: _propTypes2.default.func.isRequired
    };
    exports.default = LabelOption;
    module.exports = exports['default'];
});