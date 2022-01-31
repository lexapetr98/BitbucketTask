define('bitbucket/internal/feature/repository/branch-table-pull-requests/branch-table-pull-requests', ['module', 'exports', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/pull-request/list-dialog/pull-request-list-dialog', 'bitbucket/internal/util/dom-event'], function (module, exports, _jquery, _navbuilder, _pullRequestListDialog, _domEvent) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var PullRequestDialog = babelHelpers.interopRequireWildcard(_pullRequestListDialog);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    function onReady() {
        PullRequestDialog.listenForNavigationKeyboardShortcuts();

        (0, _jquery2.default)('.branch-list-panel').on('click', '.pull-request-list-trigger', function (e) {
            if (e.target.tagName === 'A' && !_domEvent2.default.openInSameTab(e)) {
                // The user is attempting to open the PR in a separate tab/window.
                // Let the browser handle the click event natively
                return;
            }

            e.preventDefault();

            var branchId = (0, _jquery2.default)(this).closest('[data-branch-id]').attr('data-branch-id');

            var navBuilder = _navbuilder2.default.rest().currentRepo().allPullRequests().withParams({
                at: branchId,
                direction: 'outgoing',
                order: 'newest',
                state: 'ALL'
            });

            PullRequestDialog.showFor(navBuilder);
        });

        (0, _jquery2.default)('.pull-request-list-trigger').tooltip({
            gravity: 'n',
            live: true
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});