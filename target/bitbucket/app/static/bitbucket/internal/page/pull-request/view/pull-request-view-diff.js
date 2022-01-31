define('bitbucket/internal/page/pull-request/view/pull-request-view-diff', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/util/state', 'bitbucket/internal/feature/commit/request-commit', 'bitbucket/internal/feature/pull-request/diff/pull-request-diff', 'bitbucket/internal/model/commit-range', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/revision', 'bitbucket/internal/util/history'], function (module, exports, _jquery, _lodash, _navbuilder, _state, _requestCommit, _pullRequestDiff, _commitRange, _pageState, _revision, _history) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _requestCommit2 = babelHelpers.interopRequireDefault(_requestCommit);

    var _pullRequestDiff2 = babelHelpers.interopRequireDefault(_pullRequestDiff);

    var _commitRange2 = babelHelpers.interopRequireDefault(_commitRange);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _revision2 = babelHelpers.interopRequireDefault(_revision);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    var currentCommit = void 0;
    var currentCommitRange = void 0;

    var commitUrl = function commitUrl(commit) {
        return _navbuilder2.default.currentRepo().pullRequest(_pageState2.default.getPullRequest()).commit(commit.id).buildAbsolute();
    };

    var commitRangeUrl = function commitRangeUrl(commitRange) {
        return _navbuilder2.default.currentRepo().pullRequest(_pageState2.default.getPullRequest()).commit(commitRange.untilRevision.id).since(commitRange.sinceRevision.id).buildAbsolute();
    };

    var initPullRequestDiff = function initPullRequestDiff(el, commit, commitRange) {
        _pageState2.default.setCommit(commit && new _revision2.default(commit));
        _pageState2.default.setCommitRange(commitRange && new _commitRange2.default(commitRange));

        el.innerHTML = bitbucket.internal.feature.pullRequest.diff({
            commit: _state2.default.getCommit(),
            repository: _state2.default.getRepository()
        });
        _pullRequestDiff2.default.init({
            commit: _state2.default.getCommit(),
            commitRange: _pageState2.default.getCommitRange(),
            currentUser: _pageState2.default.getCurrentUser(),
            pullRequest: _pageState2.default.getPullRequest(),
            maxChanges: _pageState2.default.getPullRequestViewInternal().maxChanges,
            relevantContextLines: _pageState2.default.getPullRequestViewInternal().relevantContextLines,
            seenCommitReview: _pageState2.default.getPullRequestViewInternal().seenCommitReview
        });
    };

    var isCommitUrl = function isCommitUrl() {
        return (0, _lodash.startsWith)(location.href, _navbuilder2.default.currentPullRequest().commit('').buildAbsolute() + '/') && !_navbuilder2.default.parse(location.href).getQueryParamValue('since');
    };

    var isCommitRangeUrl = function isCommitRangeUrl() {
        return (0, _lodash.startsWith)(location.href, _navbuilder2.default.currentPullRequest().commit('').buildAbsolute() + '/') && _navbuilder2.default.parse(location.href).getQueryParamValue('since');
    };

    var getCommitRangeFromUrl = function getCommitRangeFromUrl() {
        var sinceCommit = _navbuilder2.default.parse(location.href).getQueryParamValue('since');
        var untilCommit = _navbuilder2.default.parse(location.href).path().split('/').pop();

        return untilCommit && sinceCommit && {
            untilRevision: { id: untilCommit },
            sinceRevision: { id: sinceCommit }
        };
    };

    exports.default = {
        load: function load(el) {
            var _ref = _history2.default.state() || {},
                historyCommit = _ref.commit,
                historyCommitRange = _ref.commitRange;

            if (isCommitUrl()) {
                var isCurrentCommitUrl = isCommitUrl() && currentCommit && (0, _lodash.startsWith)(location.href, commitUrl(currentCommit));
                var commit = isCurrentCommitUrl && currentCommit || historyCommit;
                return (commit ? Promise.resolve(commit) : (0, _requestCommit2.default)({
                    commitId: _navbuilder2.default.parse(location.href).path().split('/').pop()
                })).then(function (commit) {
                    initPullRequestDiff(el, commit, null);
                });
            }

            if (isCommitRangeUrl()) {
                var isCurrentCommitRangeUrl = isCommitRangeUrl() && currentCommitRange && (0, _lodash.startsWith)(location.href, commitRangeUrl(currentCommitRange));
                var commitRange = isCurrentCommitRangeUrl && currentCommitRange || historyCommitRange && historyCommitRange || isCommitRangeUrl() && getCommitRangeFromUrl();
                return initPullRequestDiff(el, null, commitRange);
            }

            //Load effective diff
            initPullRequestDiff(el, null, null);
        },
        unload: function unload(el) {
            currentCommit = _pageState2.default.getCommit() && _pageState2.default.getCommit().toJSON() || currentCommit;
            _pageState2.default.setCommit(null);
            currentCommitRange = _pageState2.default.getCommitRange() && _pageState2.default.getCommitRange().toJSON() || currentCommitRange;
            _pageState2.default.setCommitRange(null);
            return _pullRequestDiff2.default.reset().done(function () {
                //Don't empty the el until the promise is done to avoid blowing away any data needed for cleanup
                (0, _jquery2.default)(el).empty();
            });
        },
        keyboardShortcutContexts: ['diff-tree', 'diff-view']
    };
    module.exports = exports['default'];
});