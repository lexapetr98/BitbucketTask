define('bitbucket/internal/next/page/pull-request/view/diff/pull-request-view-diff', ['exports', 'react', 'react-dom'], function (exports, _react, _reactDom) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.unload = exports.load = undefined;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var load = exports.load = function load(el, context) {
        return _reactDom2.default.render(_react2.default.createElement(
            'h2',
            { id: 'pull-request-next-diff-placeholder' },
            'New Diff tab'
        ), el);
    };

    var unload = exports.unload = function unload(el) {
        return _reactDom2.default.unmountComponentAtNode(el);
    };
});