define('bitbucket/internal/bbui/filter-bar/components/toggle', ['module', 'exports', 'jquery', 'prop-types', 'react', './filter'], function (module, exports, _jquery, _propTypes, _react, _filter) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _filter2 = babelHelpers.interopRequireDefault(_filter);

    var Toggle = function (_Filter) {
        babelHelpers.inherits(Toggle, _Filter);
        babelHelpers.createClass(Toggle, null, [{
            key: 'propTypes',
            get: function get() {
                return {
                    id: _propTypes2.default.string.isRequired,
                    label: _propTypes2.default.string.isRequired,
                    onChange: _propTypes2.default.func,
                    value: _propTypes2.default.bool.isRequired
                };
            }
        }]);

        function Toggle() {
            var _ref;

            babelHelpers.classCallCheck(this, Toggle);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var _this = babelHelpers.possibleConstructorReturn(this, (_ref = Toggle.__proto__ || Object.getPrototypeOf(Toggle)).call.apply(_ref, [this].concat(args)));

            _this.state = {
                pressed: _this.props.value
            };
            return _this;
        }

        babelHelpers.createClass(Toggle, [{
            key: 'render',
            value: function render() {
                var _this2 = this;

                return _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'button',
                        {
                            className: 'aui-button aui-button-subtle',
                            id: this.props.id,
                            'aria-pressed': this.state.pressed,
                            onClick: function onClick() {
                                _this2.setState({
                                    pressed: !_this2.state.pressed
                                }, function () {
                                    if (_this2.props.onChange) {
                                        _this2.props.onChange();
                                    }
                                });
                            }
                        },
                        this.props.label
                    )
                );
            }
        }, {
            key: 'value',
            value: function value() {
                return this.props.value;
            }
        }, {
            key: 'domValue',
            value: function domValue() {
                return this.state.pressed;
            }
        }, {
            key: 'set',
            value: function set(value) {
                var def = _jquery2.default.Deferred();
                this.setState({
                    pressed: value
                }, def.resolve.bind(def));
                return def;
            }
        }]);
        return Toggle;
    }(_filter2.default);

    exports.default = Toggle;
    module.exports = exports['default'];
});