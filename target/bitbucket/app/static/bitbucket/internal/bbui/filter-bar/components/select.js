define('bitbucket/internal/bbui/filter-bar/components/select', ['module', 'exports', 'jquery', 'lodash', 'prop-types', 'react', 'react-dom', './filter'], function (module, exports, _jquery, _lodash, _propTypes, _react, _reactDom, _filter) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _filter2 = babelHelpers.interopRequireDefault(_filter);

    var Select = function (_Filter) {
        babelHelpers.inherits(Select, _Filter);

        function Select() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, Select);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = Select.__proto__ || Object.getPrototypeOf(Select)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = function () {
                return false;
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(Select, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                var defaults = {
                    minimumResultsForSearch: -1 // don't show the search box.
                };
                var overrides = {};
                var $filter = this.get$Input();
                $filter.auiSelect2(_lodash2.default.assign(defaults, this.props.menu, overrides));
                $filter.on('change', function () {
                    return _this2.props.onChange();
                });
            }
        }, {
            key: 'get$Input',
            value: function get$Input() {
                return (0, _jquery2.default)(_reactDom2.default.findDOMNode(this)).children('select');
            }
        }, {
            key: 'render',
            value: function render() {
                return _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: this.props.id, className: 'assistive' },
                        this.props.label
                    ),
                    _react2.default.createElement(
                        'select',
                        { id: this.props.id, value: this.props.value, readOnly: true },
                        this.props.menu.items.map(function (item) {
                            return _react2.default.createElement(
                                'option',
                                { key: item.id, value: item.id, disabled: item.disabled },
                                item.text
                            );
                        })
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
                return this.get$Input().val();
            }
        }, {
            key: 'set',
            value: function set(value) {
                var $filter = this.get$Input();
                $filter.select2('val', value || this.props.menu.items[0].id);
                return _jquery2.default.Deferred().resolve();
            }
        }], [{
            key: 'propTypes',
            get: function get() {
                return {
                    id: _propTypes2.default.string.isRequired,
                    label: _propTypes2.default.string.isRequired,
                    menu: _propTypes2.default.any,
                    onChange: _propTypes2.default.func,
                    value: _propTypes2.default.string
                };
            }
        }]);
        return Select;
    }(_filter2.default);

    exports.default = Select;
    module.exports = exports['default'];
});