define('bitbucket/internal/page/source/source', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/commit/commit-badge/commit-badge', 'bitbucket/internal/feature/file-content/file-content', 'bitbucket/internal/layout/page-scrolling-manager', 'bitbucket/internal/model/commit-range', 'bitbucket/internal/model/file-change', 'bitbucket/internal/model/file-change-types', 'bitbucket/internal/model/file-content-modes', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/path', 'bitbucket/internal/model/revision', 'bitbucket/internal/model/revision-reference', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/util/history'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _commitBadge, _fileContent, _pageScrollingManager, _commitRange, _fileChange, _fileChangeTypes, _fileContentModes, _pageState, _path, _revision, _revisionReference, _ajax, _events, _function, _history) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _commitBadge2 = babelHelpers.interopRequireDefault(_commitBadge);

    var _fileContent2 = babelHelpers.interopRequireDefault(_fileContent);

    var _pageScrollingManager2 = babelHelpers.interopRequireDefault(_pageScrollingManager);

    var _commitRange2 = babelHelpers.interopRequireDefault(_commitRange);

    var _fileChange2 = babelHelpers.interopRequireDefault(_fileChange);

    var _fileChangeTypes2 = babelHelpers.interopRequireDefault(_fileChangeTypes);

    var _fileContentModes2 = babelHelpers.interopRequireDefault(_fileContentModes);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _path2 = babelHelpers.interopRequireDefault(_path);

    var _revision2 = babelHelpers.interopRequireDefault(_revision);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    var followRenames;
    var relevantContextLines;
    var dialogIsShowing;
    var currentUrl;
    var state;
    var fileContent;
    var pendingRequest = null;

    function hydrateState(state) {
        return {
            mode: state.mode ? state.mode : _fileContentModes2.default.SOURCE,
            path: new _path2.default(state.path),
            headRef: new _revisionReference2.default(state.headRef),
            untilRevision: state.untilRevision ? new _revision2.default(state.untilRevision) : null,
            untilPath: state.untilPath ? new _path2.default(state.untilPath) : null,
            sincePath: state.sincePath ? new _path2.default(state.sincePath) : null,
            autoSincePath: state.autoSincePath || false,
            explicitUntil: state.explicitUntil,
            useDefaultHandler: state.useDefaultHandler || false
        };
    }

    function dehydrateState(state) {
        return {
            mode: state.mode,
            path: state.path.toString(),
            headRef: state.headRef.toJSON(),
            untilRevision: state.untilRevision ? state.untilRevision.toJSON() : null,
            untilPath: state.untilPath ? state.untilPath.toJSON() : null,
            sincePath: state.sincePath ? state.sincePath.toJSON() : null,
            autoSincePath: state.autoSincePath,
            explicitUntil: state.explicitUntil,
            useDefaultHandler: state.useDefaultHandler
        };
    }

    function handleBrowserHashChangeEdgeCase() {
        // this should just be a hash change, so it should be ignorable.
        // however, browsers don't always persist state data
        // see: https://github.com/balupton/history.js/wiki/The-State-of-the-HTML5-History-API
        // "State persisted when navigated away and back"
        // in that case, we have to either regrab all the state (path from url, headRef and untilRevision from ??)
        // or reload the page. Reloading the page because it's the easier option.

        var isHashChangeOnly = _lodash2.default.endsWith(urlWithoutHash(window.location.href), urlWithoutHash(currentUrl));

        if (!isHashChangeOnly) {
            window.location.reload();
        }
    }

    function getCurrentCommitRange() {
        // If they didn't explicitly choose to see the until revision (and instead the until revision just
        // contains the latest change to this file), then show them the source at HEAD, instead of at the latest
        // change. The latest change might be before a merge commit, and therefore not necessarily have the same
        // content as what is at HEAD.
        var untilRevision = state.mode === _fileContentModes2.default.DIFF || state.explicitUntil ? state.untilRevision : new _revision2.default({
            id: state.headRef.getId(),
            displayId: state.headRef.getDisplayId(),
            author: { name: 'Unknown' },
            authorTimestamp: NaN,
            parents: [],
            properties: {
                change: {
                    srcPath: null
                }
            }
        });
        return new _commitRange2.default({
            untilRevision: untilRevision,
            sinceRevision: untilRevision.hasParents() ? untilRevision.getParents()[0] : undefined
        });
    }

    function urlWithoutHash(url) {
        var hashIndex = url.lastIndexOf('#');
        return hashIndex === -1 ? url : url.substring(0, hashIndex);
    }

    function updateForState() {
        // if we're still updating from a previous request, abort that update.
        if (pendingRequest) {
            pendingRequest.abort();
            pendingRequest = null;
        }

        if (!state.untilRevision || state.autoSincePath && state.mode === _fileContentModes2.default.DIFF) {
            // either we changed the branch selector, and so we don't actually know the until commit
            // OR we know the until commit, but we've deferred loading of the srcPath, and need to load it now

            fileContent.reset(); // Destroy the last view

            if (!state.untilRevision) {
                pendingRequest = getLatestFileRevision(state.path, state.headRef);
                pendingRequest.done(function (revision) {
                    state.untilRevision = revision;
                });
            } else {
                pendingRequest = getLatestFileRevision(state.untilPath, state.untilRevision.getRevisionReference());
            }

            pendingRequest.always(function () {
                pendingRequest = null;
            }).done(function (revision) {
                state.autoSincePath = false;
                var srcPath = revision && revision.getProperties() && revision.getProperties().change.srcPath;
                state.sincePath = srcPath ? new _path2.default(srcPath) : null;
                updateForState();
            });
        } else {
            initFileContent();
            updateCommitBadge(state.untilRevision);
        }
    }

    function initFileContent() {
        var headPathString = state.path.toString();
        var untilPath = state.untilPath || state.path;
        var untilPathString = untilPath.toString();
        var sincePathString = state.sincePath && state.sincePath.toString();
        var viewingARename = Boolean(state.mode === _fileContentModes2.default.DIFF && sincePathString && untilPathString !== sincePathString);

        var defaults = {
            toolbarWebFragmentLocationPrimary: 'bitbucket.file-content.' + state.mode + '.toolbar.primary',
            toolbarWebFragmentLocationSecondary: 'bitbucket.file-content.' + state.mode + '.toolbar.secondary',
            followRenames: followRenames,
            autoSrcPath: state.autoSincePath
        };
        var overrides = {
            anchor: window.location.hash.substr(1) || undefined,
            headPath: state.path,
            headRef: state.headRef,
            relevantContextLines: relevantContextLines,
            breadcrumbs: headPathString !== untilPathString || undefined,
            changeTypeLozenge: viewingARename || undefined,
            useDefaultHandler: state.useDefaultHandler
        };

        var options = _jquery2.default.extend(defaults, _fileContent2.default[state.mode + 'Preset'], overrides);

        var fileChangeType;
        if (viewingARename) {
            fileChangeType = untilPath.isSameDirectory(state.sincePath) ? _fileChangeTypes2.default.RENAME : _fileChangeTypes2.default.MOVE;
        }

        var fileChange = new _fileChange2.default({
            commitRange: getCurrentCommitRange(),
            path: untilPath,
            repository: _pageState2.default.getRepository(),
            srcPath: state.sincePath,
            type: fileChangeType
        });

        return fileContent.init(fileChange, options);
    }

    function updateCommitBadge(untilRevision) {
        (0, _jquery2.default)('.branch-selector-toolbar .commit-badge-container').empty().append(_commitBadge2.default.create(untilRevision.toJSON(), {
            filePath: _pageState2.default.getFilePath().toString(),
            repository: _pageState2.default.getRepository().toJSON()
        })).fadeIn('fast');
    }

    function pushState(newState) {
        var urlBuilder = _navbuilder2.default.currentRepo();
        if (newState.mode === _fileContentModes2.default.DIFF) {
            var fileChange = new _fileChange2.default({
                commitRange: new _commitRange2.default({
                    untilRevision: newState.untilRevision // Since is the revision's parent but not needed in the URL
                }),
                path: newState.untilPath || newState.path,
                srcPath: newState.sincePath,
                repository: _pageState2.default.getRepository()
            });
            urlBuilder = urlBuilder.diff(fileChange, newState.headRef, newState.path, followRenames ? undefined : false);
        } else {
            urlBuilder = urlBuilder.browse().path(newState.path);
            if (newState.untilRevision && newState.explicitUntil) {
                urlBuilder = urlBuilder.until(newState.untilRevision.getId(), newState.untilPath);
            }

            if (!newState.headRef.isDefault()) {
                urlBuilder = urlBuilder.at(newState.headRef.getId());
            }

            if (newState.useDefaultHandler) {
                urlBuilder = urlBuilder.withParams({ useDefaultHandler: true });
            }
        }
        _history2.default.pushState(dehydrateState(newState), null, urlBuilder.build());
    }

    function getLatestFileRevision(path, revisionReference) {
        function fallback() {
            //HACK: this is used when the revision doesn't exist on the branch you select.
            // We should handle it differently, but probably never will.

            return {
                id: revisionReference.getLatestCommit(),
                displayId: revisionReference.getDisplayId(),
                author: { name: 'Unknown' },
                authorTimestamp: NaN,
                parents: [],
                properties: {
                    change: {
                        srcPath: null
                    }
                }
            };
        }

        var fileHistoryUrlBuilder = _navbuilder2.default.rest().currentRepo().commits().withParams({
            avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                size: 'xsmall'
            }),
            followRenames: followRenames,
            limit: 1,
            path: path.toString(),
            until: revisionReference.getLatestCommit()
        });

        var xhr = _ajax2.default.rest({
            url: fileHistoryUrlBuilder.build()
        });

        var pipedPromise = xhr.then(function (commits) {
            if (commits.values[0]) {
                return new _revision2.default(commits.values[0]);
            }
            // BSERV-8673 If there is no data the file must have been created in a merge
            // so do the REST call again with followRenames: false so merge commits are included
            return _ajax2.default.rest({
                url: fileHistoryUrlBuilder.withParams({
                    followRenames: false
                }).build()
            }).then(function (commits) {
                return new _revision2.default(commits.values[0] || fallback());
            });
        });

        _events2.default.trigger('bitbucket.internal.page.source.requestedRevisionData');
        return pipedPromise.promise(xhr);
    }

    function onReady(path, atRevisionRef, untilRevision, untilPath, mode, fileContentContainerSelector, fileContentId, _relevantContextLines, _followRenames, autoSincePath, sincePath) {
        _pageScrollingManager2.default.acceptScrollForwardingRequests();

        followRenames = _followRenames;
        relevantContextLines = _relevantContextLines;
        currentUrl = window.location.href;
        state = hydrateState({
            mode: _fileContentModes2.default.DIFF === mode ? _fileContentModes2.default.DIFF : _fileContentModes2.default.SOURCE,
            path: path,
            headRef: atRevisionRef,
            untilRevision: untilRevision,
            untilPath: untilPath,
            sincePath: sincePath,
            autoSincePath: autoSincePath,
            explicitUntil: !!_navbuilder2.default.parse(window.location).getQueryParamValue('until'),
            useDefaultHandler: _navbuilder2.default.parse(window.location).getQueryParamValue('useDefaultHandler') === 'true'
        });

        fileContent = new _fileContent2.default(fileContentContainerSelector, fileContentId, _fileContent2.default.sourcePreset);

        _events2.default.on('bitbucket.internal.history.changestate', function (e) {
            if (!e.state) {
                return handleBrowserHashChangeEdgeCase();
            }

            var newState = hydrateState(e.state);

            var currentUntilId = state.untilRevision ? state.untilRevision.getId() : null;
            var newUntilId = newState.untilRevision ? newState.untilRevision.getId() : null;

            var headRefChanged = state.headRef.getId() !== newState.headRef.getId();
            var stateChanged = newState.path.toString() !== state.path.toString() || headRefChanged || newUntilId !== currentUntilId || newState.mode !== state.mode || newState.autoSincePath !== state.autoSincePath || newState.explicitUntil !== state.explicitUntil || newState.useDefaultHandler !== state.useDefaultHandler;

            state = newState;

            if (headRefChanged) {
                _events2.default.trigger('bitbucket.internal.page.source.revisionRefChanged', null, state.headRef);
            }

            // it's possible this we're just popping a hashchange. Check that state actually changed.
            if (stateChanged) {
                updateForState();
            }
            currentUrl = window.location.href;
        });

        // Trigger a state change to refresh the file currently shown in the diff view.
        // Use case: diff options have changed and a new representation of the file needs to be shown.
        _events2.default.on('bitbucket.internal.feature.fileContent.optionsChanged', function (change) {
            var nonRefreshKeys = ['hideComments', 'hideEdiff', 'showWhitespaceCharacters'];

            if (!_lodash2.default.includes(nonRefreshKeys, change.key)) {
                updateForState();
            }
        });

        _events2.default.on('bitbucket.internal.layout.branch.revisionRefChanged', function (revisionReference) {
            if (state.headRef !== revisionReference) {
                // the new commit reference isn't necessarily the commit on which the file was changed.
                // we must find the latest one where it was changed. hence why untilRevision is null
                // untilPath is set to null to avoid pointing to a different file due to follow renames
                // Always revert back to source view - doesn't make sense to keep on diff view when switching branches.
                pushState(babelHelpers.extends({}, state, {
                    headRef: revisionReference,
                    untilPath: null,
                    untilRevision: null,
                    mode: _fileContentModes2.default.SOURCE,
                    explicitUntil: false
                }));
            }
        });

        _events2.default.on('bitbucket.internal.feature.*.untilRevisionChanged', function (revision, path, sincePath) {
            if (!state.explicitUntil || state.untilRevision.getId() !== revision.getId()) {
                pushState(babelHelpers.extends({}, state, {
                    untilRevision: revision,
                    untilPath: path,
                    sincePath: sincePath,
                    autoSincePath: false,
                    explicitUntil: true
                }));
            }
        });

        _events2.default.on('bitbucket.internal.feature.*.requestedModeChange', function (mode) {
            if (state.mode !== mode) {
                pushState(babelHelpers.extends({}, state, {
                    mode: mode
                }));
            }
        });

        _events2.default.on('bitbucket.internal.feature.fileContent.useDefaultHandler', function () {
            pushState(babelHelpers.extends({}, state, {
                useDefaultHandler: true
            }));
        });

        _events2.default.on('bitbucket.internal.feature.fileContent.useExtendedHandler', function () {
            pushState(babelHelpers.extends({}, state, {
                useDefaultHandler: false
            }));
        });

        _events2.default.on('bitbucket.internal.feature.sourceview.onError', function (errors) {
            (0, _jquery2.default)('.branch-selector-toolbar .commit-badge-container').fadeOut('fast');
        });

        _events2.default.on('bitbucket.internal.layout.*.urlChanged', function (url) {
            window.location = url;
            //TODO: pushState back to fileBrowser
            //events.trigger('bitbucket.internal.page.source.urlChanged', null, url);
        });
        _events2.default.on('bitbucket.internal.feature.*.urlChanged', function (url) {
            window.location = url;
            //TODO: pushState back to fileBrowser
            //events.trigger('bitbucket.internal.page.source.urlChanged', null, url);
        });

        _events2.default.on('bitbucket.internal.widget.branchselector.dialogShown', function () {
            dialogIsShowing = true;
        });
        _events2.default.on('bitbucket.internal.widget.branchselector.dialogHidden', function () {
            dialogIsShowing = false;
        });

        (0, _jquery2.default)(window).on('hashchange', function () {
            currentUrl = window.location.href;

            _history2.default.replaceState(dehydrateState(state), null, currentUrl);

            var anchor = window.location.hash.substr(1) || undefined;

            //Quack quack
            _function2.default.dotX('handler.updateAnchor', anchor)(fileContent);

            _events2.default.trigger('bitbucket.internal.page.source.anchorChanged', null, anchor);
        });

        _events2.default.on('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', function (keyboardShortcuts) {
            keyboardShortcuts.enableContext('sourceview');
            keyboardShortcuts.enableContext('diff-view');
        });

        _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestOpenParentHandler', function (keys) {
            (this.execute ? this : _aui2.default.whenIType(keys)).execute(function () {
                if (!dialogIsShowing) {
                    var $parentDir = (0, _jquery2.default)('.breadcrumbs').find('a:last');
                    if ($parentDir.length) {
                        $parentDir.click();
                    }
                }
            });
        });

        _history2.default.initialState(dehydrateState(state));

        updateForState();
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});