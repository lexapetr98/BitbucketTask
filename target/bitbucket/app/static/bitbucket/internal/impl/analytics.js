define('bitbucket/internal/impl/analytics', ['module', 'exports', '@atlassian/aui', 'bitbucket/internal/bbui/analytics/analytics', 'bitbucket/internal/util/object'], function (module, exports, _aui, _analytics, _object) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _object2 = babelHelpers.interopRequireDefault(_object);

    function Analytics() {
        _analytics2.default.call(this);
    }

    _object2.default.inherits(Analytics, _analytics2.default);

    Analytics.prototype.trigger = function (eventName, eventAttributes) {
        var payload = {
            name: eventName,
            data: eventAttributes
        };

        _aui2.default.trigger('analytics', payload);
    };

    exports.default = new Analytics();
    module.exports = exports['default'];
});