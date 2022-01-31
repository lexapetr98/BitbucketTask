define('bitbucket/internal/feature/comment-count/comment-count', ['module', 'exports'], function (module, exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    function pullRequestRowItem(context) {
        var pullRequest = context.pullRequest;

        if (pullRequest.properties && pullRequest.properties.commentCount) {
            return bitbucket.internal.feature.commentCount({
                count: pullRequest.properties.commentCount
            });
        }

        return '';
    }

    exports.default = {
        pullRequestRowItem: pullRequestRowItem
    };
    module.exports = exports['default'];
});