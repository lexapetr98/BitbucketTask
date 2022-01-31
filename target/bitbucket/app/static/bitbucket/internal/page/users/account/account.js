define('bitbucket/internal/page/users/account/account', ['module', 'exports', 'jquery', 'bitbucket/internal/widget/user-avatar-form/user-avatar-form'], function (module, exports, _jquery, _userAvatarForm) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _userAvatarForm2 = babelHelpers.interopRequireDefault(_userAvatarForm);

    function cleanErrors() {
        (0, _jquery2.default)('.user-avatar-error').remove();
    }

    function notifyError(message) {
        cleanErrors();
        (0, _jquery2.default)('.aui-page-panel-content > .aui-page-header').after(aui.message.error({
            content: message,
            extraClasses: 'user-avatar-error'
        }));
    }

    function onReady(user, avatarContainerSelector) {
        var xsrfToken = {
            name: 'atl_token',
            value: (0, _jquery2.default)('.account-settings input[name=atl_token]').val()
        };
        var avatarForm = new _userAvatarForm2.default((0, _jquery2.default)(avatarContainerSelector), user, xsrfToken);
        avatarForm.on('avatarChanged', cleanErrors);
        avatarForm.on('avatarUploadError', notifyError);
        avatarForm.on('avatarDeleteError', notifyError);
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});