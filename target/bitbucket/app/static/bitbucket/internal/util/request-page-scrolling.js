define('bitbucket/internal/util/request-page-scrolling', ['module', 'exports', 'bitbucket/internal/layout/page-scrolling-manager'], function (module, exports, _pageScrollingManager) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function () {
        return _pageScrollingManager2.default._requestScrollControl();
    };

    var _pageScrollingManager2 = babelHelpers.interopRequireDefault(_pageScrollingManager);

    module.exports = exports['default'];
});