define('bitbucket/internal/feature/commit/commit-pull-requests/commit-pull-requests', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/util/state', 'bitbucket/internal/feature/pull-request/list-dialog/pull-request-list-dialog', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/dom-event'], function (module, exports, _aui, _jquery, _navbuilder, _state, _pullRequestListDialog, _analytics, _domEvent) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var PullRequestDialog = babelHelpers.interopRequireWildcard(_pullRequestListDialog);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    function onReady() {
        PullRequestDialog.listenForNavigationKeyboardShortcuts();

        var repository = _state2.default.getRepository();
        var commit = _state2.default.getCommit();
        var $prLink = (0, _jquery2.default)('.commit-pull-requests-summary-link');
        var count = $prLink.length ? parseInt($prLink.find('.count').text()) : 0;

        (0, _analytics.add)('commit.pullRequest.link.loaded', {
            count: count
        });

        $prLink.on('click', function (e) {
            (0, _analytics.add)('commit.pullRequest.link.clicked', {
                count: count
            });

            if (!_domEvent2.default.openInSameTab(e)) {
                // The user is attempting to open the PR in a separate tab/window.
                // Let the browser handle the click event natively
                return;
            }

            e.preventDefault();

            var navBuilder = _navbuilder2.default.rest().repository(repository).commit(commit.id).addPathComponents('pull-requests');

            PullRequestDialog.showFor(navBuilder, {
                titleText: _aui.I18n.getText('bitbucket.web.commit.pullrequests.dialog.title'),
                onClick: function onClick(_ref) {
                    var rowIndex = _ref.rowIndex;

                    (0, _analytics.add)('commit.pullRequest.dialog.link.clicked', {
                        count: count,
                        rowIndex: rowIndex
                    });
                }
            });
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});