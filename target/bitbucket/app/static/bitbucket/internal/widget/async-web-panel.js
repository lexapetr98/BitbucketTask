define('bitbucket/internal/widget/async-web-panel', ['module', 'exports', 'bitbucket/internal/util/promise'], function (module, exports, _promise) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = asyncWebPanel;

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    var webPanelId = 0;

    function asyncWebPanel(callback) {
        webPanelId++;

        var selector = '#async-web-panel-' + webPanelId;

        _promise2.default.waitFor({
            predicate: function predicate() {
                var el = document.querySelector(selector);
                return el || false;
            },
            name: 'Async web panel ' + webPanelId,
            interval: 50
        }).then(callback, function (reason) {
            return console.error(new Error(reason));
        });

        return '<div id="async-web-panel-' + webPanelId + '"></div>';
    }
    module.exports = exports['default'];
});