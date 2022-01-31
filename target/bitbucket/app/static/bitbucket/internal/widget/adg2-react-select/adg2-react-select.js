define('bitbucket/internal/widget/adg2-react-select/adg2-react-select', ['exports', '@atlassian/aui', 'classnames', 'prop-types', 'react', 'react-select', 'bitbucket/internal/widget/icons/icons'], function (exports, _aui, _classnames, _propTypes, _react, _reactSelect, _icons) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.IconOption = exports.ADG2SelectCreatable = exports.ADG2SelectAsync = exports.ADG2SelectCreatableStateless = exports.ADG2SelectAsyncStateless = exports.ADG2SelectStateless = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactSelect2 = babelHelpers.interopRequireDefault(_reactSelect);

    var DropdownIcon = function DropdownIcon() {
        return _react2.default.createElement(_icons.ArrowDownSmallIcon, null);
    };

    var LABEL_REPLACE_STRING = '{label}';
    var ADG2_SELECT_CLASS = 'adg2-react-select';

    var ADGify = function ADGify(SelectComponent, arrowRenderer) {
        return function (props) {
            return _react2.default.createElement(SelectComponent, babelHelpers.extends({}, props, {
                className: (0, _classnames2.default)(props.className, ADG2_SELECT_CLASS),
                arrowRenderer: arrowRenderer
            }));
        };
    };

    var ADG2SelectStateless = exports.ADG2SelectStateless = ADGify(_reactSelect2.default, DropdownIcon);
    ADG2SelectStateless.defaultProps = {
        addLabelText: _aui.I18n.getText('bitbucket.web.widget.adg2select.addLabelText', LABEL_REPLACE_STRING),
        backspaceToRemoveMessage: _aui.I18n.getText('bitbucket.web.widget.adg2select.backspaceToRemoveMessage', LABEL_REPLACE_STRING),
        clearAllText: _aui.I18n.getText('bitbucket.web.widget.adg2select.clearAllText'),
        clearValueText: _aui.I18n.getText('bitbucket.web.widget.adg2select.clearValueText'),
        noResultsText: _aui.I18n.getText('bitbucket.web.widget.adg2select.noResultsText'),
        placeholder: _aui.I18n.getText('bitbucket.web.widget.adg2select.placeholder')
    };

    var ADG2SelectAsyncStateless = exports.ADG2SelectAsyncStateless = ADGify(_reactSelect2.default.Async, DropdownIcon);
    ADG2SelectAsyncStateless.defaultProps = babelHelpers.extends({}, ADG2SelectStateless.defaultProps, {
        loadingPlaceholder: _aui.I18n.getText('bitbucket.web.widget.adg2select.loadingPlaceholder'),
        searchPromptText: _aui.I18n.getText('bitbucket.web.widget.adg2select.searchPromptText')
    });

    var ADG2SelectCreatableStateless = exports.ADG2SelectCreatableStateless = ADGify(_reactSelect2.default.AsyncCreatable, null);
    ADG2SelectCreatableStateless.defaultProps = babelHelpers.extends({}, ADG2SelectAsyncStateless.defaultProps);

    var StatefulSelect = function (_Component) {
        babelHelpers.inherits(StatefulSelect, _Component);

        function StatefulSelect(props) {
            babelHelpers.classCallCheck(this, StatefulSelect);

            var _this = babelHelpers.possibleConstructorReturn(this, (StatefulSelect.__proto__ || Object.getPrototypeOf(StatefulSelect)).call(this, props));

            _this.onChange = function (value) {
                _this.setState({ value: value });
                _this.props.onChange && _this.props.onChange(value);
            };

            _this.state = { value: props.value };
            return _this;
        }

        babelHelpers.createClass(StatefulSelect, [{
            key: 'render',
            value: function render() {
                return _react2.default.createElement(this.SelectComponent, babelHelpers.extends({}, this.props, {
                    onChange: this.onChange,
                    value: this.state.value
                }));
            }
        }]);
        return StatefulSelect;
    }(_react.Component);

    StatefulSelect.propTypes = {
        onChange: _propTypes2.default.func
    };

    var ADG2Select = function (_StatefulSelect) {
        babelHelpers.inherits(ADG2Select, _StatefulSelect);

        function ADG2Select() {
            var _ref;

            var _temp, _this2, _ret;

            babelHelpers.classCallCheck(this, ADG2Select);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this2 = babelHelpers.possibleConstructorReturn(this, (_ref = ADG2Select.__proto__ || Object.getPrototypeOf(ADG2Select)).call.apply(_ref, [this].concat(args))), _this2), _this2.SelectComponent = ADG2SelectStateless, _temp), babelHelpers.possibleConstructorReturn(_this2, _ret);
        }

        return ADG2Select;
    }(StatefulSelect);

    exports.default = ADG2Select;

    var ADG2SelectAsync = exports.ADG2SelectAsync = function (_StatefulSelect2) {
        babelHelpers.inherits(ADG2SelectAsync, _StatefulSelect2);

        function ADG2SelectAsync() {
            var _ref2;

            var _temp2, _this3, _ret2;

            babelHelpers.classCallCheck(this, ADG2SelectAsync);

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return _ret2 = (_temp2 = (_this3 = babelHelpers.possibleConstructorReturn(this, (_ref2 = ADG2SelectAsync.__proto__ || Object.getPrototypeOf(ADG2SelectAsync)).call.apply(_ref2, [this].concat(args))), _this3), _this3.SelectComponent = ADG2SelectAsyncStateless, _temp2), babelHelpers.possibleConstructorReturn(_this3, _ret2);
        }

        return ADG2SelectAsync;
    }(StatefulSelect);

    var ADG2SelectCreatable = exports.ADG2SelectCreatable = function (_StatefulSelect3) {
        babelHelpers.inherits(ADG2SelectCreatable, _StatefulSelect3);

        function ADG2SelectCreatable() {
            var _ref3;

            var _temp3, _this4, _ret3;

            babelHelpers.classCallCheck(this, ADG2SelectCreatable);

            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            return _ret3 = (_temp3 = (_this4 = babelHelpers.possibleConstructorReturn(this, (_ref3 = ADG2SelectCreatable.__proto__ || Object.getPrototypeOf(ADG2SelectCreatable)).call.apply(_ref3, [this].concat(args))), _this4), _this4.SelectComponent = ADG2SelectCreatableStateless, _temp3), babelHelpers.possibleConstructorReturn(_this4, _ret3);
        }

        return ADG2SelectCreatable;
    }(StatefulSelect);

    //Convenience value/option renderer for icon + text options
    var IconOption = exports.IconOption = function IconOption(option) {
        var icon = option.icon,
            label = option.label;


        return _react2.default.createElement(
            'span',
            { className: ADG2_SELECT_CLASS + '-icon-option', title: label },
            icon,
            label
        );
    };
});