define('bitbucket/internal/feature/alerts/alerts', ['exports', 'lodash', 'react', 'react-dom', 'react-redux', 'bitbucket/util/events', 'bitbucket/internal/bbui/aui-react/inline-dialog', 'bitbucket/internal/feature/alerts/reducers', 'bitbucket/internal/util/redux', './action-creators', './alerts-trigger', './containers/alerts'], function (exports, _lodash, _react, _reactDom, _reactRedux, _events, _inlineDialog, _reducers, _redux, _actionCreators, _alertsTrigger, _alerts) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.onReady = onReady;
    exports.add = add;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _inlineDialog2 = babelHelpers.interopRequireDefault(_inlineDialog);

    var _reducers2 = babelHelpers.interopRequireDefault(_reducers);

    var _alertsTrigger2 = babelHelpers.interopRequireDefault(_alertsTrigger);

    var _alerts2 = babelHelpers.interopRequireDefault(_alerts);

    var store = (0, _redux.createActorStore)({
        ui: _reducers2.default
    });

    var onShow = function onShow() {
        store.dispatch((0, _actionCreators.openDialog)());
        _events2.default.trigger('bitbucket.internal.ui.alerts.dialog.opened');
    };

    var onHide = function onHide() {
        return store.dispatch((0, _actionCreators.closeDialog)());
    };

    function onReady($trigger) {
        var dialogId = 'alerts-content';
        var $newTrigger = $trigger.clone();
        // the current trigger needs to be replaced with a new element in the DOM
        // so that AUI can pick it up as an aui-trigger (it's skated)
        $newTrigger.attr({
            'data-aui-trigger': true,
            'aria-controls': dialogId
        });
        $trigger.replaceWith($newTrigger);
        new _alertsTrigger2.default($newTrigger, store);

        var containerDiv = document.createElement('div');
        containerDiv.id = 'alerts-content-container';
        document.body.appendChild(containerDiv);

        _reactDom2.default.render(_react2.default.createElement(
            _inlineDialog2.default,
            { id: dialogId, alignment: 'bottom right', onShow: onShow, onHide: onHide },
            _react2.default.createElement(
                _reactRedux.Provider,
                { store: store },
                _react2.default.createElement(_alerts2.default, null)
            )
        ), containerDiv);
    }

    /**
     * @typedef {object} Alert
     * @property {AlertType} type
     * @property {string} title
     * @property {string} [description]
     * @property {string} [anchorText]
     * @property {function} [anchorCallback]
     * @property {string} [anchorLink]
     * @property {boolean} [closeable]
     * @property {function} [closeCallback]
     */

    /**
     * Adds an alert
     * @param {Alert} alert - the alert to add
     * @returns {String} the added alert's key
     */
    function add(alert) {
        return store.dispatch((0, _actionCreators.add)(alert)).payload.alertKey;
    }
});