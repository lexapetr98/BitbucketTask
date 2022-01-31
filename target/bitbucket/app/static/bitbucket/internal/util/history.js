define('bitbucket/internal/util/history', ['module', 'exports', 'bitbucket/util/events', 'bitbucket/internal/bbui/history/history', 'bitbucket/internal/util/deprecation'], function (module, exports, _events, _history, _deprecation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    var _deprecation2 = babelHelpers.interopRequireDefault(_deprecation);

    function trigger(name, event) {
        var oldEvent = 'memoir.' + name;
        var newEvent = 'bitbucket.internal.history.' + name;

        _deprecation2.default.triggerDeprecated(oldEvent, undefined, event, null, '4.2', '5.0');
        _events2.default.trigger(newEvent, undefined, event);
    }

    _history2.default.on('popstate', trigger.bind(null, 'popstate'));
    _history2.default.on('changestate', trigger.bind(null, 'changestate'));

    exports.default = _history2.default;
    module.exports = exports['default'];
});