define('bitbucket/internal/util/property', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function coerce(value, type) {
        if (value == null) {
            return value;
        }

        switch (type) {
            case 'STRING':
                return value;
            case 'NUMBER':
                return Number(value);
            case 'BOOLEAN':
                return value.toLowerCase() === 'true';
        }
    } /**
       * Use with the config-wrm-data.xml plugin
       * @since 3.1
       */


    var cache = {};

    function getFromProvider(key) {
        var data = cache[key] || (cache[key] = WRM.data.claim('com.atlassian.bitbucket.server.config-wrm-data:' + key + '.data'));
        if (data) {
            return _jquery2.default.Deferred().resolve(coerce(data.value, data.type));
        }
        return _jquery2.default.Deferred().reject();
    }

    exports.default = {
        getFromProvider: getFromProvider,
        // Visible for testing
        _coerce: coerce
    };
    module.exports = exports['default'];
});