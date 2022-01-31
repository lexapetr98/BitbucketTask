define('bitbucket/internal/layout/mirror-cloud-stp/mirror-cloud-stp', ['exports', 'jquery', 'bitbucket/internal/util/connect'], function (exports, _jquery, _connect) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.onReady = onReady;

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _connect2 = babelHelpers.interopRequireDefault(_connect);

    function onReady() {
        (0, _jquery2.default)('#cloud-stp-close-button').on('click', function () {
            _connect2.default.require('dialog', function (dialog) {
                dialog.close();
            });
        });
    }
});