define('bitbucket/internal/page/compare/compare', ['module', 'exports', 'jquery', 'bitbucket/internal/feature/compare/compare'], function (module, exports, _jquery, _compare) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _compare2 = babelHelpers.interopRequireDefault(_compare);

    /**
     * Init the compare view
     *
     * @param {Object} targetRepository                 - The initial state for the target selector
     * @param {Object} sourceRepository                 - The initial state for the source selector
     * @param {Object} tabs                             - Functions to init a tab when it is selected
     * @returns {*}
     */
    function onReady(targetRepository, sourceRepository, tabs) {
        var opts = {
            targetRepositoryJson: targetRepository,
            sourceRepositoryJson: sourceRepository,
            tabs: tabs
        };
        return _compare2.default.onReady((0, _jquery2.default)('#branch-compare'), opts);
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});