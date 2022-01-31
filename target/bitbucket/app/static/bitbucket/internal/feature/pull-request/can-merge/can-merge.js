define('bitbucket/internal/feature/pull-request/can-merge/can-merge', ['module', 'exports', 'bitbucket/internal/util/events'], function (module, exports, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _events2 = babelHelpers.interopRequireDefault(_events);

    function canMerge() {
        _events2.default.trigger('bitbucket.internal.feature.pull-request.merge-check');
    }

    exports.default = canMerge;
    module.exports = exports['default'];
});