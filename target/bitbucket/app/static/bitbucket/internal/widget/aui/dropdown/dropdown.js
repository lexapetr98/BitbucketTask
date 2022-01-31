define('bitbucket/internal/widget/aui/dropdown/dropdown', ['module', 'exports', '@atlassian/aui', 'jquery'], function (module, exports, _aui, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function onReady() {
        var options = {};

        options.dropDown = '.aui-dropdown-left:not(.aui-dropdown-ajax)';
        options.alignment = 'left';
        _aui2.default.dropDown.Standard(_jquery2.default.extend({}, options));

        options.dropDown = '.aui-dropdown-right:not(.aui-dropdown-ajax)';
        options.alignment = 'right';
        _aui2.default.dropDown.Standard(_jquery2.default.extend({}, options));
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});