define('bitbucket/internal/impl/request', ['module', 'exports', 'bitbucket/util/server'], function (module, exports, _server) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _server2 = babelHelpers.interopRequireDefault(_server);

    exports.default = {
        rest: _server2.default.rest
    };
    module.exports = exports['default'];
});