define('bitbucket/internal/page/pull-request/view/pull-request-view-commits', ['module', 'exports', 'jquery', 'bitbucket/internal/feature/pull-request/commits/pull-request-commits', 'bitbucket/internal/model/page-state'], function (module, exports, _jquery, _pullRequestCommits, _pageState) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _pullRequestCommits2 = babelHelpers.interopRequireDefault(_pullRequestCommits);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    exports.default = {
        load: function load(el) {
            return _pullRequestCommits2.default.init({
                el: el,
                commitsTableWebSections: _pageState2.default.getPullRequestViewInternal().commitsTableWebSections,
                pullRequest: _pageState2.default.getPullRequest(),
                repository: _pageState2.default.getRepository()
            });
        },
        unload: function unload(el) {
            _pullRequestCommits2.default.reset();
            (0, _jquery2.default)(el).empty();
        },
        keyboardShortcutContexts: ['commits']
    };
    module.exports = exports['default'];
});