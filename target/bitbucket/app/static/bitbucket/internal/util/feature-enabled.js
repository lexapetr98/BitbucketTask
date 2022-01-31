define('bitbucket/internal/util/feature-enabled', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var cache = {}; /**
                     * Use with the feature-wrm-data.xml plugin
                     * @since 3.1
                     */

    var has = Object.prototype.hasOwnProperty;

    function getFromProviderSync(key) {
        return has.call(cache, key) ? cache[key] : cache[key] = WRM.data.claim('com.atlassian.bitbucket.server.feature-wrm-data:' + key + '.data');
    }

    function getFromProvider(key) {
        return _jquery2.default.Deferred().resolve(getFromProviderSync(key));
    }

    exports.default = {
        getFromProvider: getFromProvider,
        getFromProviderSync: getFromProviderSync
    };
    module.exports = exports['default'];
});