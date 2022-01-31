define('bitbucket/internal/bbui/aui-react/form', ['exports', 'classnames', 'prop-types', 'react'], function (exports, _classnames, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Radio = exports.RadioGroup = exports.Checkbox = exports.TextField = exports.Error = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var Error = function Error(_ref) {
        var error = _ref.error;

        if (!error) {
            return null;
        }
        if (error.length === 1) {
            return _react2.default.createElement(
                'p',
                { className: 'error', key: error[0] },
                error[0]
            );
        }
        return _react2.default.createElement(
            'ul',
            { className: 'error' },
            error.map(function (err) {
                return _react2.default.createElement(
                    'li',
                    { key: err },
                    err
                );
            })
        );
    };

    Error.propTypes = {
        error: _propTypes2.default.array
    };

    var TextField = function TextField(_ref2) {
        var _ref2$required = _ref2.required,
            required = _ref2$required === undefined ? false : _ref2$required,
            title = _ref2.title,
            name = _ref2.name,
            description = _ref2.description,
            descriptionHtml = _ref2.descriptionHtml,
            onChange = _ref2.onChange,
            value = _ref2.value,
            _ref2$errors = _ref2.errors,
            errors = _ref2$errors === undefined ? [] : _ref2$errors,
            size = _ref2.size,
            maxLength = _ref2.maxLength,
            _ref2$autoFocus = _ref2.autoFocus,
            autoFocus = _ref2$autoFocus === undefined ? false : _ref2$autoFocus,
            _ref2$autoComplete = _ref2.autoComplete,
            autoComplete = _ref2$autoComplete === undefined ? true : _ref2$autoComplete;

        var requiredElement = required ? _react2.default.createElement(
            'span',
            { className: 'aui-icon icon-required' },
            '(required)'
        ) : null;
        var descriptionDiv = descriptionHtml ? _react2.default.createElement('div', { className: 'description', dangerouslySetInnerHTML: descriptionHtml }) : _react2.default.createElement(
            'div',
            { className: 'description' },
            description
        );

        return _react2.default.createElement(
            'div',
            { className: 'field-group' },
            _react2.default.createElement(
                'label',
                { htmlFor: 'title' },
                title,
                requiredElement
            ),
            _react2.default.createElement('input', {
                className: (0, _classnames2.default)('text', size && size + '-field'),
                type: 'text',
                id: name,
                name: name,
                value: value,
                onChange: onChange,
                maxLength: maxLength,
                autoFocus: autoFocus,
                autoComplete: autoComplete ? 'on' : 'off'
            }),
            descriptionDiv,
            _react2.default.createElement(Error, { error: errors })
        );
    };

    TextField.propTypes = {
        required: _propTypes2.default.bool,
        description: _propTypes2.default.string,
        descriptionHtml: _propTypes2.default.object,
        title: _propTypes2.default.string.isRequired,
        name: _propTypes2.default.string.isRequired,
        onChange: _propTypes2.default.func,
        value: _propTypes2.default.string,
        errors: _propTypes2.default.array,
        size: _propTypes2.default.oneOf(['short', 'medium', 'medium-long', 'long', 'full-width']),
        maxLength: _propTypes2.default.number,
        autoFocus: _propTypes2.default.bool,
        autoComplete: _propTypes2.default.bool
    };

    var Checkbox = function Checkbox(_ref3) {
        var _ref3$checked = _ref3.checked,
            checked = _ref3$checked === undefined ? false : _ref3$checked,
            description = _ref3.description,
            _ref3$disabled = _ref3.disabled,
            disabled = _ref3$disabled === undefined ? false : _ref3$disabled,
            label = _ref3.label,
            name = _ref3.name,
            id = _ref3.id,
            onChange = _ref3.onChange,
            autoFocus = _ref3.autoFocus;
        return _react2.default.createElement(
            'div',
            { className: 'checkbox' },
            _react2.default.createElement('input', {
                'data-grouping': 'trigger',
                className: 'checkbox',
                type: 'checkbox',
                name: name,
                id: id || name,
                onChange: onChange,
                checked: checked,
                disabled: disabled,
                autoFocus: autoFocus
            }),
            _react2.default.createElement(
                'label',
                { htmlFor: id || name },
                label
            ),
            _react2.default.createElement(
                'div',
                { className: 'description' },
                description
            )
        );
    };
    Checkbox.propTypes = {
        checked: _propTypes2.default.bool,
        description: _propTypes2.default.string,
        disabled: _propTypes2.default.bool,
        label: _propTypes2.default.string.isRequired,
        name: _propTypes2.default.string.isRequired,
        id: _propTypes2.default.string,
        onChange: _propTypes2.default.func,
        autoFocus: _propTypes2.default.bool
    };

    var RadioGroup = function RadioGroup(_ref4) {
        var children = _ref4.children,
            name = _ref4.name,
            label = _ref4.label,
            onChange = _ref4.onChange,
            value = _ref4.value;

        var radios = _react2.default.Children.map(children, function (child, index) {
            return _react2.default.cloneElement(child, {
                id: child.props.id || name + '-' + (index + 1),
                name: name,
                onChange: onChange,
                checked: value === child.props.value
            });
        });
        return _react2.default.createElement(
            'fieldset',
            { className: 'group' },
            _react2.default.createElement(
                'legend',
                null,
                _react2.default.createElement(
                    'span',
                    null,
                    label
                )
            ),
            radios
        );
    };

    RadioGroup.propTypes = {
        children: _propTypes2.default.node,
        label: _propTypes2.default.string.isRequired,
        name: _propTypes2.default.string.isRequired,
        onChange: _propTypes2.default.func.isRequired,
        value: _propTypes2.default.string
    };

    var Radio = function Radio(_ref5) {
        var id = _ref5.id,
            name = _ref5.name,
            label = _ref5.label,
            _onChange = _ref5.onChange,
            checked = _ref5.checked,
            value = _ref5.value,
            description = _ref5.description,
            autoFocus = _ref5.autoFocus;
        return _react2.default.createElement(
            'div',
            { className: 'radio' },
            _react2.default.createElement('input', {
                autoFocus: autoFocus,
                className: 'radio',
                type: 'radio',
                checked: checked,
                name: name,
                id: id || name,
                onChange: function onChange() {
                    return _onChange(value);
                }
            }),
            _react2.default.createElement(
                'label',
                { htmlFor: id || name },
                label
            ),
            description && _react2.default.createElement(
                'div',
                { className: 'description' },
                description
            )
        );
    };

    Radio.propTypes = {
        name: _propTypes2.default.string, // not required because it's provided by RadioGroup
        id: _propTypes2.default.string,
        checked: _propTypes2.default.bool,
        label: _propTypes2.default.oneOfType([_propTypes2.default.string.isRequired, _propTypes2.default.object.isRequired]), // accepts object as a type to allow for icons
        onChange: _propTypes2.default.func, // not "required" because it's provided by RadioGroup
        value: _propTypes2.default.string.isRequired,
        description: _propTypes2.default.string,
        autoFocus: _propTypes2.default.bool
    };

    exports.Error = Error;
    exports.TextField = TextField;
    exports.Checkbox = Checkbox;
    exports.RadioGroup = RadioGroup;
    exports.Radio = Radio;
});