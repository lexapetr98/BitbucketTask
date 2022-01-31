define('bitbucket/internal/feature/alerts/selectors', ['exports', 'lodash', 'reselect', './constants'], function (exports, _lodash, _reselect, _constants) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.dialogOpen = exports.alertsBySeverity = undefined;


    function byTypeThenTitle(a, b) {
        var aType = _constants.TYPES.indexOf(a.type);
        var bType = _constants.TYPES.indexOf(b.type);
        var typeVal = aType - bType;

        return typeVal || a.title.localeCompare(b.title);
    }

    var alertsBySeverity = exports.alertsBySeverity = (0, _reselect.createSelector)([function (state) {
        return state.ui.alerts;
    }], function (alerts) {
        return (0, _lodash.values)(alerts).sort(byTypeThenTitle);
    });
    var dialogOpen = exports.dialogOpen = (0, _reselect.createSelector)([function (state) {
        return state.ui.dialog;
    }], function (dialog) {
        return dialog.open;
    });
});