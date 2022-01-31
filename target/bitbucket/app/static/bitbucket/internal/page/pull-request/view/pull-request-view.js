define('bitbucket/internal/page/pull-request/view/pull-request-view', ['module', 'exports', '@atlassian/aui', 'bitbucket/internal/layout/pull-request/pull-request', 'bitbucket/internal/model/page-state'], function (module, exports, _aui, _pullRequest, _pageState) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _pullRequest2 = babelHelpers.interopRequireDefault(_pullRequest);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    function onReady(unwatched) {
        if (unwatched) {
            (0, _aui.flag)({
                type: 'success',
                title: _aui.I18n.getText('bitbucket.web.pullrequest.unwatched.header', _pageState2.default.getPullRequest().getId()),
                close: 'auto',
                body: _aui.I18n.getText('bitbucket.web.pullrequest.unwatched.content')
            });
        }
    }

    exports.default = {
        registerHandler: _pullRequest2.default.registerHandler,
        onReady: onReady
    };
    module.exports = exports['default'];
});