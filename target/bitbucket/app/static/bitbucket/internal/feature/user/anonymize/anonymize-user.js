define('bitbucket/internal/feature/user/anonymize/anonymize-user', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'react', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/bbui/aui-react/form', 'bitbucket/internal/bbui/aui-react/spinner', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/client-storage'], function (module, exports, _aui, _jquery, _lodash, _react, _navbuilder, _server, _form, _spinner, _analytics, _clientStorage) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _spinner2 = babelHelpers.interopRequireDefault(_spinner);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    /* global bitbucket_help_url:false */
    var AnonymizeConfirmationStep = function AnonymizeConfirmationStep(_ref) {
        var canSubmit = _ref.canSubmit,
            errorMessage = _ref.errorMessage,
            isConfirmed = _ref.isConfirmed,
            onAnonymize = _ref.onAnonymize,
            onBack = _ref.onBack,
            onConfirmedChanged = _ref.onConfirmedChanged,
            onSubmit = _ref.onSubmit,
            processing = _ref.processing,
            username = _ref.username;
        return _react2.default.createElement(
            _react.Fragment,
            null,
            _react2.default.createElement(
                'section',
                { className: 'anonymize' },
                errorMessage && _react2.default.createElement(
                    'div',
                    { className: 'aui-message aui-message-error' },
                    _react2.default.createElement(
                        'p',
                        { className: 'title' },
                        _aui.I18n.getText('bitbucket.web.user.anonymize.confirm.error.title', username)
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        errorMessage
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'anonymize-text-detailed' },
                    _react2.default.createElement('p', {
                        dangerouslySetInnerHTML: {
                            __html: _aui.I18n.getText('bitbucket.web.user.anonymize.confirm.details.introduction.html', _aui2.default.escapeHtml(username))
                        }
                    }),
                    _react2.default.createElement(
                        'p',
                        null,
                        _aui.I18n.getText('bitbucket.web.user.anonymize.confirm.details.data.anonymized')
                    ),
                    _react2.default.createElement(
                        'ul',
                        null,
                        _react2.default.createElement(
                            'li',
                            null,
                            _aui.I18n.getText('bitbucket.web.user.anonymize.confirm.details.data.anonymized.mentions')
                        ),
                        _react2.default.createElement(
                            'li',
                            null,
                            _aui.I18n.getText('bitbucket.web.user.anonymize.confirm.details.data.anonymized.avatars')
                        ),
                        _react2.default.createElement(
                            'li',
                            null,
                            _aui.I18n.getText('bitbucket.web.user.anonymize.confirm.details.data.anonymized.project')
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        _aui.I18n.getText('bitbucket.web.user.anonymize.confirm.details.data.preserved')
                    ),
                    _react2.default.createElement(
                        'ul',
                        null,
                        _react2.default.createElement(
                            'li',
                            null,
                            _aui.I18n.getText('bitbucket.web.user.anonymize.confirm.details.data.preserved.comments')
                        ),
                        _react2.default.createElement(
                            'li',
                            null,
                            _aui.I18n.getText('bitbucket.web.user.anonymize.confirm.details.data.preserved.git')
                        ),
                        _react2.default.createElement(
                            'li',
                            null,
                            _aui.I18n.getText('bitbucket.web.user.anonymize.confirm.details.data.preserved.addons')
                        )
                    ),
                    _react2.default.createElement('p', {
                        dangerouslySetInnerHTML: {
                            __html: _aui.I18n.getText('bitbucket.web.user.anonymize.confirm.details.username.html', _aui2.default.escapeHtml(username))
                        }
                    })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'anonymize-form' },
                    _react2.default.createElement(
                        'form',
                        { className: 'aui', onSubmit: onSubmit },
                        _react2.default.createElement(_form.Checkbox, {
                            checked: isConfirmed,
                            disabled: errorMessage != null || processing,
                            label: _aui.I18n.getText('bitbucket.web.user.anonymize.confirm.description'),
                            name: 'user-anonymize-confirm',
                            onChange: onConfirmedChanged
                        }),
                        _react2.default.createElement(
                            'div',
                            { className: 'anonymize-buttons' },
                            _react2.default.createElement(
                                'div',
                                { className: 'buttons' },
                                processing && _react2.default.createElement(_spinner2.default, null),
                                _react2.default.createElement(
                                    'button',
                                    {
                                        className: 'anonymize-button aui-button aui-button-primary',
                                        disabled: !canSubmit,
                                        onClick: onAnonymize,
                                        type: 'button'
                                    },
                                    _aui.I18n.getText('bitbucket.web.user.anonymize.anonymize')
                                ),
                                _react2.default.createElement(
                                    'button',
                                    {
                                        className: 'back-button aui-button aui-button-link',
                                        disabled: processing,
                                        onClick: onBack,
                                        type: 'button'
                                    },
                                    _aui.I18n.getText('bitbucket.web.user.anonymize.back')
                                )
                            )
                        )
                    )
                )
            )
        );
    };

    var AnonymizeValidationStep = function AnonymizeValidationStep(_ref2) {
        var errorMessage = _ref2.errorMessage,
            onContinue = _ref2.onContinue,
            onSubmit = _ref2.onSubmit,
            onUsernameChanged = _ref2.onUsernameChanged,
            processing = _ref2.processing,
            username = _ref2.username;
        return _react2.default.createElement(
            _react.Fragment,
            null,
            _react2.default.createElement(
                'section',
                { className: 'anonymize' },
                _react2.default.createElement(
                    'p',
                    { className: 'anonymize-text' },
                    _aui.I18n.getText('bitbucket.web.user.anonymize.description'),
                    ' ',
                    _react2.default.createElement(
                        'a',
                        {
                            className: 'aui-button aui-button-link',
                            href: bitbucket_help_url('bitbucket.help.anonymize')
                        },
                        _aui.I18n.getText('bitbucket.web.user.anonymize.help')
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'anonymize-form' },
                    _react2.default.createElement(
                        'form',
                        { className: 'aui', onSubmit: onSubmit },
                        _react2.default.createElement(_form.TextField, {
                            autoComplete: false,
                            autoFocus: true,
                            description: _aui.I18n.getText('bitbucket.web.user.anonymize.username.description'),
                            errors: [errorMessage],
                            name: 'username',
                            onChange: function onChange(e) {
                                return onUsernameChanged(e.target.value);
                            },
                            title: _aui.I18n.getText('bitbucket.web.user.anonymize.username.title'),
                            value: username ? username : ''
                        }),
                        _react2.default.createElement(
                            'div',
                            { className: 'anonymize-buttons' },
                            _react2.default.createElement(
                                'div',
                                { className: 'buttons' },
                                processing && _react2.default.createElement(_spinner2.default, null),
                                _react2.default.createElement(
                                    'button',
                                    {
                                        className: 'continue-button aui-button aui-button-primary',
                                        disabled: !username || processing,
                                        onClick: onContinue,
                                        type: 'button'
                                    },
                                    _aui.I18n.getText('bitbucket.web.user.anonymize.continue')
                                ),
                                _react2.default.createElement(
                                    'a',
                                    {
                                        className: 'aui-button aui-button-link',
                                        href: _navbuilder2.default.admin().users().build()
                                    },
                                    _aui.I18n.getText('bitbucket.web.user.anonymize.cancel')
                                )
                            )
                        )
                    )
                )
            )
        );
    };

    var isTimeout = function isTimeout(errorMessage) {
        return errorMessage === 'timeout';
    };

    var eraseUser = function eraseUser(username) {
        return createErasureRequest({ username: username, method: 'POST', skipErrorDialogOnTimeout: true });
    };

    var validateErasableUser = function validateErasableUser(username) {
        return createErasureRequest({ username: username, method: 'GET' });
    };

    var createErasureRequest = function createErasureRequest(_ref3) {
        var method = _ref3.method,
            username = _ref3.username,
            skipErrorDialogOnTimeout = _ref3.skipErrorDialogOnTimeout;

        return _server2.default.rest({
            url: _navbuilder2.default.rest().admin().users().erasure(username).build(),
            type: method,
            statusCode: babelHelpers.extends({
                0: function _(ignored, message) {
                    if (skipErrorDialogOnTimeout && isTimeout(message)) {
                        return _jquery2.default.Deferred().reject({ timeout: true });
                    }
                    return true;
                }
            }, errorResponses)
        });
    };

    var errorResponse = function errorResponse(statusCode, message) {
        return function () {
            return _jquery2.default.Deferred().reject({ statusCode: statusCode, message: message });
        };
    };

    var errorResponses = {
        401: errorResponse(401, _aui.I18n.getText('bitbucket.web.user.anonymize.validation.error.nopermissions')),
        404: errorResponse(404, _aui.I18n.getText('bitbucket.web.user.anonymize.validation.error.notexists')),
        409: errorResponse(409, _aui.I18n.getText('bitbucket.web.user.anonymize.validation.error.notdeleted'))
    };

    var AnonymizeUser = function (_PureComponent) {
        babelHelpers.inherits(AnonymizeUser, _PureComponent);

        function AnonymizeUser() {
            var _ref4;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, AnonymizeUser);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref4 = AnonymizeUser.__proto__ || Object.getPrototypeOf(AnonymizeUser)).call.apply(_ref4, [this].concat(args))), _this), _this.state = {
                confirmationStep: false,
                errorMessage: null,
                isConfirmed: false,
                processing: false,
                username: undefined
            }, _this.handleErrors = function (_ref5) {
                var message = _ref5.message,
                    statusCode = _ref5.statusCode;

                _analytics2.default.add('user.anonymize.validation.error', { statusCode: statusCode });
                _this.setState({
                    errorMessage: typeof message === 'string' ? message : null,
                    processing: false
                });
            }, _this.onAnonymize = function () {
                _this.setState({
                    processing: true
                });
                _analytics2.default.add('user.anonymize');
                eraseUser(_this.state.username).then(function () {
                    _clientStorage2.default.setSessionItem('anonymization.successful', _this.state.username);
                    window.location.href = _navbuilder2.default.admin().users().build();
                }, function (error) {
                    if (error.timeout) {
                        _clientStorage2.default.setSessionItem('anonymization.continued.in.background', _this.state.username);
                        window.location.href = _navbuilder2.default.admin().users().build();
                        return false;
                    }
                    _this.handleErrors(error);
                });
            }, _this.onBack = function () {
                _this.setState({
                    confirmationStep: false,
                    errorMessage: null,
                    isConfirmed: false
                });
            }, _this.onConfirmedChanged = function (_ref6) {
                var target = _ref6.target;
                var checked = target.checked;

                _this.setState({
                    isConfirmed: checked
                });
            }, _this.onContinue = function () {
                _this.setState({
                    processing: true
                });
                validateErasableUser(_this.state.username).then(function () {
                    _this.setState({
                        confirmationStep: true,
                        errorMessage: null,
                        processing: false
                    });
                }, _this.handleErrors);
            }, _this.onSubmit = function (e) {
                e.preventDefault();

                var _this$state = _this.state,
                    confirmationStep = _this$state.confirmationStep,
                    username = _this$state.username;

                if (!confirmationStep && username) {
                    _this.onContinue();
                }
            }, _this.onUsernameChanged = function (username) {
                _this.setState({
                    errorMessage: null,
                    username: username ? username : undefined
                });
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(AnonymizeUser, [{
            key: 'render',
            value: function render() {
                var _state = this.state,
                    confirmationStep = _state.confirmationStep,
                    errorMessage = _state.errorMessage,
                    isConfirmed = _state.isConfirmed,
                    processing = _state.processing,
                    username = _state.username;

                return confirmationStep ? _react2.default.createElement(AnonymizeConfirmationStep, {
                    canSubmit: isConfirmed && !errorMessage && !processing,
                    errorMessage: errorMessage,
                    onAnonymize: this.onAnonymize,
                    onBack: this.onBack,
                    onConfirmedChanged: this.onConfirmedChanged,
                    onSubmit: this.onSubmit,
                    isConfirmed: isConfirmed,
                    processing: processing,
                    username: username
                }) : _react2.default.createElement(AnonymizeValidationStep, {
                    errorMessage: errorMessage,
                    onContinue: this.onContinue,
                    onUsernameChanged: this.onUsernameChanged,
                    onSubmit: this.onSubmit,
                    processing: processing,
                    username: username
                });
            }
        }]);
        return AnonymizeUser;
    }(_react.PureComponent);

    exports.default = AnonymizeUser;
    module.exports = exports['default'];
});