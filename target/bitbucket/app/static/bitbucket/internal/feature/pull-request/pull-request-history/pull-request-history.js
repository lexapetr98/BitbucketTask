define('bitbucket/internal/feature/pull-request/pull-request-history/pull-request-history', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/feature/file-content/diff-view-type', 'bitbucket/internal/util/client-storage', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _lodash, _diffViewType, _clientStorage, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _diffViewType2 = babelHelpers.interopRequireDefault(_diffViewType);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var historyKey = void 0;
    var viewedFiles = void 0;

    function initViewedState(diffTree) {
        initSubtreeViewedState(diffTree.$tree);
    }

    function initSubtreeViewedState($tree) {
        $tree.find('.jstree-leaf').each(function (index, el) {
            var $node = (0, _jquery2.default)(el);
            if (viewedInfo($node).isViewed) {
                $node.addClass('viewed');
            }
        });
    }

    function updateViewedState($node) {
        var _viewedInfo = viewedInfo($node),
            isViewed = _viewedInfo.isViewed,
            update = _viewedInfo.update;

        if (!isViewed) {
            _clientStorage2.default.setItem(historyKey, update(viewedFiles));
            $node.addClass('viewed');
        }
    }

    function viewedInfo($node) {
        var diffViewType = $node.data('diffViewType');
        var path = $node.data('path').toString;
        var pathContentIdsKey = path + ':contentIds';
        var contentId = $node.data('contentId');
        var fromContentId = $node.data('fromContentId');
        var contentIdPair = contentId + ':' + fromContentId;
        var isViewed = void 0;
        if (_diffViewType2.default.EFFECTIVE === diffViewType) {
            // for effective diff it's important that the contentId matches the _latest_ contentId we've seen in the effective diff.
            // Otherwise, reverting a change could cause us to mark that revert as having been viewed already if we had looked at the pre-reverted version.
            // Since effective diffs are meant to track the current state of the PR, missing out on these reverts can be dangerous if overlooked.
            isViewed = viewedFiles[path] === contentId;
        } else {
            // For commits and commit ranges, it's not so important when/where we saw this diff, so we omit that information.
            // A commit or range will always show the same diff when you come back to it.
            // If I'm viewing a range of commits including A and B, and only commit A has changed this file, we should mark it
            // as viewed when I go look at A individually - I've already seen this change in the range diff. Similarly true if I saw this change
            // on the effective diff - we can safely mark it as viewed on the individual commit or on the commit range.
            // There's a question of whether the unreviewed diff holds the same danger as effective where a revert could be missed.
            // It certainly can, but since we're recording both the contentId and fromContentId, they'd have to revert and
            // then unrevert again for this to be a problem.
            // I think it's edge case enough that we can optimize for marking the same diff as viewed when seen from multiple locations and saving people time.
            isViewed = viewedFiles[pathContentIdsKey] && (0, _lodash.includes)(viewedFiles[pathContentIdsKey], contentIdPair);
        }
        return {
            isViewed: isViewed,
            update: function update(viewedFiles) {
                // if I wanted to be pure, I could stop mutating viewedFiles and return a new object, but this is faster/easier with no downside currently.
                if (_diffViewType2.default.EFFECTIVE === diffViewType) {
                    viewedFiles[path] = contentId;
                }

                var contentIdPairs = viewedFiles[pathContentIdsKey] || [];
                if (!(0, _lodash.includes)(contentIdPairs, contentIdPair)) {
                    contentIdPairs.push(contentIdPair);
                }
                viewedFiles[pathContentIdsKey] = contentIdPairs;
                return viewedFiles;
            }
        };
    }

    function init() {
        historyKey = _clientStorage2.default.buildKey('history', 'pull-request');
        viewedFiles = _clientStorage2.default.getItem(historyKey) || {};
        _events2.default.on('bitbucket.internal.feature.commit.difftree.treeInitialised', initViewedState);
        _events2.default.on('bitbucket.internal.feature.commit.difftree.nodeOpening', initSubtreeViewedState);
        _events2.default.on('bitbucket.internal.feature.commit.difftree.selectedNodeChanged', updateViewedState);
    }

    function reset() {
        historyKey = null;
        viewedFiles = null;
        _events2.default.off('bitbucket.internal.feature.commit.difftree.treeInitialised', initViewedState);
        _events2.default.off('bitbucket.internal.feature.commit.difftree.nodeOpening', initSubtreeViewedState);
        _events2.default.off('bitbucket.internal.feature.commit.difftree.selectedNodeChanged', updateViewedState);
    }

    exports.default = {
        init: init,
        reset: reset
    };
    module.exports = exports['default'];
});