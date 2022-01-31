define('bitbucket/internal/util/upgrade', ['exports', '@atlassian/aui', 'bitbucket/util/server'], function (exports, _aui, _server) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.pluginsDisabledAcknowledge = undefined;

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var pluginsDisabledAcknowledge = exports.pluginsDisabledAcknowledge = function pluginsDisabledAcknowledge() {
        var url = _aui2.default.contextPath() + '/mvc/maintenance/upgrade-notification';
        _server2.default.rest({
            url: url,
            type: 'DELETE'
        });
    };
});