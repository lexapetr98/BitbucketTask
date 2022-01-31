define('bitbucket/internal/page/dashboard/dashboard', ['exports', 'react', 'react-dom', 'react-redux', 'bitbucket/internal/feature/dashboard/containers/dashboard', 'bitbucket/internal/feature/dashboard/pull-request-type', 'bitbucket/internal/feature/dashboard/store', '../../feature/dashboard/action-creators/load-pull-request-suggestions', '../../feature/dashboard/action-creators/load-pull-requests', '../../feature/dashboard/action-creators/load-repositories', '../../feature/dashboard/repository-type'], function (exports, _react, _reactDom, _reactRedux, _dashboard, _pullRequestType, _store, _loadPullRequestSuggestions, _loadPullRequests, _loadRepositories, _repositoryType) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.onReady = onReady;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _dashboard2 = babelHelpers.interopRequireDefault(_dashboard);

    var _store2 = babelHelpers.interopRequireDefault(_store);

    function onReady(el, _ref) {
        var pullRequests = _ref.pullRequests,
            recentRepositories = _ref.recentRepositories,
            pullRequestSuggestions = _ref.pullRequestSuggestions;

        var store = (0, _store2.default)();

        [_pullRequestType.REVIEWING, _pullRequestType.CREATED, _pullRequestType.CLOSED].forEach(function (type) {
            store.dispatch((0, _loadPullRequests.populatePullRequests)(pullRequests[type], { type: type }));
        });

        store.dispatch((0, _loadRepositories.populateRepositories)(recentRepositories, { repoType: _repositoryType.RECENT }));
        store.dispatch((0, _loadPullRequestSuggestions.populateSuggestions)(pullRequestSuggestions));

        _reactDom2.default.render(_react2.default.createElement(
            _reactRedux.Provider,
            { store: store },
            _react2.default.createElement(_dashboard2.default, null)
        ), el);
    }
});