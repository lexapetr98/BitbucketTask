define('bitbucket/internal/feature/settings/hooks/components/hook-config-dialog', ['module', 'exports', '@atlassian/aui', 'classnames', 'lodash', 'react', 'react-dom', 'bitbucket/internal/bbui/aui-react/dialog', 'bitbucket/internal/bbui/aui-react/spinner', 'bitbucket/internal/util/form', '../hook-config-form-util'], function (module, exports, _aui, _classnames, _lodash, _react, _reactDom, _dialog, _spinner, _form, _hookConfigFormUtil) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _dialog2 = babelHelpers.interopRequireDefault(_dialog);

    var _spinner2 = babelHelpers.interopRequireDefault(_spinner);

    var _hookConfigFormUtil2 = babelHelpers.interopRequireDefault(_hookConfigFormUtil);

    var formElsSelector = ['button', 'input', 'select', 'textarea'].map(function (el) {
        return el + ':enabled';
    }).join(',');
    var castArray = function castArray(maybeArray) {
        return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
    };
    var buttonClass = function buttonClass(type) {
        return (0, _classnames2.default)('aui-button', babelHelpers.defineProperty({}, 'aui-button-' + type, type));
    };

    var Errors = function Errors(_ref) {
        var _ref$errors = _ref.errors,
            errors = _ref$errors === undefined ? [] : _ref$errors;
        return _react2.default.createElement(
            'div',
            { className: 'errors-container' },
            castArray(errors).map(function (error) {
                return _react2.default.createElement(
                    'div',
                    { key: error, className: 'aui-message aui-message-error' },
                    _react2.default.createElement(
                        'p',
                        null,
                        error
                    )
                );
            })
        );
    };

    var HookConfigDialogFooter = function HookConfigDialogFooter(_ref2) {
        var enabled = _ref2.enabled,
            ready = _ref2.ready,
            saving = _ref2.saving,
            onCancel = _ref2.onCancel,
            onSave = _ref2.onSave;

        return _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
                'button',
                { className: buttonClass('primary'), disabled: !ready || saving, onClick: onSave },
                saving && _react2.default.createElement(_spinner2.default, null),
                enabled ? _aui.I18n.getText('bitbucket.web.button.save') : _aui.I18n.getText('bitbucket.web.button.enable')
            ),
            _react2.default.createElement(
                'button',
                { className: buttonClass('link'), disabled: saving, onClick: onCancel, autoFocus: true },
                _aui.I18n.getText('bitbucket.web.button.cancel')
            )
        );
    };

    var ConfigForm = function (_Component) {
        babelHelpers.inherits(ConfigForm, _Component);

        function ConfigForm() {
            var _ref3;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, ConfigForm);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref3 = ConfigForm.__proto__ || Object.getPrototypeOf(ConfigForm)).call.apply(_ref3, [this].concat(args))), _this), _this.evalConfigScripts = (0, _lodash.debounce)(function () {
                //Maintain backwards compatibility with script tags embedded in the config form
                if (_this.form) {
                    //don't attempt if the form has been unmounted
                    var configFormScripts = _this.form.querySelectorAll('.html-contents script');
                    // eslint-disable-next-line no-eval
                    (0, _lodash.forEach)(configFormScripts, function (script) {
                        return eval(script.innerHTML);
                    });
                }
            }, 100), _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(ConfigForm, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                //Focus the first form element
                var firstFormEl = this.form.querySelector(formElsSelector);
                firstFormEl && firstFormEl.focus();

                this.evalConfigScripts();
            }
        }, {
            key: 'componentDidUpdate',
            value: function componentDidUpdate() {
                this.evalConfigScripts();
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                var _props = this.props,
                    contents = _props.children,
                    errors = _props.errors;


                return _react2.default.createElement(
                    'form',
                    {
                        ref: function ref(form) {
                            _this2.form = form;
                        },
                        className: 'aui',
                        onSubmit: function onSubmit(e) {
                            return e.preventDefault();
                        }
                    },
                    _react2.default.createElement(Errors, { errors: errors }),
                    contents
                );
            }
        }]);
        return ConfigForm;
    }(_react.Component);

    var HookConfigDialog = function (_Component2) {
        babelHelpers.inherits(HookConfigDialog, _Component2);

        function HookConfigDialog() {
            var _ref4;

            var _temp2, _this3, _ret2;

            babelHelpers.classCallCheck(this, HookConfigDialog);

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return _ret2 = (_temp2 = (_this3 = babelHelpers.possibleConstructorReturn(this, (_ref4 = HookConfigDialog.__proto__ || Object.getPrototypeOf(HookConfigDialog)).call.apply(_ref4, [this].concat(args))), _this3), _this3.state = {
                formContent: undefined,
                view: undefined,
                viewError: undefined
            }, _this3.onCancel = function () {
                var _this3$props = _this3.props,
                    hook = _this3$props.hook,
                    onCancel = _this3$props.onCancel;


                onCancel && onCancel(hook);
            }, _this3.onSave = function () {
                var _this3$props2 = _this3.props,
                    hook = _this3$props2.hook,
                    onSave = _this3$props2.onSave;


                if (onSave && _this3.configForm) {
                    onSave(hook, (0, _form.formToJSON)((0, _reactDom.findDOMNode)(_this3.configForm)));
                }
            }, _this3.safeSetState = function (newState) {
                if (_this3.mounted) {
                    _this3.setState(newState, function () {
                        return _this3.updateFormContent(_this3.props);
                    });
                }
            }, _this3.updateFormContent = function (props) {
                _this3.setState(HookConfigDialog.getDerivedStateFromProps(props, _this3.state));
            }, _temp2), babelHelpers.possibleConstructorReturn(_this3, _ret2);
        }

        babelHelpers.createClass(HookConfigDialog, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this4 = this;

                this.mounted = true; //le sad, but needed to avoid a `setState` if the dialog is cancelled before the view loads

                (0, _hookConfigFormUtil2.default)(this.props.hook).done(function (view) {
                    return _this4.safeSetState({ view: view });
                }).fail(function (viewError) {
                    return _this4.safeSetState({ viewError: viewError });
                });
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                this.mounted = false;
            }
        }, {
            key: 'render',
            value: function render() {
                var _this5 = this;

                var _props2 = this.props,
                    formErrors = _props2.errors.formErrors,
                    _props2$hook = _props2.hook,
                    details = _props2$hook.details,
                    enabled = _props2$hook.enabled,
                    saving = _props2.saving;
                var _state = this.state,
                    formContent = _state.formContent,
                    viewError = _state.viewError;


                return _react2.default.createElement(
                    _dialog2.default,
                    {
                        id: 'hook-config-dialog',
                        size: _dialog.DialogSize.LARGE,
                        modal: true,
                        titleContent: details.name,
                        footerActionContent: _react2.default.createElement(HookConfigDialogFooter, {
                            enabled: enabled,
                            ready: formContent && !viewError,
                            saving: saving,
                            onCancel: this.onCancel,
                            onSave: this.onSave
                        })
                    },
                    viewError ? _react2.default.createElement(Errors, { errors: viewError.message }) : formContent ? _react2.default.createElement(
                        ConfigForm,
                        {
                            ref: function ref(configForm) {
                                _this5.configForm = configForm;
                            },
                            errors: formErrors
                        },
                        formContent
                    ) : _react2.default.createElement(_spinner2.default, { size: _spinner.SpinnerSize.LARGE })
                );
            }
        }], [{
            key: 'getDerivedStateFromProps',
            value: function getDerivedStateFromProps(_ref5, _ref6) {
                var config = _ref5.config,
                    currentScope = _ref5.currentScope,
                    fieldErrors = _ref5.errors.fieldErrors;
                var view = _ref6.view;

                /*
                 * So this kinda sucks, but we need to be able to handle errors thrown by an invalid/buggy (not just missing) view function,
                 * which we can only validate at render time (or just before in this case).
                 * So we apply the context to the view here and store the result in the state and use that in the render method.
                 * If the view returns an error (getHookConfigView wraps the execution in a try-catch to return a normalised error rather than throwing),
                 * it is set to the viewError which renders instead of the formContents.
                 */

                if (!(config && view)) {
                    return { formContent: undefined };
                }

                var formContent = view({
                    //TODO: Document this shape as API
                    config: config,
                    errors: fieldErrors,
                    scope: currentScope
                });

                if ((0, _lodash.isError)(formContent)) {
                    return { viewError: formContent };
                }

                if ((0, _lodash.isString)(formContent)) {
                    return {
                        formContent: _react2.default.createElement('div', {
                            className: 'html-contents',
                            dangerouslySetInnerHTML: { __html: formContent }
                        })
                    };
                }

                return { formContent: formContent };
            }
        }]);
        return HookConfigDialog;
    }(_react.Component);

    exports.default = HookConfigDialog;
    module.exports = exports['default'];
});