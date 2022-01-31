define('bitbucket/internal/feature/alerts/components/alerts-empty', ['exports', '@atlassian/aui', 'react'], function (exports, _aui, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.AlertsEmpty = undefined;

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var AlertsEmpty = exports.AlertsEmpty = function AlertsEmpty() {
        return _react2.default.createElement(
            'div',
            { className: 'alerts-empty' },
            _react2.default.createElement('div', { className: 'empty-img' }),
            _react2.default.createElement(
                'p',
                null,
                _aui2.default.I18n.getText('bitbucket.web.alerts.empty')
            )
        );
    };
});