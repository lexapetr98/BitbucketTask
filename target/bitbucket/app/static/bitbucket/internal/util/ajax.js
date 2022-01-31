define('bitbucket/internal/util/ajax', ['module', 'exports', 'lodash', 'bitbucket/util/server', 'bitbucket/internal/util/error', 'bitbucket/internal/util/form'], function (module, exports, _lodash, _server, _error, _form) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _error2 = babelHelpers.interopRequireDefault(_error);

    function ignore404WithinRepository(callback) {
        return {
            404: function _(xhr, testStatus, errorThrown, data, fallbackError) {
                var error = (0, _lodash.get)(data, 'errors.0');

                if (_error2.default.isErrorEntityWithinRepository(error)) {
                    return callback && callback(data) || false; // don't handle this globally.
                }
            }
        };
    }

    exports.default = {
        ajax: _server2.default.ajax,
        rest: _server2.default.rest,
        poll: _server2.default.poll,
        ignore404WithinRepository: ignore404WithinRepository,
        formToJSON: _form.formToJSON
    };
    module.exports = exports['default'];
});