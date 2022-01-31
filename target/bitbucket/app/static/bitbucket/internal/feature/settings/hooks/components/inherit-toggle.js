define('bitbucket/internal/feature/settings/hooks/components/inherit-toggle', ['exports', '@atlassian/aui', 'prop-types', 'react', 'bitbucket/internal/bbui/aui-react/spinner', 'bitbucket/internal/widget/adg2-react-select/adg2-react-select', 'bitbucket/internal/widget/icons/icons'], function (exports, _aui, _propTypes, _react, _spinner, _adg2ReactSelect, _icons) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.toggleStatus = undefined;

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _spinner2 = babelHelpers.interopRequireDefault(_spinner);

    var _options;

    var toggleStatus = exports.toggleStatus = {
        INHERITED: 'INHERITED',
        INHERITED_ENABLED: 'INHERITED_ENABLED',
        INHERITED_DISABLED: 'INHERITED_DISABLED',
        ENABLED: 'ENABLED',
        DISABLED: 'DISABLED'
    };

    var INHERITED = toggleStatus.INHERITED,
        INHERITED_ENABLED = toggleStatus.INHERITED_ENABLED,
        INHERITED_DISABLED = toggleStatus.INHERITED_DISABLED,
        ENABLED = toggleStatus.ENABLED,
        DISABLED = toggleStatus.DISABLED;


    var options = (_options = {}, babelHelpers.defineProperty(_options, INHERITED, {
        value: INHERITED,
        icon: null,
        label: _aui.I18n.getText('bitbucket.web.hooks.inherit.status.inherited'),
        className: 'inherited'
    }), babelHelpers.defineProperty(_options, INHERITED_ENABLED, {
        value: INHERITED_ENABLED,
        icon: _react2.default.createElement(_icons.CheckIcon, { className: 'option-icon option-icon-enabled' }),
        label: _aui.I18n.getText('bitbucket.web.hooks.inherit.status.inherited.enabled'),
        className: 'inherited enabled'
    }), babelHelpers.defineProperty(_options, INHERITED_DISABLED, {
        value: INHERITED_DISABLED,
        icon: _react2.default.createElement(_icons.CrossIcon, { className: 'option-icon option-icon-disabled' }),
        label: _aui.I18n.getText('bitbucket.web.hooks.inherit.status.inherited.disabled'),
        className: 'inherited disabled'
    }), babelHelpers.defineProperty(_options, ENABLED, {
        value: ENABLED,
        icon: _react2.default.createElement(_icons.CheckIcon, { className: 'option-icon option-icon-enabled' }),
        label: _aui.I18n.getText('bitbucket.web.hooks.inherit.status.enabled'),
        className: 'enabled'
    }), babelHelpers.defineProperty(_options, DISABLED, {
        value: DISABLED,
        icon: _react2.default.createElement(_icons.CrossIcon, { className: 'option-icon option-icon-disabled' }),
        label: _aui.I18n.getText('bitbucket.web.hooks.inherit.status.disabled'),
        className: 'disabled'
    }), _options);

    var getOptions = function getOptions(canInherit, enabled, inherited) {
        var basicOptions = [options[ENABLED], options[DISABLED]];

        if (!canInherit) {
            return basicOptions;
        }

        if (inherited) {
            return [options[enabled ? INHERITED_ENABLED : INHERITED_DISABLED]].concat(basicOptions);
        }

        //If the toggle isn't initially inherited, we can't know what choosing inherited will do ahead of time,
        //so just show a generic INHERITED option
        return [options[INHERITED]].concat(basicOptions);
    };

    var getSelectedFromProps = function getSelectedFromProps(_ref) {
        var inherited = _ref.inherited,
            enabled = _ref.enabled;

        if (inherited) {
            return enabled ? INHERITED_ENABLED : INHERITED_DISABLED;
        }

        return enabled ? ENABLED : DISABLED;
    };

    var busyValue = function busyValue() {
        return _react2.default.createElement(
            'span',
            { className: 'busy-value' },
            _react2.default.createElement(_spinner2.default, null),
            _aui.I18n.getText('bitbucket.web.hooks.inherit.toggle.saving')
        );
    };

    var InheritToggle = function (_Component) {
        babelHelpers.inherits(InheritToggle, _Component);

        function InheritToggle() {
            var _ref2;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, InheritToggle);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref2 = InheritToggle.__proto__ || Object.getPrototypeOf(InheritToggle)).call.apply(_ref2, [this].concat(args))), _this), _this.state = {
                selected: false
            }, _this.onChange = function (newSelection) {
                var onChange = _this.props.onChange;


                if (newSelection === _this.state.selected) {
                    //No-op if the selection is the same
                    return;
                }

                onChange && onChange(newSelection);
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(InheritToggle, [{
            key: 'render',
            value: function render() {
                var _props = this.props,
                    busy = _props.busy,
                    canInherit = _props.canInherit,
                    inherited = _props.inherited,
                    disabled = _props.disabled,
                    enabled = _props.enabled;
                var selected = this.state.selected;


                return _react2.default.createElement(_adg2ReactSelect.ADG2SelectStateless, {
                    className: 'inherit-toggle',
                    clearable: false,
                    disabled: disabled || busy,
                    name: 'inherit-toggle',
                    onChange: this.onChange,
                    optionRenderer: _adg2ReactSelect.IconOption,
                    options: getOptions(canInherit, enabled, inherited),
                    searchable: false,
                    simpleValue: true,
                    value: selected,
                    valueRenderer: busy ? busyValue : _adg2ReactSelect.IconOption
                });
            }
        }], [{
            key: 'getDerivedStateFromProps',
            value: function getDerivedStateFromProps(nextProps) {
                return { selected: getSelectedFromProps(nextProps) };
            }
        }]);
        return InheritToggle;
    }(_react.Component);

    InheritToggle.propTypes = {
        busy: _propTypes2.default.bool, //Whether to show the spinner and "saving" state.
        canInherit: _propTypes2.default.bool, //If the hook can be inherited
        inherited: _propTypes2.default.bool, //Whether the hook is inherited
        disabled: _propTypes2.default.bool, //Whether the toggle itself is disabled
        enabled: _propTypes2.default.bool //Whether the hook is enabled
    };
    exports.default = InheritToggle;
});