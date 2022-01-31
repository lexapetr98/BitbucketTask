define('bitbucket/internal/feature/dashboard/containers/dashboard', ['module', 'exports', '@atlassian/aui', 'react', 'bitbucket/util/events', './pull-request-suggestions', './pull-requests', './repositories'], function (module, exports, _aui, _react, _events, _pullRequestSuggestions, _pullRequests, _repositories) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _pullRequestSuggestions2 = babelHelpers.interopRequireDefault(_pullRequestSuggestions);

    var _pullRequests2 = babelHelpers.interopRequireDefault(_pullRequests);

    var _repositories2 = babelHelpers.interopRequireDefault(_repositories);

    _events2.default.on('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', function (keyboardShortcuts) {
        keyboardShortcuts.enableContext('dashboard');
    });

    var Dashboard = function Dashboard() {
        return _react2.default.createElement(
            'div',
            { className: 'dashboard-container dashboard-container-horizontal' },
            _react2.default.createElement(
                'div',
                { className: 'dashboard-your-work' },
                _react2.default.createElement(
                    'h3',
                    null,
                    _aui.I18n.getText('bitbucket.web.dashboard.your.work.title')
                ),
                _react2.default.createElement(_pullRequestSuggestions2.default, null),
                _react2.default.createElement(_pullRequests2.default, null)
            ),
            _react2.default.createElement(_repositories2.default, null)
        );
    };

    exports.default = Dashboard;
    module.exports = exports['default'];
});