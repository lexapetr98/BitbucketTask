define('bitbucket/internal/bbui/aui-react/toggle-button', ['module', 'exports', 'lodash', 'prop-types', 'react'], function (module, exports, _lodash, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var ToggleButton = function (_Component) {
        babelHelpers.inherits(ToggleButton, _Component);

        function ToggleButton() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, ToggleButton);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = ToggleButton.__proto__ || Object.getPrototypeOf(ToggleButton)).call.apply(_ref, [this].concat(args))), _this), _this.onToggle = function (_ref2) {
                var checked = _ref2.target.checked;
                var onToggle = _this.props.onToggle;


                if (onToggle) {
                    onToggle(checked);
                }
            }, _this.setBooleanProps = function (props) {
                ToggleButton.booleanProps.forEach(function (prop) {
                    _this.toggle[prop] = props[prop];
                });
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(ToggleButton, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                this.toggle.addEventListener('change', this.onToggle);

                this.setBooleanProps(this.props);

                // I'm not exactly sure why, but Firefox and IE11 need the defer here in order to set the initial value for the boolean props correctly
                // (otherwise it's not set until the next render)
                setTimeout(function () {
                    return _this2.setBooleanProps(_this2.props);
                });
            }
        }, {
            key: 'componentDidUpdate',
            value: function componentDidUpdate() {
                this.setBooleanProps(this.props);
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                this.toggle.removeEventListener('change', this.onToggle);
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                return _react2.default.createElement('aui-toggle', babelHelpers.extends({
                    ref: function ref(toggle) {
                        _this3.toggle = toggle;
                    }
                }, (0, _lodash.omit)(this.props, ToggleButton.booleanProps.concat('onToggle'))));
            }
        }]);
        return ToggleButton;
    }(_react.Component);

    ToggleButton.booleanProps = ['checked', 'disabled', 'busy'];
    ToggleButton.propTypes = {
        busy: _propTypes2.default.bool,
        checked: _propTypes2.default.bool,
        disabled: _propTypes2.default.bool,
        label: _propTypes2.default.string.isRequired,
        onToggle: _propTypes2.default.func
    };
    exports.default = ToggleButton;
    module.exports = exports['default'];
});