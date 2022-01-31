define('bitbucket/internal/page/admin/mailserver/mailserver', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/internal/util/notifications/notifications', 'bitbucket/internal/widget/confirm-dialog/confirm-dialog'], function (module, exports, _aui, _jquery, _notifications, _confirmDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _notifications2 = babelHelpers.interopRequireDefault(_notifications);

    var _confirmDialog2 = babelHelpers.interopRequireDefault(_confirmDialog);

    var toggleFocus = function toggleFocus(hasFocus, password, passwordChanged, passwordSet) {
        if (passwordSet.value === 'true' && passwordChanged.value === 'false') {
            password.setAttribute('value', hasFocus ? _aui2.default.I18n.getText('bitbucket.web.config.mail.password.empty') : _aui2.default.I18n.getText('bitbucket.web.config.mail.password.set'));
        }
    };

    function onReady(protocolSelectSelector, useTlsCheckboxSelector, requireTlsCheckboxSelector, deleteButtonSelector, testButtonSelector, testAddressSelector) {
        _notifications2.default.showFlashes();

        // bind the 'Test' button to send a test email with the current config
        var $testButton = (0, _jquery2.default)(testButtonSelector);
        $testButton.click(function () {
            var $this = (0, _jquery2.default)(this);
            var $spinner = (0, _jquery2.default)("<div class='spinner'></div>");

            $this.nextAll().remove();
            $this.after($spinner);
            $spinner.spin();
        });

        (0, _jquery2.default)(testAddressSelector).keypress(function (event) {
            // so that it doesn't use the Save submit button
            if (event.which === 13) {
                event.preventDefault();
                $testButton.click();
            }
        });

        // bind the delete button
        var panelContent = bitbucket.internal.widget.paragraph({
            text: _aui2.default.I18n.getText('bitbucket.web.mailserver.delete.confirm')
        });

        var confirmDialog = new _confirmDialog2.default({
            id: 'delete-mail-sever-config-dialog',
            titleText: _aui2.default.I18n.getText('bitbucket.web.mailserver.delete.config'),
            titleClass: 'warning-header',
            panelContent: panelContent,
            submitText: _aui2.default.I18n.getText('bitbucket.web.button.delete'),
            focusSelector: '.cancel-button'
        }, { type: 'DELETE' });

        confirmDialog.attachTo(deleteButtonSelector);

        confirmDialog.addConfirmListener(function (promise) {
            promise.done(function (data) {
                _notifications2.default.addFlash(_aui2.default.I18n.getText('bitbucket.web.config.mail.deleted'), {
                    type: 'info'
                });
                window.location.reload();
            });
        });

        var $requireSslTlsCheckbox = (0, _jquery2.default)(requireTlsCheckboxSelector);
        var $useSslTlsCheckbox = (0, _jquery2.default)(useTlsCheckboxSelector);

        (0, _jquery2.default)(protocolSelectSelector).on('change', function () {
            if (this.value === 'SMTP') {
                $useSslTlsCheckbox.prop({ disabled: false });
                $requireSslTlsCheckbox.prop({ disabled: false });
            } else {
                $useSslTlsCheckbox.prop({ checked: true, disabled: true });
                $requireSslTlsCheckbox.prop({ checked: true, disabled: true });
            }
        });

        $useSslTlsCheckbox.on('change', function () {
            if (!this.checked) {
                $requireSslTlsCheckbox.prop({ checked: false });
            }
        });

        $requireSslTlsCheckbox.on('change', function () {
            if (this.checked) {
                $useSslTlsCheckbox.prop({ checked: true });
            }
        });

        var $password = (0, _jquery2.default)('#password');
        var passwordChanged = document.getElementById('passwordChanged');
        var passwordSet = document.getElementById('passwordSet');

        $password.on('blur focus', function (e) {
            return toggleFocus(e.type === 'focus', $password.get(0), passwordChanged, passwordSet);
        }).on('input', function () {
            return passwordChanged.setAttribute('value', 'true');
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});