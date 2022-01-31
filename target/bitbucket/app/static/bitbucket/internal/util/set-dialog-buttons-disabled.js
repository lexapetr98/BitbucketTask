define('bitbucket/internal/util/set-dialog-buttons-disabled', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    exports.default = function (dialog, disabled) {
        var $buttons = dialog.$el.find('.aui-dialog2-footer-actions .aui-button');

        $buttons.each(function (index, btn) {
            var $button = (0, _jquery2.default)(btn);
            $button.prop('disabled', disabled).toggleClass('disabled', disabled);
            if (disabled) {
                $button.attr('aria-disabled', 'true');
            } else {
                $button.removeAttr('aria-disabled');
            }
        });
    };

    module.exports = exports['default'];
});