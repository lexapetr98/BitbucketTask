define('bitbucket/internal/feature/settings/hooks/action-creators/notifications', ['exports', '../actions'], function (exports, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.dismissNotification = dismissNotification;
    function dismissNotification(id) {
        return {
            type: _actions.NOTIFICATION_DISMISSED,
            payload: { id: id }
        };
    }
});