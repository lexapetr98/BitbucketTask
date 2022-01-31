define('bitbucket/internal/widget/delete-dialog/delete-dialog', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/widget/confirm-dialog/confirm-dialog'], function (module, exports, _aui, _jquery, _lodash, _confirmDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _confirmDialog2 = babelHelpers.interopRequireDefault(_confirmDialog);

    function bind(deleteTrigger, title, successMessage, failureMessage, successCallback, nameProvider) {
        // create the dialog
        var confirmDialog = new _confirmDialog2.default({
            id: 'delete-dialog',
            titleClass: 'warning-header',
            titleText: title,
            panelContent: bitbucket.internal.widget.deleteDialog(),
            submitText: _aui2.default.I18n.getText('bitbucket.web.button.delete'),
            focusSelector: '.cancel-button'
        }, {
            type: 'DELETE',
            statusCode: {
                '*': false /* opt out of the Stash's default error handling for AJAX requests and uses our own */
            }
        });

        // notifications when the deletion is successful or fails
        var notify = function notify(content) {
            var $notification = (0, _jquery2.default)('#content .aui-page-panel .notifications');
            $notification.empty().html(content);
        };
        var notifySuccess = function notifySuccess(message) {
            notify(aui.message.success({ content: message }));
        };
        var notifyError = function notifyError(message) {
            notify(aui.message.error({ content: message }));
        };

        // bind the notification callbacks
        confirmDialog.addConfirmListener(function (promise, $trigger) {
            // notification when the deletion was successful
            promise.done(function (data) {
                var name = data ? data.displayName ? data.displayName : data.name ? data.name : '' : '';
                var message = successMessage.replace('{0}', _aui2.default.escapeHtml(name));

                // notify via message successCallback if undefined or returns true, or returns a promise that succeeds
                var successCallbackReturn = !successCallback || successCallback(name, $trigger);
                if (successCallbackReturn && !successCallbackReturn.promise) {
                    notifySuccess(message);
                } else if (successCallbackReturn && successCallbackReturn.promise) {
                    successCallbackReturn.done(function () {
                        notifySuccess(message);
                    });
                }
                // notification when the deletion failed
            }).fail(function (xhr, textStatus, errorThrown, data) {
                var message = (0, _lodash.get)(data, 'errors.0.message') ? data.errors[0].message : failureMessage;
                notifyError(_aui2.default.escapeHtml(message));
            });
        });

        // bind to the trigger(s)
        confirmDialog.attachTo(deleteTrigger, function (deleteLink, dialog) {
            var entityName = nameProvider ? nameProvider() : (0, _jquery2.default)(deleteLink).data('for');
            dialog.$el.find('.display-name').text(entityName);
        });
    }

    exports.default = {
        bind: bind
    };
    module.exports = exports['default'];
});