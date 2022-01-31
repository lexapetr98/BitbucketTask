define('bitbucket/internal/page/project/settings/general/project-settings', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/project/project-avatar-picker/project-avatar-picker', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/notifications/notifications', 'bitbucket/internal/widget/confirm-dialog/confirm-dialog'], function (module, exports, _aui, _jquery, _navbuilder, _projectAvatarPicker, _pageState, _ajax, _notifications, _confirmDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _projectAvatarPicker2 = babelHelpers.interopRequireDefault(_projectAvatarPicker);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _notifications2 = babelHelpers.interopRequireDefault(_notifications);

    var _confirmDialog2 = babelHelpers.interopRequireDefault(_confirmDialog);

    function initDeleteButton(deleteButtonSelector) {
        var $panelContent;
        var $spinner;

        var confirmDialog = new _confirmDialog2.default({
            id: 'delete-project-dialog',
            titleText: _aui2.default.I18n.getText('bitbucket.web.project.delete'),
            titleClass: 'warning-header',
            confirmButtonClass: 'delete-confirm-button',
            panelContent: '<div class="container"></div>', // css class used for func test
            submitText: _aui2.default.I18n.getText('bitbucket.web.button.delete'),
            focusSelector: '.cancel-button'
        }, { type: 'DELETE' });

        function initContent() {
            $panelContent.empty();
            $spinner = (0, _jquery2.default)("<div class='spinner'></div>").appendTo($panelContent);
        }

        function setDeleteButtonEnabled(enabled) {
            (0, _jquery2.default)('.delete-confirm-button').prop('disabled', !enabled).toggleClass('disabled', !enabled);
        }

        function okToDeleteProject() {
            $panelContent.append(bitbucket.internal.page.project.settings.deleteDialog({
                project: _pageState2.default.getProject().toJSON()
            }));
            setDeleteButtonEnabled(true);
        }

        function cannotDeleteProject() {
            $panelContent.append(bitbucket.internal.page.project.settings.deleteDisabledDialog({
                project: _pageState2.default.getProject().toJSON()
            }));
            setDeleteButtonEnabled(false);
        }

        confirmDialog.attachTo(deleteButtonSelector, function () {
            $panelContent = (0, _jquery2.default)(confirmDialog.getContentElement()).find('.container');
            initContent();
            setDeleteButtonEnabled(false);
            $spinner.spin('large');
            _ajax2.default.rest({
                url: _navbuilder2.default.rest().currentProject().allRepos().build(),
                statusCode: {
                    '*': false // don't show any error messages.
                }
            }).done(function (data) {
                if (data && data.size) {
                    cannotDeleteProject();
                } else {
                    okToDeleteProject();
                }
            }).fail(function () {
                okToDeleteProject();
            }).always(function () {
                $spinner.spinStop().remove();
            });
        });

        confirmDialog.addConfirmListener(function (promise) {
            promise.done(function (data) {
                _notifications2.default.addFlash(_aui2.default.I18n.getText('bitbucket.web.project.deleted', _pageState2.default.getProject().getName()));

                window.location = _navbuilder2.default.allProjects().build();
            });
        });
    }

    function onReady() {
        var xsrfToken = {
            name: 'atl_token',
            value: (0, _jquery2.default)('.project-settings input[name=atl_token]').val()
        };

        new _projectAvatarPicker2.default('.avatar-picker-field', {
            xsrfToken: xsrfToken
        });
    }

    exports.default = {
        initDeleteButton: initDeleteButton,
        onReady: onReady
    };
    module.exports = exports['default'];
});