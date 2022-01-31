define('bitbucket/internal/feature/alerts/reducers', ['module', 'exports', 'lodash', 'bitbucket/internal/util/reducers', './actions'], function (module, exports, _lodash, _reducers, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _reduceByType;

    function addAlert(state, action) {
        return babelHelpers.extends({}, state, {
            alerts: babelHelpers.extends({}, state.alerts, babelHelpers.defineProperty({}, action.payload.alertKey, babelHelpers.extends({}, action.payload)))
        });
    }

    function removeAlert(state, action) {
        return babelHelpers.extends({}, state, {
            alerts: (0, _lodash.omit)(state.alerts, action.payload)
        });
    }

    function toggleDialog(state, open) {
        return babelHelpers.extends({}, state, {
            dialog: babelHelpers.extends({}, state.dialog, {
                open: open
            })
        });
    }

    exports.default = (0, _reducers.reduceByType)({
        alerts: {},
        dialog: {
            open: false
        }
    }, (_reduceByType = {}, babelHelpers.defineProperty(_reduceByType, _actions.ADD_ALERT, addAlert), babelHelpers.defineProperty(_reduceByType, _actions.REMOVE_ALERT, removeAlert), babelHelpers.defineProperty(_reduceByType, _actions.DIALOG_CLOSED, function (state) {
        return toggleDialog(state, false);
    }), babelHelpers.defineProperty(_reduceByType, _actions.DIALOG_OPEN, function (state) {
        return toggleDialog(state, true);
    }), _reduceByType));
    module.exports = exports['default'];
});