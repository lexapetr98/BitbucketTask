define('bitbucket/internal/page/admin/users/createUser', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function togglePasswordFields() {
        (0, _jquery2.default)('#password, #confirmPassword').parent('.field-group').toggleClass('hidden', (0, _jquery2.default)(this).is(':checked'));
    }

    function onReady() {
        var $notifyCheckbox = (0, _jquery2.default)('#notify');
        $notifyCheckbox.click(togglePasswordFields);
        togglePasswordFields.call($notifyCheckbox[0]);
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});