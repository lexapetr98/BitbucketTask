define('bitbucket/internal/feature/compare/compare-diffs', ['module', 'exports', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/comments/comments', 'bitbucket/internal/feature/commit/tree-and-diff-view/tree-and-diff-view', 'bitbucket/internal/feature/file-content/diff-view-type', 'bitbucket/internal/layout/page-scrolling-manager', 'bitbucket/internal/model/commit-range', 'bitbucket/internal/model/diff-type', 'bitbucket/internal/model/revision', 'bitbucket/internal/util/bacon'], function (module, exports, _jquery, _navbuilder, _comments, _treeAndDiffView, _diffViewType, _pageScrollingManager, _commitRange, _diffType, _revision, _bacon) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = onReady;

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _comments2 = babelHelpers.interopRequireDefault(_comments);

    var _treeAndDiffView2 = babelHelpers.interopRequireDefault(_treeAndDiffView);

    var _diffViewType2 = babelHelpers.interopRequireDefault(_diffViewType);

    var _pageScrollingManager2 = babelHelpers.interopRequireDefault(_pageScrollingManager);

    var _commitRange2 = babelHelpers.interopRequireDefault(_commitRange);

    var _diffType2 = babelHelpers.interopRequireDefault(_diffType);

    var _revision2 = babelHelpers.interopRequireDefault(_revision);

    var _bacon2 = babelHelpers.interopRequireDefault(_bacon);

    /**
     * Get a builder to build the branch compare URLs.
     *
     * @param {CommitRange} commitRange the commit range specifying the source and target branches
     * @param {string} action whether to query for the diff or the file changes; accepted values are: 'diff' or 'changes'
     * @param {Object} [actionArg] a optional extra parameter for the action
     * @returns {bitbucket/util/navbuilder.Builder} a builder to build the branch compare URLs
     * @private
     */
    function getCompareUrlBuilder(commitRange, action, actionArg) {
        var commitRangeJSON = commitRange.toJSON ? commitRange.toJSON() : commitRange;
        var fromRef = commitRangeJSON.untilRevision;
        var toRef = commitRangeJSON.sinceRevision;
        return _navbuilder2.default.rest().project(toRef.repository.project.key).repo(toRef.repository.slug).compare()[action](actionArg).from(fromRef.id).fromRepo(fromRef.repository.id).to(toRef.id);
    }

    /**
     * Get a builder to build the URL used to fetch the file changes between two branches.
     *
     * @param {number} start start index
     * @param {number} limit max number of changes
     * @param {CommitRange} commitRange commit range specifying the source and target branches
     * @returns {bitbucket/util/navbuilder.Builder} a builder to build the URL used to fetch the file changes
     * @private
     */
    function getChangesUrlBuilder(start, limit, commitRange) {
        return getCompareUrlBuilder(commitRange, 'changes').withParams({
            start: start,
            limit: limit
        });
    }

    /**
     * Get a builder to build the URL used to fetch the diff between two branches.
     *
     * @param {FileChange} fileChange a fileChange model specifying the source branch, the target branch and the file to diff
     * @returns {bitbucket/util/navbuilder.Builder} a builder to build the URL used to fetch the diff
     * @private
     */
    function getDiffUrlBuilder(fileChange) {
        var fileChangeJSON = fileChange.toJSON ? fileChange.toJSON() : fileChange;
        return getCompareUrlBuilder(fileChangeJSON.commitRange, 'diff', fileChangeJSON);
    }

    /**
     * Convert a branch object to a revision.
     *
     * @param {Branch} branch a branch
     * @returns {Revision} the branch as a revision
     * @private
     */
    function toRevision(branch) {
        return new _revision2.default({
            id: branch.getLatestCommit(),
            repository: branch.getRepository()
        });
    }

    function onReady(diffTreeHeaderWebItems, maxChanges) {
        var keyboardRegisterEvent = _bacon2.default.events('bitbucket.internal.widget.keyboard-shortcuts.register-contexts');
        return function renderCompareDiffs(sourceTargetSelector, $el) {
            var $treeAndDiffView = (0, _jquery2.default)(bitbucket.internal.feature.compare.diff({
                diffTreeHeaderWebItems: diffTreeHeaderWebItems
            }));

            // This _needs_ to be before init(), otherwise it doesn't display
            $el.append($treeAndDiffView);
            _treeAndDiffView2.default.init(new _commitRange2.default({
                // tree-and-diff view requires a CommitRange, so the branch refs are mapped as follow:
                // - from (source branch) -> untilRevision
                // - to (target branch) -> sinceRevision
                untilRevision: toRevision(sourceTargetSelector.getSourceBranch()),
                sinceRevision: toRevision(sourceTargetSelector.getTargetBranch()),
                diffType: _diffType2.default.RANGE
            }), {
                changesUrlBuilder: getChangesUrlBuilder,
                diffUrlBuilder: getDiffUrlBuilder,
                commentMode: _comments2.default.commentMode.NONE,
                maxChanges: maxChanges,
                numberOfParents: 0,
                toolbarWebFragmentLocationPrimary: 'bitbucket.commit.diff.toolbar.primary',
                toolbarWebFragmentLocationSecondary: 'bitbucket.commit.diff.toolbar.secondary',
                diffViewType: _diffViewType2.default.COMMON_ANCESTOR
            });

            // Need to enable scrolling for this page to ensure the diff view displays/scrolls like normal
            var scrollingDestroy = _pageScrollingManager2.default.acceptScrollForwardingRequests();

            var keyboardDestroy = keyboardRegisterEvent.onValue(function (keyboardShortcuts) {
                keyboardShortcuts.enableContext('diff-view');
                keyboardShortcuts.enableContext('diff-tree');
            });

            return function () {
                keyboardDestroy();
                _treeAndDiffView2.default.reset();
                scrollingDestroy();
            };
        };
    }
    module.exports = exports['default'];
});