define('bitbucket/internal/feature/dashboard/action-creators/more-pull-requests', ['module', 'exports', '../actions'], function (module, exports, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function (type) {
        return {
            type: _actions.SHOW_MORE_PULL_REQUESTS,
            meta: {
                type: type
            }
        };
    };

    module.exports = exports['default'];
});