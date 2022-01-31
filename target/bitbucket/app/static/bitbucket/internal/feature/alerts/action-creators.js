define('bitbucket/internal/feature/alerts/action-creators', ['exports', './actions'], function (exports, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.openDialog = exports.closeDialog = exports.remove = exports.add = undefined;


    function generateKey(alert) {
        return alert.title.toLowerCase().split(' ').join('') + Date.now();
    }

    var add = exports.add = function add(payload) {
        return {
            type: _actions.ADD_ALERT,
            payload: babelHelpers.extends({
                alertKey: generateKey(payload)
            }, payload)
        };
    };

    var remove = exports.remove = function remove(payload) {
        return {
            type: _actions.REMOVE_ALERT,
            payload: payload
        };
    };

    var closeDialog = exports.closeDialog = function closeDialog() {
        return {
            type: _actions.DIALOG_CLOSED
        };
    };

    var openDialog = exports.openDialog = function openDialog() {
        return {
            type: _actions.DIALOG_OPEN
        };
    };
});