define('bitbucket/internal/feature/changeset/diff-tree/helpers/navigation', ['exports', 'bitbucket/util/navbuilder'], function (exports, _navbuilder) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getPullRequestsDiffTreeFileUrl = undefined;

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var getPullRequestsDiffTreeFileUrl = exports.getPullRequestsDiffTreeFileUrl = function getPullRequestsDiffTreeFileUrl(filePath) {
        return _navbuilder2.default.currentPullRequest().diff().withFragment(filePath).build();
    };
});