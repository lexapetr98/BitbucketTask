define('bitbucket/internal/widget/quick-copy-text', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var first = true;

    function onReady() {
        if (first) {
            first = false;

            (0, _jquery2.default)(document).on('click', '.quick-copy-text', function (e) {
                this.focus();
                this.select();
            });
        }
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});