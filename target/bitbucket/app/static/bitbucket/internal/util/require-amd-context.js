define('bitbucket/internal/util/require-amd-context', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = requireAMDContext;

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    /**
     * Use WRM.require() to load resources for a given Web Resource Context.
     * Once loaded, use AMD to require a number of AMD module.
     * @returns {Promise} promise that will resolve to the required modules.
     */
    function requireAMDContext(context, moduleNames) {
        return WRM.require('wrc!' + context).pipe(function () {
            var deferred = _jquery2.default.Deferred();
            require(moduleNames, function () {
                deferred.resolve.apply(deferred, arguments);
            });
            return deferred.promise();
        });
    } /*global WRM:false */
    module.exports = exports['default'];
});