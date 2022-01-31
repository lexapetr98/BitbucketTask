define('bitbucket/internal/page/admin/users/useredit', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/user/user-groups-table/user-groups-table', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/browser-location', 'bitbucket/internal/util/error', 'bitbucket/internal/util/notifications/notifications', 'bitbucket/internal/widget/confirm-dialog/confirm-dialog', 'bitbucket/internal/widget/delete-dialog/delete-dialog', 'bitbucket/internal/widget/submit-spinner/submit-spinner', 'bitbucket/internal/widget/user-avatar-form/user-avatar-form'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _userGroupsTable, _ajax, _browserLocation, _error, _notifications, _confirmDialog, _deleteDialog, _submitSpinner, _userAvatarForm) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _userGroupsTable2 = babelHelpers.interopRequireDefault(_userGroupsTable);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _error2 = babelHelpers.interopRequireDefault(_error);

    var _notifications2 = babelHelpers.interopRequireDefault(_notifications);

    var _confirmDialog2 = babelHelpers.interopRequireDefault(_confirmDialog);

    var _deleteDialog2 = babelHelpers.interopRequireDefault(_deleteDialog);

    var _submitSpinner2 = babelHelpers.interopRequireDefault(_submitSpinner);

    var _userAvatarForm2 = babelHelpers.interopRequireDefault(_userAvatarForm);

    function notify(message, type) {
        type = type || 'info';
        (0, _aui.flag)({
            type: type,
            title: message,
            close: 'auto'
        });
    }

    function notifySuccess(message) {
        notify(message, 'success');
    }

    function notifyError(message) {
        notify(message, 'error');
    }

    function setErrorSpan(fieldSelector, message) {
        (0, _jquery2.default)(fieldSelector).parent('.field-group').append((0, _jquery2.default)("<span class='error'></span>").text(message));
    }

    function clearErrors() {
        (0, _jquery2.default)('.panel-details .error, .content-body .notifications > .error').remove();
    }

    function notifyErrors(errors) {
        if (_lodash2.default.isArray(errors)) {
            _lodash2.default.forEach(errors, function (error) {
                if (error.message && error.context && error.context === 'email') {
                    setErrorSpan('#email', error.message);
                } else if (error.message && error.context && error.context === 'displayName') {
                    setErrorSpan('#fullname', error.message);
                } else if (error.message) {
                    notifyError(error.message);
                } else {
                    notifyError(error);
                }
            });
        } else if (_lodash2.default.isString(errors)) {
            notifyError(errors);
        }
    }

    // dialog to confirm the deletion of the user
    function initialiseDeleteDialog(deleteLink) {
        _deleteDialog2.default.bind(deleteLink, _aui.I18n.getText('bitbucket.web.user.delete'), _aui.I18n.getText('bitbucket.web.user.delete.success'), _aui.I18n.getText('bitbucket.web.user.delete.fail'), function (name) {
            _notifications2.default.addFlash(_aui.I18n.getText('bitbucket.web.user.delete.success', name));
            window.location = _navbuilder2.default.admin().users().build();
            return false; // don't notify on view page, wait for page-pop
        }, function () {
            return (0, _jquery2.default)('#fullname').val();
        });
    }

    function initialiseClearCaptchaDialog(clearCaptchaLink) {
        var confirmDialog = new _confirmDialog2.default({
            id: 'clear-captcha-dialog',
            titleText: _aui.I18n.getText('bitbucket.web.user.captcha.clear'),
            panelContent: bitbucket.internal.admin.users.clearCaptchaDialog({
                displayName: (0, _jquery2.default)('#fullname').val()
            }),
            submitText: _aui.I18n.getText('bitbucket.web.button.clear')
        }, { type: 'DELETE' });

        confirmDialog.attachTo(clearCaptchaLink);

        confirmDialog.addConfirmListener(function (promise) {
            promise.done(function () {
                (0, _jquery2.default)(clearCaptchaLink).remove();
                confirmDialog.destroy();
                notifySuccess(_aui.I18n.getText('bitbucket.web.user.captcha.cleared'));
            });
        });
    }

    // dialog to change the password
    function initialisePasswordDialog(user, passwordLink) {
        function submitPassword(dialog) {
            var $spinner = new _submitSpinner2.default(dialog.$el.find('.confirm-button'), 'before').show();
            var $form = dialog.$el.find('form');
            var formData = _ajax2.default.formToJSON($form); // this needs to be done before form fields are disabled
            disableDialog(dialog, true); // Prevent double submission
            _ajax2.default.rest({
                url: $form.attr('action'),
                type: 'PUT',
                data: babelHelpers.extends({
                    name: user.name
                }, formData),
                statusCode: {
                    '*': false //this is already a popup: handle all the errors locally
                }
            }).always(function () {
                $spinner.remove();
            }).done(function () {
                dialog.hide();
                notifySuccess(_aui.I18n.getText('bitbucket.web.user.password.update.success'));
            }).fail(function (xhr, textStatus, errorThrown, data) {
                disableDialog(dialog, false);

                _error2.default.setFormErrors($form, data && data.errors && data.errors[0] && data.errors[0].message ? data.errors : [{
                    message: _aui.I18n.getText('bitbucket.web.user.change.password.failure')
                }]);
            });
        }

        (0, _jquery2.default)(passwordLink).click(function (e) {
            e.preventDefault();

            var dialog = (0, _aui.dialog2)(bitbucket.internal.admin.users.passwordResetDialog({
                username: user.name
            }));
            dialog.$el.on('click', '#cancel-password-button', function (e) {
                return dialog.hide();
            }).on('click', '#save-password-button', function (e) {
                return submitPassword(dialog);
            }).on('keydown', function (e) {
                if (e.keyCode === _aui.keyCode.ENTER) {
                    e.preventDefault();
                    submitPassword(dialog);
                } else if (e.keyCode === _aui.keyCode.ESCAPE) {
                    e.preventDefault();
                    dialog.hide();
                }
            });
            dialog.show();
        });
    }

    function disableDialog(dialog, disabled) {
        // naively disable inputs and buttons
        dialog.$el.find('input, button').attr({ disabled: disabled });
        // making the dialog modal prevents ESC/blanket click from closing the dialog
        dialog.$el.attr('data-aui-modal', disabled);
    }

    // dialog to rename the user
    function initialiseRenameDialog(user, renameLink) {
        function submitRename(dialog) {
            var $spinner = new _submitSpinner2.default(dialog.$el.find('.confirm-button'), 'before').show();
            var $form = dialog.$el.find('form');
            var formData = _ajax2.default.formToJSON($form);
            disableDialog(dialog, true);

            _ajax2.default.rest({
                url: $form.attr('action'),
                type: 'POST',
                data: babelHelpers.extends({
                    name: user.name
                }, formData),
                statusCode: {
                    '*': false //this is already a popup: handle all the errors locally
                }
            }).always(function () {
                $spinner.remove();
            }).done(function (renamedUser) {
                _notifications2.default.addFlash(_aui.I18n.getText('bitbucket.web.user.rename.success'));
                _browserLocation.location.href = _navbuilder2.default.admin().users().view(renamedUser.name).build();
            }).fail(function (xhr, textStatus, errorThrown, data) {
                disableDialog(dialog, false);

                _error2.default.setFormErrors($form, data && data.errors && data.errors[0] && data.errors[0].message ? data.errors : [{
                    message: _aui.I18n.getText('bitbucket.web.user.rename.failure')
                }]);
            });
        }

        (0, _jquery2.default)(renameLink).click(function (e) {
            e.preventDefault();

            var dialog = (0, _aui.dialog2)(bitbucket.internal.admin.users.renameDialog({
                username: user.name
            }));

            dialog.$el.on('click', '#save-rename-button', function (e) {
                return submitRename(dialog);
            }).on('click', '#cancel-rename-button', function (e) {
                return dialog.hide();
            }).on('keydown', function (e) {
                if (e.keyCode === _aui.keyCode.ENTER) {
                    e.preventDefault();
                    submitRename(dialog);
                } else if (e.keyCode === _aui.keyCode.ESCAPE) {
                    e.preventDefault();
                    dialog.hide();
                }
            });

            dialog.show();
        });
    }

    // form for editing user details
    function initialiseForm() {
        // utility functions
        function rollback($form) {
            $form.find('input[type=text]').each(function () {
                var $this = (0, _jquery2.default)(this);
                $this.val($this.data('rollback'));
            });
        }
        function updateDetails($form, data) {
            $form.find('#fullname').val(data.displayName);
            $form.find('#email').val(data.emailAddress);
            $form.find('input[type=text]').each(function () {
                var $this = (0, _jquery2.default)(this);
                $this.data('rollback', $this.val());
            });
        }
        function closeEditDetails($form) {
            $form.removeClass('editing').find('#fullname, #email').attr('readonly', 'readonly');
            (0, _jquery2.default)('#ajax-status-message').empty();
            clearErrors();
        }

        // event bindings
        (0, _jquery2.default)('#edit-details').click(function (e) {
            (0, _jquery2.default)('.panel-details form.editable').addClass('editing').find('#fullname, #email').removeAttr('readonly');
            if (e.target.id !== 'email') {
                (0, _jquery2.default)('#fullname', '.panel-details form.editable').focus();
            }
            e.preventDefault();
        });
        (0, _jquery2.default)('.panel-details form.editable').keyup(function (e) {
            if (e.which === _aui.keyCode.ESCAPE) {
                (0, _jquery2.default)('a.cancel', this).click();
            }
        });
        (0, _jquery2.default)('.cancel', '.panel-details form.editable').click(function (e) {
            e.preventDefault();
            var $form = (0, _jquery2.default)(this).parents('form');
            rollback($form);
            closeEditDetails($form);
            return false;
        });
        (0, _jquery2.default)('.panel-details form.editable').submit(function (e) {
            e.preventDefault();
            clearErrors();
            var $form = (0, _jquery2.default)(this);
            var displayName = $form.find('#fullname').val();
            _ajax2.default.rest({
                url: $form.attr('action'),
                type: 'PUT',
                data: {
                    name: $form.find('#name').val(),
                    displayName: displayName,
                    email: $form.find('#email').val()
                },
                statusCode: {
                    // these errors are handled locally.
                    500: false,
                    404: false,
                    401: false,
                    400: false
                }
            }).done(function (data) {
                updateDetails($form, data);
                closeEditDetails($form);
                notifySuccess(_aui.I18n.getText('bitbucket.web.user.update.success', displayName));
            }).fail(function (xhr, textStatus, errorThrown, data) {
                var errors = data && data.errors ? data.errors : _aui.I18n.getText('bitbucket.web.user.update.failure');
                notifyErrors(errors);
            });
        });
    }

    function initialiseUserAvatarForm(user, avatarFormSelector) {
        var xsrfToken = {
            name: 'atl_token',
            value: (0, _jquery2.default)('.user-details-form input[name=atl_token]').val()
        };
        var avatarForm = new _userAvatarForm2.default((0, _jquery2.default)(avatarFormSelector), user, xsrfToken);
        avatarForm.on('avatarChanged', clearErrors);
        avatarForm.on('avatarUploadError', notifyErrors);
        avatarForm.on('avatarDeleteError', notifyErrors);
    }

    function initialiseUserGroupsTable(groupsTableSelector) {
        var userGroupsTable = new _userGroupsTable2.default({
            target: groupsTableSelector,
            onError: notifyErrors
        });
        userGroupsTable.init();
    }

    function deepLinkTab() {
        if (_browserLocation.location.hash) {
            var $maybeTab = (0, _jquery2.default)(_browserLocation.location.hash + '-tab');
            if ($maybeTab.length) {
                _aui.tabs.change($maybeTab);
            }
        }
    }

    function onReady(user, selectors) {
        _notifications2.default.showFlashes();

        initialiseDeleteDialog(selectors.deleteLinkSelector);
        initialiseClearCaptchaDialog(selectors.clearCaptchaLinkSelector);
        initialisePasswordDialog(user, selectors.passwordLinkSelector);
        initialiseRenameDialog(user, selectors.renameUserLinkSelector);
        initialiseForm();
        initialiseUserAvatarForm(user, selectors.avatarFormSelector);
        initialiseUserGroupsTable(selectors.groupsTableSelector);

        deepLinkTab();
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});