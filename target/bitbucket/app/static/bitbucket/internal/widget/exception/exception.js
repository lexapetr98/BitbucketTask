define('bitbucket/internal/widget/exception/exception', ['module', 'exports', '@atlassian/aui', 'jquery'], function (module, exports, _aui, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function onReady() {
        (0, _jquery2.default)('.formatted-throwable-toggle').click(function () {
            var $this = (0, _jquery2.default)(this);
            var $details = $this.next('.formatted-throwable');
            if ($this.data('message-visible')) {
                $details.hide('slow', function () {
                    $this.text(_aui2.default.I18n.getText('bitbucket.web.message.throwable.twixie.show'));
                });
                $this.data('message-visible', false);
            } else {
                $details.show('slow', function () {
                    $this.text(_aui2.default.I18n.getText('bitbucket.web.message.throwable.twixie.hide'));
                });
                $this.data('message-visible', true);
            }
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});