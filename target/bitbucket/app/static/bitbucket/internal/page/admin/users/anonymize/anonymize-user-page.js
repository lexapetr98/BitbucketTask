define('bitbucket/internal/page/admin/users/anonymize/anonymize-user-page', ['exports', 'react', 'react-dom', 'bitbucket/internal/feature/user/anonymize/anonymize-user'], function (exports, _react, _reactDom, _anonymizeUser) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.onReady = onReady;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _anonymizeUser2 = babelHelpers.interopRequireDefault(_anonymizeUser);

    function onReady(el) {
        _reactDom2.default.render(_react2.default.createElement(_anonymizeUser2.default, null), el);
    }
});