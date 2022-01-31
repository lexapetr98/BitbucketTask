define('bitbucket/internal/impl/data-provider/data-provider', ['module', 'exports', 'bitbucket/util/server', 'bitbucket/internal/bbui/data-provider/data-provider', 'bitbucket/internal/util/object'], function (module, exports, _server, _dataProvider, _object) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _dataProvider2 = babelHelpers.interopRequireDefault(_dataProvider);

    var _object2 = babelHelpers.interopRequireDefault(_object);

    function DataProvider() {
        _dataProvider2.default.apply(this, arguments);
    }
    _object2.default.inherits(DataProvider, _dataProvider2.default);

    DataProvider.prototype._fetch = function (url) {
        return _server2.default.rest({
            method: 'GET',
            url: url
        });
    };

    DataProvider.prototype._errorTransform = function (data) {
        return data && data.errors || data;
    };

    exports.default = DataProvider;
    module.exports = exports['default'];
});