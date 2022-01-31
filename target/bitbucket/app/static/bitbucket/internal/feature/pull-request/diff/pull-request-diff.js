define('bitbucket/internal/feature/pull-request/diff/pull-request-diff', ['module', 'exports', '@atlassian/aui', 'chaperone', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/commit/tree-and-diff-view/tree-and-diff-view', 'bitbucket/internal/feature/file-content/commit-selector/commit-selector', 'bitbucket/internal/feature/file-content/diff-view-type', 'bitbucket/internal/feature/file-content/request-change', 'bitbucket/internal/feature/pull-request/pull-request-history/pull-request-history', 'bitbucket/internal/layout/page-scrolling-manager', 'bitbucket/internal/model/commit-range', 'bitbucket/internal/model/diff-type', 'bitbucket/internal/model/file-content-modes', 'bitbucket/internal/model/path-and-line', 'bitbucket/internal/model/revision', 'bitbucket/internal/util/events', 'bitbucket/internal/util/history'], function (module, exports, _aui, _chaperone, _jquery, _lodash, _navbuilder, _treeAndDiffView, _commitSelector, _diffViewType, _requestChange, _pullRequestHistory, _pageScrollingManager, _commitRange, _diffType, _fileContentModes, _pathAndLine, _revision, _events, _history) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _chaperone2 = babelHelpers.interopRequireDefault(_chaperone);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _treeAndDiffView2 = babelHelpers.interopRequireDefault(_treeAndDiffView);

    var _commitSelector2 = babelHelpers.interopRequireDefault(_commitSelector);

    var _diffViewType2 = babelHelpers.interopRequireDefault(_diffViewType);

    var _requestChange2 = babelHelpers.interopRequireDefault(_requestChange);

    var _pullRequestHistory2 = babelHelpers.interopRequireDefault(_pullRequestHistory);

    var _pageScrollingManager2 = babelHelpers.interopRequireDefault(_pageScrollingManager);

    var _commitRange2 = babelHelpers.interopRequireDefault(_commitRange);

    var _diffType2 = babelHelpers.interopRequireDefault(_diffType);

    var _fileContentModes2 = babelHelpers.interopRequireDefault(_fileContentModes);

    var _pathAndLine2 = babelHelpers.interopRequireDefault(_pathAndLine);

    var _revision2 = babelHelpers.interopRequireDefault(_revision);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    var EFFECTIVE = _diffType2.default.EFFECTIVE,
        COMMIT = _diffType2.default.COMMIT,
        RANGE = _diffType2.default.RANGE;


    var _destroyables = [];
    var _unreviewedStatusChange = null;
    var _changesRequest = void 0;

    var COMMITSELECTOR_CSS_SELECTOR = '.file-tree-container .commit-selector-button';

    var allCommitsReviewed = function allCommitsReviewed(latestCommit, pullRequest) {
        return latestCommit === pullRequest.getFromRef().getLatestCommit();
    };

    var destroyUnreviewedStatusChangeHandler = function destroyUnreviewedStatusChangeHandler() {
        if (_unreviewedStatusChange !== null) {
            _unreviewedStatusChange.destroy();
            _unreviewedStatusChange = null;
        }
    };

    var prUrlBuilder = function prUrlBuilder(pr) {
        return _navbuilder2.default.project(pr.getToRef().getRepository().getProject()).repo(pr.getToRef().getRepository()).pullRequest(pr);
    };

    var prRESTUrlBuilder = function prRESTUrlBuilder(pr) {
        return _navbuilder2.default.rest().project(pr.getToRef().getRepository().getProject()).repo(pr.getToRef().getRepository()).pullRequest(pr);
    };

    var commitDiffRESTUrlBuilder = function commitDiffRESTUrlBuilder(pullRequest) {
        return function (fileChange) {
            var range = fileChange.commitRange;
            return prRESTUrlBuilder(pullRequest).diff(fileChange).withParams({
                diffType: range.diffType,
                sinceId: range.sinceRevision.id,
                untilId: range.untilRevision.id
            });
        };
    };

    var commitUrlBuilder = function commitUrlBuilder(pullRequest, commit) {
        return prUrlBuilder(pullRequest).commit(commit.id);
    };

    var commitRangeDiffUrlBuilder = function commitRangeDiffUrlBuilder(_ref) {
        var pullRequest = _ref.pullRequest,
            commit = _ref.commit,
            since = _ref.since;

        return prUrlBuilder(pullRequest).commit(commit).since(since);
    };

    var pullRequestDiffRESTUrlBuilder = function pullRequestDiffRESTUrlBuilder(pullRequest) {
        return function (fileChange) {
            return prRESTUrlBuilder(pullRequest).diff(fileChange);
        };
    };

    var pullRequestDiffUrlBuilder = function pullRequestDiffUrlBuilder(pullRequest) {
        return prUrlBuilder(pullRequest).diff();
    };

    var pullRequestUnreviewedUrl = function pullRequestUnreviewedUrl(pullRequest) {
        return prUrlBuilder(pullRequest).unreviewed().build();
    };

    var getCommitRange = function getCommitRange(commit, commitRange, pullRequest) {
        if (commit) {
            return new _commitRange2.default({
                pullRequest: pullRequest,
                sinceRevision: commit.parents ? new _revision2.default(commit.parents[0]) : undefined,
                untilRevision: new _revision2.default(commit),
                diffType: COMMIT
            });
        }

        if (commitRange) {
            return new _commitRange2.default({
                pullRequest: pullRequest,
                sinceRevision: commitRange.getSinceRevision(),
                untilRevision: commitRange.getUntilRevision()
                // diffType will be calculated - might be range or might be commit
            });
        }

        return new _commitRange2.default({ pullRequest: pullRequest, diffType: EFFECTIVE });
    };

    var getPreloadItems = function getPreloadItems(_ref2) {
        var commit = _ref2.commit,
            commitRange = _ref2.commitRange,
            pullRequest = _ref2.pullRequest,
            lastReviewedCommit = _ref2.lastReviewedCommit,
            unreviewedCommits = _ref2.unreviewedCommits,
            includesMerge = _ref2.includesMerge;

        var preloadItems = [{
            href: pullRequestDiffUrlBuilder(pullRequest).build(),
            icon: bitbucket.internal.feature.fileContent.allCommitsIcon(),
            messageHtml: _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.diff.all.changes.displayed')),
            selected: !commit && !commitRange
        }];

        if (lastReviewedCommit) {
            if (unreviewedCommits) {
                !includesMerge && initIterativeReviewFeatureDiscovery();
                preloadItems.push({
                    commitRange: {
                        sinceRevision: { id: lastReviewedCommit },
                        untilRevision: {
                            id: pullRequest.getFromRef().getLatestCommit()
                        }
                    },
                    href: commitRangeDiffUrlBuilder({
                        pullRequest: pullRequest,
                        commit: pullRequest.getFromRef().getLatestCommit(),
                        since: lastReviewedCommit
                    }).build(),
                    icon: bitbucket.internal.feature.fileContent.singleCommitIcon(),
                    messageHtml: bitbucket.internal.feature.pullRequest.commitSelectorUnreviewedCommits({
                        unreviewedCommits: unreviewedCommits,
                        includesMerge: includesMerge
                    }),
                    size: includesMerge ? 'large' : 'small',
                    selected: !commit && commitRange && commitRange.getSinceRevision().getId() === lastReviewedCommit && commitRange.getUntilRevision().getId() === pullRequest.getFromRef().getLatestCommit()
                });
                // if there are no unreviewed commits and lastReviewedCommit is not head of the branch there's been a rebase
            } else if (lastReviewedCommit === pullRequest.getFromRef().getLatestCommit()) {
                preloadItems.push({
                    disabled: true,
                    href: '',
                    messageHtml: _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.diff.no.unreviewed.changes')),
                    selected: false
                });
            }
        }

        return preloadItems;
    };

    var getSelectedItem = function getSelectedItem(preloadItems) {
        return _lodash2.default.find(preloadItems, 'selected');
    };

    var getTreeAndDiffViewOptions = function getTreeAndDiffViewOptions(commit, commitRange, pullRequest, maxChanges, relevantContextLines) {
        var diffType = commitRange && commitRange.getDiffType() || commit && COMMIT || EFFECTIVE;
        var _commentUrlBuilder = prRESTUrlBuilder(pullRequest).comments();
        var diffUrlBuilder = void 0;
        var toolbarWebFragmentLocationPrimary = void 0;
        var toolbarWebFragmentLocationSecondary = void 0;
        var diffViewType = void 0;

        if (diffType === EFFECTIVE) {
            diffUrlBuilder = pullRequestDiffRESTUrlBuilder(pullRequest);
            toolbarWebFragmentLocationPrimary = 'bitbucket.pull-request.diff.toolbar.primary';
            toolbarWebFragmentLocationSecondary = 'bitbucket.pull-request.diff.toolbar.secondary';
            diffViewType = _diffViewType2.default.EFFECTIVE;
        } else {
            diffUrlBuilder = commitDiffRESTUrlBuilder(pullRequest);
            toolbarWebFragmentLocationPrimary = 'bitbucket.pull-request.commit.diff.toolbar.primary';
            toolbarWebFragmentLocationSecondary = 'bitbucket.pull-request.commit.diff.toolbar.secondary';
            diffViewType = _diffViewType2.default.COMMON_ANCESTOR;

            if (diffType === RANGE) {
                _commentUrlBuilder = _commentUrlBuilder.range(commitRange.getSinceRevision().getId(), commitRange.getUntilRevision().getId());
            } else {
                _commentUrlBuilder = _commentUrlBuilder.commit(commit);
            }
        }

        return {
            changesUrlBuilder: function changesUrlBuilder(start, limit, changesCommitRange) {
                return _navbuilder2.default.rest().currentRepo().changes(changesCommitRange).withParams({ start: start, limit: limit });
            },
            commentMode: _treeAndDiffView2.default.commentMode.CREATE_NEW,
            commentUrlBuilder: function commentUrlBuilder() {
                return _commentUrlBuilder;
            },
            diffUrlBuilder: diffUrlBuilder,
            linkToCommit: Boolean(commit),
            maxChanges: maxChanges,
            relevantContextLines: relevantContextLines,
            toolbarWebFragmentLocationPrimary: toolbarWebFragmentLocationPrimary,
            toolbarWebFragmentLocationSecondary: toolbarWebFragmentLocationSecondary,
            diffViewType: diffViewType
        };
    };

    var fireViewEvent = function fireViewEvent(commit, commitRange) {
        if (commit) {
            // Analytics event: stash.client.pullRequest.commitDiff.view
            _events2.default.trigger('bitbucket.internal.feature.pullRequest.commitDiff.view', null, {
                commitJSON: commit
            });
        } else if (commitRange) {
            // Analytics event: stash.client.pullRequest.iterativeDiff.view
            _events2.default.trigger('bitbucket.internal.feature.pullRequest.iterativeDiff.view', null, {
                commitRangeJSON: commitRange.toJSON()
            });
        } else {
            // Analytics event: stash.client.pullRequest.effectiveDiff.view
            _events2.default.trigger('bitbucket.internal.feature.pullRequest.effectiveDiff.view', null, {});
        }
    };

    var initIterativeReviewFeatureDiscovery = _lodash2.default.once(function () {
        _chaperone2.default.registerFeature('iterative-review', [{
            id: 'iterative-review',
            alignment: 'right top',
            selector: COMMITSELECTOR_CSS_SELECTOR,
            title: _aui2.default.I18n.getText('bitbucket.web.pullrequest.iterativereview.discovery.main.title'),
            content: _aui2.default.I18n.getText('bitbucket.web.pullrequest.iterativereview.discovery.main.desc'),
            width: 370,
            close: {
                text: _aui2.default.I18n.getText('bitbucket.web.got.it')
            },
            moreInfo: {
                href: bitbucket_help_url('bitbucket.help.pull.request'),
                text: _aui2.default.I18n.getText('bitbucket.web.pullrequest.learn.more'),
                extraAttributes: {
                    target: '_blank'
                }
            },
            once: true
        }]);
    });

    /**
     * Initialise feature discovery for Commit Level Review
     */
    var initCommitLevelReviewFeatureDiscovery = _lodash2.default.once(function () {
        _chaperone2.default.registerFeature('commit-level-review', [{
            id: 'commit-level-review',
            alignment: 'right top',
            selector: COMMITSELECTOR_CSS_SELECTOR,
            content: bitbucket.internal.feature.pullRequest.commitLevelReviewFeatureDiscoveryContent(),
            width: 300,
            close: {
                text: _aui2.default.I18n.getText('bitbucket.web.got.it')
            },
            moreInfo: {
                href: bitbucket_help_url('bitbucket.help.pull.request'),
                text: _aui2.default.I18n.getText('bitbucket.web.pullrequest.learn.more'),
                extraAttributes: {
                    target: '_blank'
                }
            },
            once: true
        }]);
    });

    function init(_ref3) {
        var _this = this;

        var commit = _ref3.commit,
            commitRange = _ref3.commitRange,
            currentUser = _ref3.currentUser,
            pullRequest = _ref3.pullRequest,
            maxChanges = _ref3.maxChanges,
            relevantContextLines = _ref3.relevantContextLines,
            seenCommitReview = _ref3.seenCommitReview;

        var unreviewedCommits = void 0;
        var includesMerge = false;
        var lastReviewedCommit = pullRequest.getReviewers().findByUser(currentUser) && pullRequest.getReviewers().findByUser(currentUser).getLastReviewedCommit();

        var isArbitraryDiff = function isArbitraryDiff(commitRange) {
            return commitRange && (commitRange.getSinceRevision().getId() !== lastReviewedCommit || commitRange.getUntilRevision().getId() !== pullRequest.getFromRef().getLatestCommit());
        };

        var initCommitSelector = function initCommitSelector(commit, commitRange, includesMerge) {
            var preloadItems = getPreloadItems({
                commit: commit,
                commitRange: commitRange,
                pullRequest: pullRequest,
                lastReviewedCommit: lastReviewedCommit,
                unreviewedCommits: unreviewedCommits,
                includesMerge: includesMerge
            });

            if (lastReviewedCommit && unreviewedCommits) {
                _unreviewedStatusChange = _events2.default.chainWith(pullRequest.getReviewers().findByUser(currentUser)).on('change:lastReviewedCommit', function (reviewer, latestCommit) {
                    unreviewedCommits = false;
                    lastReviewedCommit = latestCommit;
                    _this.commitSelector.resetDialog();
                    if (isArbitraryDiff(commitRange) && !(0, _jquery2.default)('.arbitrary-diff-button').length) {
                        renderArbitraryDiffButton(commitRange);
                    }
                    destroyUnreviewedStatusChangeHandler();
                });
            }

            var useLastReviewedCommit = !allCommitsReviewed(lastReviewedCommit, pullRequest);
            _this.commitSelector.resetDialog();
            _this.commitSelector.init({
                commitRange: commitRange,
                updateButton: true,
                selectedCommit: commit,
                selectedItem: getSelectedItem(preloadItems),
                itemTemplate: function itemTemplate(props) {
                    var isLastReviewedCommit = useLastReviewedCommit && props.commit.id === lastReviewedCommit;
                    return bitbucket.internal.feature.fileContent.commitSelectorItemMessage(babelHelpers.extends({}, props, {
                        beforeContent: isLastReviewedCommit ? bitbucket.internal.feature.pullRequest.lastReviewedMarker() : null
                    }));
                },
                itemExtraClasses: function itemExtraClasses(item) {
                    if (useLastReviewedCommit && item.hasOwnProperty('id') && item.id === lastReviewedCommit) {
                        return ['last-reviewed-commit'];
                    } else if (item.commitRange) {
                        return ['unreviewed-commits-item'];
                    }
                    return [];
                },
                itemUrl: function itemUrl(commit) {
                    return commitUrlBuilder(pullRequest, commit).build();
                },
                lastPageMessage: _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.no.more.commits'),
                mode: _fileContentModes2.default.DIFF,
                path: new _pathAndLine2.default(decodeURI(window.location.hash.substring(1))),
                preloadItems: preloadItems,
                pullRequest: pullRequest,
                includesMerge: includesMerge
            });
        };

        var initInternal = function initInternal(commit, commitRange) {
            var currentCommitRange = getCommitRange(commit, commitRange, pullRequest);

            // update diff tab url
            (0, _jquery2.default)('.menu-item[data-module-key="bitbucket.pull-request.nav.diff"] > a').attr('href', location.href);
            destroyUnreviewedStatusChangeHandler();

            fireViewEvent(commit, commitRange);
            _treeAndDiffView2.default.reset();
            _treeAndDiffView2.default.init(currentCommitRange, getTreeAndDiffViewOptions(commit, commitRange, pullRequest, maxChanges, relevantContextLines));
            if (isArbitraryDiff(commitRange)) {
                renderArbitraryDiffButton(commitRange);
            } else {
                initCommitSelector(commit, commitRange, includesMerge);
            }
            if (!seenCommitReview) {
                initCommitLevelReviewFeatureDiscovery();
            }
        };

        var renderArbitraryDiffButton = function renderArbitraryDiffButton(commitRange) {
            var $arbitraryDiffButton = (0, _jquery2.default)(bitbucket.internal.feature.pullRequest.arbitraryDiffButton({
                sinceCommit: commitRange.getSinceRevision().getId(),
                untilCommit: commitRange.getUntilRevision().getId()
            }));
            var $commitSelectorButton = (0, _jquery2.default)(COMMITSELECTOR_CSS_SELECTOR);
            var exitArbitraryDiff = function exitArbitraryDiff() {
                $arbitraryDiffButton.remove();
                $commitSelectorButton.show();
                _history2.default.pushState({}, null, pullRequestUnreviewedUrl(pullRequest));
            };

            $commitSelectorButton.after($arbitraryDiffButton);
            $commitSelectorButton.hide();
            $arbitraryDiffButton.children('.close-dialog').on('click', exitArbitraryDiff);
        };

        var requestChanges = function requestChanges() {
            var $commitSelector = (0, _jquery2.default)(COMMITSELECTOR_CSS_SELECTOR);
            var $fileTreeHeader = (0, _jquery2.default)('.file-tree-header');

            $commitSelector.hide();
            $fileTreeHeader.hide();

            var $spinner = (0, _jquery2.default)('.file-tree-wrapper');
            $spinner.spin('large', { zIndex: 10, top: 0 });

            var removeLoader = function removeLoader() {
                if ($spinner) {
                    $spinner.spinStop();
                    // we don't need to show the commit selector & file tree header, they'll be properly reset
                    // by their respective destroyables
                }
                $spinner = null;
            };
            _destroyables.push({ destroy: removeLoader });

            _changesRequest = _requestChange2.default.getUnreviewedChangesRequest({
                pullRequest: pullRequest.toJSON(),
                start: 0,
                limit: maxChanges
            }).done(function (data) {
                removeLoader();

                $commitSelector.show();
                $fileTreeHeader.show();

                var unreviewedCommitRange = void 0;
                if (data.properties) {
                    if (data.properties.unreviewedCommits) {
                        unreviewedCommits = data.properties.unreviewedCommits;
                        unreviewedCommitRange = {
                            sinceRevision: { id: data.fromHash },
                            untilRevision: { id: data.toHash }
                        };
                    }
                    includesMerge = data.properties.includesMerge;
                }

                if (_lodash2.default.startsWith(location.pathname, pullRequestUnreviewedUrl(pullRequest))) {
                    updateState({
                        action: _history2.default.replaceState,
                        commitRangeJSON: includesMerge ? null : unreviewedCommitRange,
                        pullRequest: pullRequest
                    });
                } else {
                    initInternal(commit, commitRange);
                }
            });
        };

        var updateState = function updateState(_ref4) {
            var action = _ref4.action,
                commitJSON = _ref4.commitJSON,
                commitRangeJSON = _ref4.commitRangeJSON,
                pullRequest = _ref4.pullRequest;

            action = action || _history2.default.pushState;

            var selectedPathFragment = encodeURI(_treeAndDiffView2.default.getSelectedPath() || '');

            if (commitJSON) {
                action({ commit: commitJSON }, null, commitUrlBuilder(pullRequest, commitJSON).withFragment(selectedPathFragment).build());
            } else if (commitRangeJSON) {
                action({ commitRange: commitRangeJSON }, null, commitRangeDiffUrlBuilder({
                    pullRequest: pullRequest,
                    commit: commitRangeJSON.untilRevision.id,
                    since: commitRangeJSON.sinceRevision.id
                }).withFragment(selectedPathFragment).build());
            } else {
                action({}, null, pullRequestDiffUrlBuilder(pullRequest).withFragment(selectedPathFragment).build());
            }
        };

        var updateSelectedCommentCount = function updateSelectedCommentCount(increment) {
            var defaultCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var selectedCommit = _this.commitSelector.getSelectedCommit();
            if (selectedCommit) {
                // a comment won't have properties if the commentCount is 0
                var props = _lodash2.default.get(selectedCommit, 'properties', {});
                var commentCount = _lodash2.default.get(props, 'commentCount', defaultCount);
                var newProps = {
                    properties: babelHelpers.extends({}, props, {
                        commentCount: commentCount + increment
                    })
                };

                _this.commitSelector.refreshCommit(selectedCommit.id, newProps);
            }
        };

        _destroyables.push(_events2.default.chain().on('bitbucket.internal.feature.commitselector.itemSelected', updateState).on('bitbucket.internal.history.changestate', function (e) {
            if (_lodash2.default.startsWith(location.pathname, pullRequestUnreviewedUrl(pullRequest))) {
                requestChanges();
            } else if (e.state) {
                initInternal(e.state.commit, e.state.commitRange && new _commitRange2.default(e.state.commitRange));
            }
        }).on('bitbucket.internal.keyboard.shortcuts.pullrequest.addCommentHandler', function (keys) {
            (this.execute ? this : _aui2.default.whenIType(keys)).execute(function () {
                (0, _jquery2.default)('.add-file-comment-trigger:first').click();
            });
        }).on('bitbucket.internal.feature.comments.commentAdded', function () {
            return updateSelectedCommentCount(1);
        }).on('bitbucket.internal.feature.comments.commentDeleted', function () {
            return updateSelectedCommentCount(-1, 1);
        }));

        this.commitSelector = new _commitSelector2.default({
            buttonEl: COMMITSELECTOR_CSS_SELECTOR,
            id: 'commit-selector'
        });

        _pullRequestHistory2.default.init();

        _destroyables.push(this.commitSelector);
        _destroyables.push({ destroy: function destroy() {
                return _pullRequestHistory2.default.reset();
            } });
        _destroyables.push({ destroy: function destroy() {
                return _treeAndDiffView2.default.reset();
            } });
        _destroyables.push({
            destroy: _pageScrollingManager2.default.acceptScrollForwardingRequests()
        });

        _history2.default.initialState({
            commit: commit,
            commitRange: commitRange && commitRange.toJSON()
        });
        requestChanges();
    }

    function reset() {
        if (_changesRequest) {
            _changesRequest.abort();
        }
        destroyUnreviewedStatusChangeHandler();
        var done = _jquery2.default.when.apply(_jquery2.default, babelHelpers.toConsumableArray(_lodash2.default.invokeMap(_destroyables, 'destroy')));
        _destroyables = [];
        return done;
    }

    (0, _jquery2.default)(document).on('click', '.file-tree a', function (e) {
        var data = {
            index: this.id.match(/\d+/),
            keyboard: !(e.originalEvent instanceof MouseEvent)
        };
        // Analytics event: stash.client.pullRequest.diff.fileChange
        _events2.default.trigger('bitbucket.internal.feature.pullRequest.diff.fileChange', null, data);
    });

    exports.default = {
        init: init,
        reset: reset
    };
    module.exports = exports['default'];
});