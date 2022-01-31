define('bitbucket/internal/feature/alerts/containers/alerts', ['exports', '@atlassian/aui', 'react', 'react-redux', '../action-creators', '../components/alerts-empty', '../components/alerts-list', '../selectors'], function (exports, _aui, _react, _reactRedux, _actionCreators, _alertsEmpty, _alertsList, _selectors) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Alerts = undefined;

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var Alerts = exports.Alerts = function Alerts(_ref) {
        var alerts = _ref.alerts,
            remove = _ref.remove;

        if (!alerts || alerts.length === 0) {
            return _react2.default.createElement(_alertsEmpty.AlertsEmpty, null);
        }
        var title = _aui2.default.I18n.getText('bitbucket.web.alerts.title');
        return _react2.default.createElement(
            'div',
            { id: 'bitbucket-alerts', className: 'bitbucket-alerts' },
            _react2.default.createElement(_alertsList.AlertsList, { title: title, alerts: alerts, onRemove: remove })
        );
    };

    function mapStateToProps(state) {
        return {
            alerts: (0, _selectors.alertsBySeverity)(state)
        };
    }

    exports.default = (0, _reactRedux.connect)(mapStateToProps, { remove: _actionCreators.remove })(Alerts);
});