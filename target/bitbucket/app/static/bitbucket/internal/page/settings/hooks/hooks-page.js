define('bitbucket/internal/page/settings/hooks/hooks-page', ['exports', 'lodash', 'react', 'react-dom', 'react-redux', 'bitbucket/internal/feature/settings/hooks/action-creators/load-hooks', 'bitbucket/internal/feature/settings/hooks/containers/hooks', 'bitbucket/internal/feature/settings/hooks/store'], function (exports, _lodash, _react, _reactDom, _reactRedux, _loadHooks, _hooks, _store) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.onReady = onReady;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _hooks2 = babelHelpers.interopRequireDefault(_hooks);

    var _store2 = babelHelpers.interopRequireDefault(_store);

    function onReady(el, currentScope, preloadHooksByType) {
        var store = (0, _store2.default)();

        (0, _lodash.forEach)(preloadHooksByType, function (hooksForType, type) {
            return store.dispatch((0, _loadHooks.populateHooks)(hooksForType, type));
        });

        _reactDom2.default.render(_react2.default.createElement(
            _reactRedux.Provider,
            { store: store },
            _react2.default.createElement(_hooks2.default, { currentScope: currentScope })
        ), el);
    }
});