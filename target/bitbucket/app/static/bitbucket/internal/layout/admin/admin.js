define('bitbucket/internal/layout/admin/admin', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var initDropdowns = function initDropdowns() {
        var $menuItems = (0, _jquery2.default)('.tabs-menu .menu-item');

        $menuItems.children('.aui-dd-trigger').mouseenter(function () {
            var $activeMenu = $menuItems.filter('.active');
            var $this = (0, _jquery2.default)(this);
            if ($activeMenu.length > 0 && $activeMenu[0] !== $this.parent()[0]) {
                $this.click();
            }
        });
    };

    function onReady() {
        initDropdowns();
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});