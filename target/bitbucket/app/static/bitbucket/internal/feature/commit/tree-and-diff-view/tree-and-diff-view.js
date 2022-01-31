define('bitbucket/internal/feature/commit/tree-and-diff-view/tree-and-diff-view', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/state', 'bitbucket/internal/feature/commit/difftree/difftree', 'bitbucket/internal/feature/file-content/diff-view-options', 'bitbucket/internal/feature/file-content/diff-view-type', 'bitbucket/internal/feature/file-content/file-content', 'bitbucket/internal/model/conflict', 'bitbucket/internal/model/file-change', 'bitbucket/internal/model/file-content-modes', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/path-and-line', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/events', 'bitbucket/internal/util/feature-detect', 'bitbucket/internal/util/shortcuts'], function (module, exports, _aui, _jquery, _lodash, _state, _difftree, _diffViewOptions, _diffViewType, _fileContent, _conflict, _fileChange, _fileContentModes, _pageState, _pathAndLine, _domEvent, _events, _featureDetect, _shortcuts) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _difftree2 = babelHelpers.interopRequireDefault(_difftree);

    var _diffViewOptions2 = babelHelpers.interopRequireDefault(_diffViewOptions);

    var _diffViewType2 = babelHelpers.interopRequireDefault(_diffViewType);

    var _fileContent2 = babelHelpers.interopRequireDefault(_fileContent);

    var _conflict2 = babelHelpers.interopRequireDefault(_conflict);

    var _fileChange2 = babelHelpers.interopRequireDefault(_fileChange);

    var _fileContentModes2 = babelHelpers.interopRequireDefault(_fileContentModes);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _pathAndLine2 = babelHelpers.interopRequireDefault(_pathAndLine);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _featureDetect2 = babelHelpers.interopRequireDefault(_featureDetect);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    var DiffTree = _difftree2.default.DiffTree;
    var ROOT = 'ROOT';

    var _options;

    //state
    var currentCommitRange;
    var currentFileChange;
    var currentFilePath;
    var currentSearch;
    var changingState = false;
    var _destroyables = [];

    // components/features/widgets
    var currentDiffTree;
    var diffTreesByCommitRangeId = {}; //cache for diff-tree's created for different CommitRanges
    var fileContent;

    // Selectors for resizing commitPanes height and scrollbar & spinner
    var $window = (0, _jquery2.default)(window);
    var $footer;
    var $content;
    var $container;
    var $spinner;
    var windowHeight;
    var diffTreeMaxHeight;
    var $commitFileContent;
    var $fileTreeContainer;
    var $fileTreeWrapper;
    var $fileTree;
    var $contentView;
    var $diffViewToolbar; // boolean for determining if the file tree is stalking or not

    function getFileChangeFromNode($node) {
        var path = getPathFromNode($node);
        var srcPath = getSrcPathFromNode($node);
        var changeType = getChangeTypeFromNode($node);
        var nodeType = getNodeTypeFromNode($node);
        var conflict = getConflictFromNode($node);
        var executable = getExecutableFromNode($node);
        var srcExecutable = getSrcExecutableFromNode($node);

        return new _fileChange2.default({
            repository: _pageState2.default.getRepository(),
            commitRange: currentCommitRange,
            srcPath: srcPath && srcPath.path,
            path: path.path,
            type: changeType,
            nodeType: nodeType,
            line: path.line,
            search: currentSearch,
            conflict: conflict,
            srcExecutable: srcExecutable,
            executable: executable
        });
    }

    /**
     * Init the part of the UI that will display the diff
     * @param fileChange - describes the diff we're showing
     * @param anchor - a line to autofocus in the file
     * @param diffViewOptions - if we are simply reinitializing the same file with new options, the options are passed here
     *        to maintain the lifetime of those options (e.g. any overrides shouldn't be removed because some unrelated option change caused a reinit)
     */
    function initFileContentFromChange(fileChange, anchor, diffViewOptions) {
        if (!fileContent) {
            fileContent = new _fileContent2.default($container, 'commit-file-content');
        }

        if (!anchor) {
            anchor = fileChange.getLine();
        }
        // if there were previous options created AND we're not about to reuse those options now, destroy them to avoid a mem leak
        destroyDiffOptionsIfNot(fileContent, diffViewOptions);
        if (!diffViewOptions) {
            diffViewOptions = _diffViewOptions2.default.proxy();
            diffViewOptions.on('change', onDiffViewOptionsChanged);
        }

        currentFileChange = fileChange;
        currentFilePath = new _pathAndLine2.default(fileChange.getPath(), fileChange.getLine());
        _pageState2.default.setFilePath(fileChange.getPath());

        $container.height($container.height());
        //temporarily set the height explicitly to the current height to stop the jump when the diffview is removed.
        //cleaned up in onTreeAndDiffViewSizeChanged
        var scrollTop = $window.scrollTop();

        return fileContent.init(fileChange, Object.assign(_options, { anchor: anchor, diffViewOptions: diffViewOptions })).done(function () {
            $commitFileContent = (0, _jquery2.default)('#commit-file-content');
            // Don't continue if we don't have a file-content area to work with
            if ($commitFileContent.length === 0) {
                return;
            }
            $diffViewToolbar = $commitFileContent.find('.file-toolbar');
            $contentView = $commitFileContent.find('.content-view');

            scrollTop = scrollContentToTop(scrollTop);
            $window.scrollTop(scrollTop);
        });
    }

    function destroyDiffOptionsIfNot(fileContent, currentDiffViewOptions) {
        var options = _lodash2.default.get(fileContent, '_options.diffViewOptions');
        if (options && currentDiffViewOptions !== options) {
            options.destroy();
        }
    }

    function destroyFileContent() {
        var deferred = _jquery2.default.Deferred();
        currentFilePath = null;
        currentFileChange = null;

        if (fileContent) {
            destroyDiffOptionsIfNot(fileContent, null);
            fileContent.destroy();
            fileContent = null;
        }

        // we empty instead of removing because FileContent will replace this element, and by not removing it we
        // preserve the width of the tree view container.
        (0, _jquery2.default)('#commit-file-content').empty();

        return deferred.resolve();
    }

    function getPathFromNode($node) {
        return new _pathAndLine2.default($node.data('path'));
    }

    function getChangeTypeFromNode($node) {
        return $node.data('changeType');
    }

    function getNodeTypeFromNode($node) {
        return $node.data('nodeType');
    }

    function getSrcPathFromNode($node) {
        return $node.data('srcPath') && new _pathAndLine2.default($node.data('srcPath'));
    }

    function getConflictFromNode($node) {
        return $node.data('conflict') && new _conflict2.default($node.data('conflict'));
    }

    function getSrcExecutableFromNode($node) {
        return $node.data('srcExecutable');
    }

    function getExecutableFromNode($node) {
        return $node.data('executable');
    }

    function getDiffTreeMaxHeight() {
        windowHeight = $window.height();
        var diffTreeMaxHeight = windowHeight;
        (0, _jquery2.default)('.file-tree-container').children(':not(.file-tree-wrapper):visible').each(function () {
            diffTreeMaxHeight = diffTreeMaxHeight - (0, _jquery2.default)(this).outerHeight(true);
        });
        return diffTreeMaxHeight;
    }

    function onTreeAndDiffViewSizeChanged() {
        diffTreeMaxHeight = getDiffTreeMaxHeight();

        // update diff-tree height
        $fileTreeWrapper.css({
            'max-height': diffTreeMaxHeight + 'px',
            'border-bottom-width': 0
        });
    }

    function scrollContentToTop(scrollTop) {
        var diffOffset = $commitFileContent.offset();
        if (diffOffset) {
            // Only try to get the offset if we can get it from the element.
            return Math.min(scrollTop, diffOffset.top);
        }
        return scrollTop;
    }

    // Trigger a state change to refresh the file currently shown in the diff view.
    // Use case: diff options have changed and a new representation of the file needs to be shown.
    function onDiffViewOptionsChanged(change) {
        var nonRefreshKeys = ['hideComments', 'hideEdiff', 'showWhitespaceCharacters'];

        if (!_lodash2.default.includes(nonRefreshKeys, change.key)) {
            initSelectedFileContent(this);
        }
    }

    // Keep track of the last search to highlight subsequently selected files in the tree
    _events2.default.on('bitbucket.internal.feature.diffView.highlightSearch', function (search) {
        currentSearch = search;
    });

    /**
     * Change the state of the view based on whether the selected file is changed and if we have a current diff-tree
     */
    function onStateChange() {
        changingState = true;

        var selectedPath = getPathFromUrl();

        var selectedFileChanged = Boolean(selectedPath) ^ Boolean(currentFilePath) || selectedPath && selectedPath.path.toString() !== currentFilePath.path.toString();

        if (selectedFileChanged && currentDiffTree) {
            currentDiffTree.selectFile(selectedPath.path.getComponents());
            initSelectedFileContent();

            // scroll the diff to the correct line, this will happen after the first change has been highlighted :(
            // TODO stop the first change being highlighted.
            if (selectedPath.line) {
                _events2.default.once('bitbucket.internal.feature.fileContent.diffViewContentChanged', function () {
                    _events2.default.trigger('bitbucket.internal.feature.diffView.lineChange', null, selectedPath.line);
                });
            }
        } else if (selectedPath.toString() !== currentFilePath.toString()) {
            // TODO Using events like this to trigger a line change is not ideal, we need a better way to pass 'messages'
            //      via the fileContent into the current view.
            // Only if the line number has changed directly
            _events2.default.trigger('bitbucket.internal.feature.diffView.lineChange', null, selectedPath.line);
            // Otherwise the first selected line will not 'select' again
            currentFilePath = selectedPath;
        }
        changingState = false;
    }

    /**
     * Reload the diff viewer
     *
     * Used when the file changes or the diff view is changed (unified v side-by-side)
     */
    function initSelectedFileContent(diffViewOptions) {
        var $node = currentDiffTree.getSelectedFile();

        if ($node && $node.length > 0) {
            initFileContentFromChange(getFileChangeFromNode($node), undefined, diffViewOptions);
        } else if (currentFileChange) {
            // Fallback to the current file change, even if there is no tree node selected
            // This is to handle the case where there are no search results but the previous file is still selected
            initFileContentFromChange(currentFileChange, undefined, diffViewOptions);
        }
    }

    function updateDiffTree(optSelectedPathComponents) {
        if (!$spinner) {
            $spinner = (0, _jquery2.default)('<div class="spinner"/>');
        }
        $spinner.appendTo('#content .file-tree-wrapper').spin('large', { zIndex: 10 });

        $fileTreeWrapper.siblings('.file-tree-header').replaceWith(bitbucket.internal.feature.fileTreeHeader({
            commit: _options.linkToCommit ? currentCommitRange.getUntilRevision().toJSON() : null,
            repository: _state2.default.getRepository()
        }));

        return currentDiffTree.init(optSelectedPathComponents).always(function () {
            if ($spinner) {
                $spinner.spinStop().remove();
                $spinner = null;
            }
        }).done(function () {
            $fileTree = (0, _jquery2.default)('.file-tree');
            diffTreeMaxHeight = getDiffTreeMaxHeight();

            $fileTreeWrapper.css('max-height', diffTreeMaxHeight);
        });
    }

    function getPathFromUrl() {
        return new _pathAndLine2.default(decodeURI(window.location.hash.substring(1)));
    }

    var toggleDiffTree;
    function initDiffTreeToggle() {
        var $toggle = (0, _jquery2.default)('.collapse-file-tree');
        var $commitFilesContainer = (0, _jquery2.default)('.commit-files');
        var $diffTreeContainer = (0, _jquery2.default)('.file-tree-container');
        var collapsed;

        function triggerCollapse() {
            _events2.default.trigger('bitbucket.internal.feature.commit.difftree.collapseAnimationFinished', null, collapsed);
        }

        // debounce expanding the diff tree container on hover
        var quickRevealTimer;

        // this will be used to determine if the file browser is triggered manually or programatically
        var isQuickRevealing = false;

        // delay of revealing after hover on the browser (in ms)
        var QUICK_REVEAL_SHOW_DELAY = 200;

        // cancellable debounce, which will be canceled when user's got mouse leave the container
        // *NOTE* When lodash is upgraded to 3.0, we shall revisit here and change to the _.debounce as
        // it will be cancellable in v3.0
        var quickReveal = function quickReveal() {
            clearTimeout(quickRevealTimer);

            // do nothing if it's already expanded
            if (!$commitFilesContainer.hasClass('collapsed')) {
                return;
            }

            quickRevealTimer = setTimeout(function () {
                isQuickRevealing = true;
                _internalToggleDiffTree(false);
            }, QUICK_REVEAL_SHOW_DELAY);
        };

        var exitQuickReveal = function exitQuickReveal() {
            clearTimeout(quickRevealTimer);

            if (isQuickRevealing) {
                isQuickRevealing = false;
                toggleDiffTree(true);
            }
        };

        /**
         *
         * @param forceCollapsed false if you want to force collapse the file browser
         *                      true if you want to force open it
         *                      undefined if you want to toggle it according to the current status
         */
        var _internalToggleDiffTree = function _internalToggleDiffTree(forceCollapsed) {
            var previousCollapsed = $commitFilesContainer.hasClass('collapsed');
            if (typeof forceCollapsed === 'undefined') {
                forceCollapsed = !previousCollapsed;
            }
            $commitFilesContainer.toggleClass('collapsed', forceCollapsed).toggleClass('quick-reveal-mode', isQuickRevealing);

            collapsed = $commitFilesContainer.hasClass('collapsed');

            if (collapsed !== previousCollapsed) {
                _events2.default.trigger('bitbucket.internal.feature.commit.difftree.toggleCollapse', null, collapsed);

                if (!_featureDetect2.default.cssTransition()) {
                    triggerCollapse();
                }
            }
        };

        toggleDiffTree = function toggleDiffTree(forceCollapsed) {
            // if we are on quick reveal mode, we shall force expanding the file browser anyway.
            forceCollapsed = isQuickRevealing ? false : forceCollapsed;
            if ((typeof forceCollapsed === 'undefined' ? 'undefined' : babelHelpers.typeof(forceCollapsed)) === 'object') {
                forceCollapsed = undefined;
            }
            isQuickRevealing = false;
            clearTimeout(quickRevealTimer);

            _internalToggleDiffTree(forceCollapsed);
        };

        _destroyables.push(_events2.default.chainWith($toggle).on('click', _domEvent2.default.preventDefault(toggleDiffTree)));
        _destroyables.push(_events2.default.chainWith($diffTreeContainer).on('mouseleave', exitQuickReveal).on('transitionend', _domEvent2.default.filterByTarget($diffTreeContainer, triggerCollapse)));

        // we shouldn't bind the hovering to the whole container, as the user may want to press the "expand" icon
        _destroyables.push(_events2.default.chainWith($diffTreeContainer.children().not('.diff-tree-toolbar')).on('mouseenter', quickReveal));
        _destroyables.push(_events2.default.chainWith($diffTreeContainer.find('.diff-tree-toolbar')).on('focus', 'input', function () {
            toggleDiffTree(false);
        }));
    }

    function initDiffTree() {
        (0, _jquery2.default)('.no-changes-placeholder').remove();

        var filePath = currentFilePath ? currentFilePath : getPathFromUrl();
        return updateDiffTree(filePath.path.getComponents()).then(function (diffTree) {
            var $node = diffTree.getSelectedFile();
            if ($node && $node.length) {
                return initFileContentFromChange(getFileChangeFromNode($node), filePath.line);
            }
            return destroyFileContent().done(function () {
                /* Append a placeholder <div> to keep the table-layout so that
                   the diff-tree does not consume the entire page width */
                (0, _jquery2.default)('.commit-files').append((0, _jquery2.default)('<div class="message no-changes-placeholder"></div>').text(_aui2.default.I18n.getText('bitbucket.web.no.changes.to.show')));
            });
        });
    }

    function createDiffTree(_options) {
        return new DiffTree('.file-tree-wrapper', '.diff-tree-toolbar .aui-toolbar2-primary', currentCommitRange, {
            maxChanges: _options.maxChanges,
            hasOtherParents: _options.numberOfParents > 1,
            urlBuilder: _options.changesUrlBuilder,
            searchUrlBuilder: _options.diffUrlBuilder,
            diffViewType: _options.diffViewType
        });
    }

    function getSelectedPath() {
        if (!currentDiffTree) {
            return null;
        }
        var $node = currentDiffTree.getSelectedFile();
        return getPathFromNode($node).toString();
    }

    function updateCommitRange(commitRange) {
        if (commitRange.getId() === currentCommitRange.getId()) {
            // bail out if not actually changing the diff.
            return;
        }

        currentCommitRange = commitRange;
        currentDiffTree.reset(); // unbind any event listeners

        if (Object.prototype.hasOwnProperty.call(diffTreesByCommitRangeId, currentCommitRange.getId())) {
            // Use cached difftree if it exists.
            currentDiffTree = diffTreesByCommitRangeId[currentCommitRange.getId()];
        } else {
            currentDiffTree = createDiffTree(_options);
            diffTreesByCommitRangeId[currentCommitRange.getId()] = currentDiffTree;
        }

        initDiffTree();
    }

    function onSelectedNodeChanged($node, initializingTree) {
        // Only set the hash if we're here from a user clicking a file name.
        // If it's a popState or a pushState or hashchange, the hash should already be set correctly.
        // If we're initializing a full tree, we want an empty hash.
        // If we're initializing a full tree BECAUSE of a changeState, the hash should still already be set correctly.
        if (!changingState && !initializingTree) {
            window.location.hash = $node ? encodeURI(getPathFromNode($node).toString()) : '';
        }
    }

    function init(commitRange, options) {
        _options = _jquery2.default.extend({}, defaults, options);

        $footer = (0, _jquery2.default)('#footer');
        $content = (0, _jquery2.default)('#content');
        $container = $content.find('.commit-files');
        $fileTreeContainer = (0, _jquery2.default)('.file-tree-container');
        $fileTreeWrapper = $fileTreeContainer.children('.file-tree-wrapper');
        windowHeight = $window.height();
        $commitFileContent = (0, _jquery2.default)('#commit-file-content');

        currentCommitRange = commitRange;
        currentDiffTree = createDiffTree(_options);
        diffTreesByCommitRangeId[currentCommitRange.getId()] = currentDiffTree;
        currentFilePath = getPathFromUrl();

        $window.on('hashchange', onStateChange);
        initDiffTree();
        initDiffTreeToggle();

        _destroyables.push(_events2.default.chain().on('window.resize', onTreeAndDiffViewSizeChanged).on('bitbucket.internal.feature.fileContent.diffViewExpanded', onTreeAndDiffViewSizeChanged).on('bitbucket.internal.feature.commit.difftree.selectedNodeChanged', onSelectedNodeChanged));
        _destroyables.push({
            destroy: _shortcuts2.default.bind('requestToggleDiffTreeHandler', _lodash2.default.ary(toggleDiffTree, 0))
        });
        _destroyables.push({
            destroy: _shortcuts2.default.bind('requestMoveToNextHandler', _lodash2.default.ary(currentDiffTree.openNextFile.bind(currentDiffTree), 0))
        });
        _destroyables.push({
            destroy: _shortcuts2.default.bind('requestMoveToPreviousHandler', _lodash2.default.ary(currentDiffTree.openPrevFile.bind(currentDiffTree), 0))
        });

        // Always expand the difftree - hence the 'false' here
        _destroyables.push(_events2.default.chainWith(currentDiffTree).on('search-focus', _lodash2.default.partial(toggleDiffTree, false)));
    }

    //Visible for testing
    var _initDiffTreeToggle = initDiffTreeToggle;

    function reset() {
        if (currentDiffTree) {
            currentDiffTree.reset();
        }

        currentCommitRange = undefined;
        currentDiffTree = undefined;
        diffTreesByCommitRangeId = {};
        currentFilePath = undefined;
        currentSearch = undefined;

        $window.off('hashchange', onStateChange);

        _lodash2.default.invokeMap(_destroyables, 'destroy');
        _destroyables = [];

        return destroyFileContent();
    }

    // visible for testing
    var _onSelectedNodeChanged = onSelectedNodeChanged;

    var defaults = {
        breadcrumbs: true,
        changeTypeLozenge: true,
        changeModeLozenge: true,
        contentMode: _fileContentModes2.default.DIFF,
        linkToCommit: false,
        sourceLink: true,
        toolbarWebFragmentLocationPrimary: null,
        toolbarWebFragmentLocationSecondary: null,
        diffViewType: _diffViewType2.default.EFFECTIVE
    };

    var commentMode = _fileContent2.default.commentMode;

    exports.default = {
        getSelectedPath: getSelectedPath,
        updateCommitRange: updateCommitRange,
        init: init,
        _initDiffTreeToggle: _initDiffTreeToggle,
        reset: reset,
        _onSelectedNodeChanged: _onSelectedNodeChanged,
        defaults: defaults,
        commentMode: commentMode
    };
    module.exports = exports['default'];
});