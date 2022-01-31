define('bitbucket/internal/page/admin/clustering/clustering', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function onReady(currentNodeIconSelector) {
        var $currentNodeIcon = (0, _jquery2.default)(currentNodeIconSelector);
        //the icon is full of whitespace. this brings the tooltip anchor in by 1/4 the height of the icon
        var offset = $currentNodeIcon.height() / -4;
        $currentNodeIcon.tooltip({ gravity: 's', offset: offset });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});