define('bitbucket/internal/page/commit/commit', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/comments/comments', 'bitbucket/internal/feature/commit/tree-and-diff-view/tree-and-diff-view', 'bitbucket/internal/feature/discussion/participants-list/participants-list', 'bitbucket/internal/feature/watch/watch', 'bitbucket/internal/layout/page-scrolling-manager', 'bitbucket/internal/model/commit-range', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/participant', 'bitbucket/internal/model/participant-collection', 'bitbucket/internal/model/revision', 'bitbucket/internal/model/stash-user', 'bitbucket/internal/page/commit/commit-page-message-enricher', 'bitbucket/internal/util/events', 'bitbucket/internal/util/history'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _comments, _treeAndDiffView, _participantsList, _watch, _pageScrollingManager, _commitRange, _pageState, _participant, _participantCollection, _revision, _stashUser, _commitPageMessageEnricher, _events, _history) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _comments2 = babelHelpers.interopRequireDefault(_comments);

    var _treeAndDiffView2 = babelHelpers.interopRequireDefault(_treeAndDiffView);

    var _participantsList2 = babelHelpers.interopRequireDefault(_participantsList);

    var _watch2 = babelHelpers.interopRequireDefault(_watch);

    var _pageScrollingManager2 = babelHelpers.interopRequireDefault(_pageScrollingManager);

    var _commitRange2 = babelHelpers.interopRequireDefault(_commitRange);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _participant2 = babelHelpers.interopRequireDefault(_participant);

    var _participantCollection2 = babelHelpers.interopRequireDefault(_participantCollection);

    var _revision2 = babelHelpers.interopRequireDefault(_revision);

    var _stashUser2 = babelHelpers.interopRequireDefault(_stashUser);

    var _commitPageMessageEnricher2 = babelHelpers.interopRequireDefault(_commitPageMessageEnricher);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    var ROOT = 'ROOT';

    // state data
    var atRevision;
    var parentRevisions;
    var parentRevisionsById;
    var currentParentRevision;

    //DOM elements
    var $diffToTrigger;
    var $diffToParentOptions;

    function updateParentSelector(selectedParentRevision) {
        $diffToParentOptions.each(function () {
            var $this = (0, _jquery2.default)(this);
            var $thisLink = $this.find('a');
            var isSelected = $thisLink.attr('data-id') === selectedParentRevision.getId();

            $this.toggleClass('selected', isSelected);

            if (isSelected) {
                $diffToTrigger.text($this.find('.commitid').text());
            }
        });
    }

    function initForParentId(parentId) {
        currentParentRevision = Object.prototype.hasOwnProperty.call(parentRevisionsById, parentId) ? parentRevisionsById[parentId] : parentRevisions[0];

        updateParentSelector(currentParentRevision);
    }

    function pushState(newParentId) {
        var newUrl = _navbuilder2.default.currentRepo().commit(atRevision.getId()).withParams({ to: newParentId }).build();

        _history2.default.pushState(null, null, newUrl);
    }

    function getParentIdFromUrl(parents) {
        return _navbuilder2.default.parse(window.location.href).getQueryParamValue('to') || parents.length && parents[0].getId() || ROOT;
    }

    function onStateChange() {
        var parentId = getParentIdFromUrl(parentRevisions);

        var parentIdChanged = parentId && parentId !== currentParentRevision.getId();

        if (parentIdChanged) {
            _events2.default.stop();
            // don't propagate the event down to treeAndDiffView, otherwise it will first (incorrectly) make a request for the diff of the current file at the new parent,
            // which is discarded as it is immediately followed by the correct request (diff for first file in the tree at the new revision)
            initForParentId(parentId);
            _treeAndDiffView2.default.updateCommitRange(new _commitRange2.default({
                untilRevision: atRevision,
                sinceRevision: currentParentRevision
            }));
        }
    }

    function listenForKeyboardShortcutRequests() {
        _events2.default.on('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', function (keyboardShortcuts) {
            keyboardShortcuts.enableContext('commit');
            keyboardShortcuts.enableContext('diff-tree');
            keyboardShortcuts.enableContext('diff-view');
        });

        _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestReturnToCommits', function (keys) {
            (this.execute ? this : (0, _aui.whenIType)(keys)).execute(function () {
                window.location.href = (0, _jquery2.default)('#repository-nav-commits').attr('href'); //Make sure we include the sticky branch if there is one
            });
        });
    }

    function initWatching() {
        var commit = _pageState2.default.getCommit();
        var commitWatchRestUrl = _navbuilder2.default.rest().currentRepo().commit(commit.getId()).watch().build();
        var $watch = (0, _jquery2.default)('.watch a');
        var watch = new _watch2.default($watch, commitWatchRestUrl);

        _pageState2.default.getCommitParticipants().on('add', function (participant) {
            var currentUser = _pageState2.default.getCurrentUser();
            if (currentUser && currentUser.getName() === participant.getUser().getName()) {
                watch.setIsWatching(true);
            }
        });
    }

    function initParticipantsList(participants) {
        _events2.default.on('bitbucket.internal.feature.comments.commentAdded', function (comment) {
            var commentUser = new _stashUser2.default(comment.author);
            if (commentUser.getEmailAddress() !== _pageState2.default.getCommit().getAuthor().emailAddress && !participants.findByUser(commentUser)) {
                participants.add(new _participant2.default({
                    user: commentUser
                }));
            }
        });

        new _participantsList2.default(participants, (0, _jquery2.default)('.participants-dropdown ul'), (0, _jquery2.default)('.participants.plugin-item'));
    }

    function enrichCommitMessage($message, commitJson) {
        _commitPageMessageEnricher2.default.process($message.text(), commitJson, _aui.escapeHtml).then(function (replacements) {
            $message.html(replacements);
        });
    }

    function onReady(jsonRevision, jsonParentRevisions, maxChanges, relevantContextLines, extrasSelector, repository, commit, participantsJSON, unwatched, hasRepoWrite) {
        var participants = new _participantCollection2.default(_lodash2.default.reject(participantsJSON, function (participant) {
            // Filter out the commit author as a participant by email
            return participant.user.emailAddress === commit.author.emailAddress;
        }));
        _pageState2.default.extend('isWatching');
        _pageState2.default.extend('commitParticipants');
        _pageState2.default.setCommitParticipants(participants);

        var isWatchingPromise = _jquery2.default.Deferred();
        _PageDataPlugin.ready('com.atlassian.bitbucket.server.bitbucket-web:iswatching-provider', 'bitbucket.page.commit', function (data) {
            _pageState2.default.setIsWatching(data.isWatching);
            isWatchingPromise.resolve(data.isWatching);
        });

        atRevision = new _revision2.default(jsonRevision);
        _pageState2.default.setRevisionRef(atRevision.getRevisionReference());
        _pageState2.default.setCommit(atRevision);
        parentRevisions = _lodash2.default.map(jsonParentRevisions, function (revisionJson) {
            return new _revision2.default(revisionJson);
        });

        parentRevisionsById = {};

        if (parentRevisions.length) {
            var i;
            var l = parentRevisions.length;
            var parent;
            for (i = 0; i < l; i++) {
                parent = parentRevisions[i];
                parentRevisionsById[parent.getId()] = parent;
            }
        } else {
            parentRevisionsById[ROOT] = new _revision2.default({ id: ROOT });
        }

        // string-replacer plugins must register themselves before document.ready
        // without this there is a chance the string is processed before all plugins are registered
        (0, _jquery2.default)(document).ready(function () {
            return enrichCommitMessage((0, _jquery2.default)('.commit-metadata-details .commit-message pre'), jsonRevision);
        });

        // The web-item plugin point in the diff tree header has been deprecated, so the existing web items need to be
        // added on the client side. The deprecated items are added to the treeAndDiffView template and this code
        // renders the tree and diff view on the client.
        (0, _jquery2.default)('.aui-page-panel-content').append(bitbucket.internal.feature.treeAndDiffView({}));

        // There may be more than one commitid element (commit parent(s), dropdown for toggling the parent to diff to)
        // so we need quite a specific selector to add the tooltip to.
        var commitIdLink = (0, _jquery2.default)('.commit-metadata-details .commit-badge-oneline .commitid');

        commitIdLink.tooltip({
            title: 'data-commitid',
            className: 'commitid-tooltip'
        });

        var $diffToToolbar = (0, _jquery2.default)('.commit-metadata-diff-to');

        $diffToParentOptions = $diffToToolbar.find('.aui-dropdown2 .commit-list-item');

        $diffToTrigger = $diffToToolbar.find('.aui-dropdown2-trigger');

        $diffToParentOptions.click(function (e) {
            e.preventDefault();

            var $newParent = (0, _jquery2.default)(this);
            var newParentId = $newParent.find('a').attr('data-id');
            $diffToParentOptions.removeClass('selected');

            $newParent.addClass('selected');
            if (newParentId !== currentParentRevision.getId()) {
                pushState(newParentId);
                (0, _jquery2.default)(this).closest('.aui-dropdown2')[0].hide();
            }
        });

        // history fires a changestate event when the hash changes for browsers that support pushState...
        _events2.default.on('bitbucket.internal.history.changestate', onStateChange);

        _pageScrollingManager2.default.acceptScrollForwardingRequests();

        initForParentId(getParentIdFromUrl(parentRevisions));

        _treeAndDiffView2.default.init(new _commitRange2.default({
            untilRevision: atRevision,
            sinceRevision: currentParentRevision
        }), {
            maxChanges: maxChanges,
            relevantContextLines: relevantContextLines,
            numberOfParents: parentRevisions.length,
            toolbarWebFragmentLocationPrimary: 'bitbucket.commit.diff.toolbar.primary',
            toolbarWebFragmentLocationSecondary: 'bitbucket.commit.diff.toolbar.secondary',
            commentMode: _pageState2.default.getCurrentUser() ? _comments2.default.commentMode.CREATE_NEW : _comments2.default.commentMode.NONE,
            diffUrlBuilder: function diffUrlBuilder(fileChange) {
                return _navbuilder2.default.rest().currentRepo().commit(fileChange.commitRange).diff(fileChange);
            }
        });

        listenForKeyboardShortcutRequests();

        (0, _jquery2.default)(extrasSelector + ' .plugin-section-primary').append(bitbucket.internal.page.commitRelatedEntityWebPanels({
            repository: repository,
            commit: commit,
            hasRepoWrite: hasRepoWrite
        }));

        if (_pageState2.default.getCurrentUser()) {
            initParticipantsList(participants);
            isWatchingPromise.done(initWatching); // has to be done after the primary plugin section has been rendered
        }

        if (unwatched) {
            (0, _aui.flag)({
                type: 'success',
                title: _aui.I18n.getText('bitbucket.web.commit.unwatched.header', _pageState2.default.getCommit().getDisplayId()),
                close: 'auto',
                body: _aui.I18n.getText('bitbucket.web.commit.unwatched.content')
            });
        }
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});