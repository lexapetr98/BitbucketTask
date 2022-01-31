define('bitbucket/internal/feature/file-content/file-content', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'require', 'bitbucket/feature/files/file-handlers', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/ediff/ediff', 'bitbucket/internal/feature/comments/comments', 'bitbucket/internal/model/commit-range', 'bitbucket/internal/model/content-tree-node-types', 'bitbucket/internal/model/diff-type', 'bitbucket/internal/model/file-change', 'bitbucket/internal/model/file-change-types', 'bitbucket/internal/model/file-content-modes', 'bitbucket/internal/model/revision', 'bitbucket/internal/util/deprecation', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/events', 'bitbucket/internal/util/promise'], function (module, exports, _aui, _jquery, _lodash, _require2, _fileHandlers, _navbuilder, _ediff, _comments, _commitRange, _contentTreeNodeTypes, _diffType, _fileChange, _fileChangeTypes, _fileContentModes, _revision, _deprecation, _domEvent, _events, _promise) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _require3 = babelHelpers.interopRequireDefault(_require2);

    var _fileHandlers2 = babelHelpers.interopRequireDefault(_fileHandlers);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _ediff2 = babelHelpers.interopRequireDefault(_ediff);

    var _comments2 = babelHelpers.interopRequireDefault(_comments);

    var _commitRange2 = babelHelpers.interopRequireDefault(_commitRange);

    var _contentTreeNodeTypes2 = babelHelpers.interopRequireDefault(_contentTreeNodeTypes);

    var _diffType2 = babelHelpers.interopRequireDefault(_diffType);

    var _fileChange2 = babelHelpers.interopRequireDefault(_fileChange);

    var _fileChangeTypes2 = babelHelpers.interopRequireDefault(_fileChangeTypes);

    var _fileContentModes2 = babelHelpers.interopRequireDefault(_fileContentModes);

    var _revision2 = babelHelpers.interopRequireDefault(_revision);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    var diffHandlerDeprecation = (0, _deprecation.getMessageLogger)('Custom FileHandler support for contentMode: ' + _fileContentModes2.default.DIFF, undefined, '5.16.0', '6.0.0');

    function getRawUrl(path, revisionRef) {
        var urlBuilder = _navbuilder2.default.currentRepo().raw().path(path);

        if (revisionRef && !revisionRef.isDefault()) {
            urlBuilder = urlBuilder.at(revisionRef.getId());
        }

        return urlBuilder.build();
    }

    function FileContent(containerSelector, id) {
        var self = this;

        this._id = id || undefined;
        this._containerSelector = containerSelector;

        // if there is an existing element with the id we want to use for file content, then set it as $self so it'll
        // be removed in initToolbarItems
        this.$self = (0, _jquery2.default)('#' + this._id);

        _events2.default.on('bitbucket.internal.feature.commitselector.itemSelected', function (_ref) {
            var commitJSON = _ref.commitJSON,
                path = _ref.path,
                srcPath = _ref.srcPath;

            var revision = new _revision2.default(commitJSON);
            if (this === self.untilRevisionPicker) {
                _events2.default.trigger('bitbucket.internal.feature.filecontent.untilRevisionChanged', self, revision, path, srcPath);
            }
        });

        this._lastInitPromise = _promise2.default.thenAbortable(_jquery2.default.Deferred().resolve());
    }

    // These are only implemented in diffs currently, not source.
    FileContent.commentMode = _comments2.default.commentMode;

    FileContent.diffPreset = {
        contentMode: _fileContentModes2.default.DIFF,
        untilRevisionPicker: true,
        rawLink: false,
        sourceLink: false,
        modeToggle: true,
        changeTypeLozenge: false,
        changeModeLozenge: false,
        breadcrumbs: false,
        commentMode: FileContent.commentMode.NONE
    };

    FileContent.sourcePreset = {
        contentMode: _fileContentModes2.default.SOURCE,
        untilRevisionPicker: true,
        rawLink: true,
        sourceLink: false,
        modeToggle: true,
        changeTypeLozenge: false,
        changeModeLozenge: false,
        breadcrumbs: false,
        commentMode: FileContent.commentMode.NONE
    };

    FileContent.defaults = {
        contentMode: _fileContentModes2.default.SOURCE,
        untilRevisionPicker: false,
        rawLink: false,
        sourceLink: false,
        modeToggle: false,
        changeTypeLozenge: false,
        changeModeLozenge: false,
        fileIcon: false,
        breadcrumbs: false,
        scrollPaneSelector: undefined,
        commentMode: FileContent.commentMode.REPLY_ONLY,
        pullRequestDiffLink: false,
        toolbarWebFragmentLocationPrimary: null,
        toolbarWebFragmentLocationSecondary: null,
        asyncDiffModifications: true,
        attachScroll: true,
        scrollStyle: 'fixed',
        useDefaultHandler: false
    };

    FileContent.prototype.initToolbarItems = function (headRef, fileChange, autoSrcPath) {
        var $container = (0, _jquery2.default)(this._containerSelector);
        var untilRevision = fileChange.getCommitRange().getUntilRevision();
        var $self = (0, _jquery2.default)(bitbucket.internal.feature.fileContent.main(_jquery2.default.extend({
            id: this._id,
            preloaded: !!fileChange.getDiff(),
            sourceUrl: this._options.sourceUrl || this._options.modeToggle ? _navbuilder2.default.currentRepo().browse().path(fileChange.getPath()).at(headRef.getDisplayId()).until(untilRevision && untilRevision.getId()).build() : '',
            diffUrl: this._options.modeToggle ? _navbuilder2.default.currentRepo().diff(fileChange, headRef, this._options.headPath, autoSrcPath).at(headRef.getDisplayId()).build() : '',
            fileChange: fileChange.toJSON()
        }, this._options)));

        this.$self && this.$self.remove();
        this.$self = $self.appendTo($container);
        var $toolbar = this.$toolbar = $self.children('.file-toolbar');
        this.$contentView = $self.children('.content-view');

        this._initCommands();

        if (this._options.breadcrumbs) {
            this.$breadcrumbs = $toolbar.find('.breadcrumbs');
        } else {
            this.$breadcrumbs = null;
        }

        if (this._options.changeTypeLozenge) {
            this.$changeTypeLozenge = $toolbar.find('.change-type-placeholder');
        } else {
            this.$changeTypeLozenge = null;
        }

        if (this._options.changeModeLozenge) {
            this.$changeModeLozenge = $toolbar.find('.change-mode-placeholder');
        } else {
            this.$changeModeLozenge = null;
        }

        if (this._options.sourceLink) {
            this.$viewSource = $toolbar.find('.source-view-link').tooltip({
                gravity: 'ne'
            });
        } else {
            this.$viewSource = null;
        }

        if (this._options.pullRequestDiffLink) {
            $toolbar.find('.pull-request-diff-outdated-lozenge').tooltip({
                gravity: 'ne'
            });
        }
    };

    FileContent.prototype._initCommands = function () {
        var $container = this._containerSelector;
        var $contentView = this.$contentView;
        var $toolbar = this.$toolbar;

        if (this._options.scrollPaneSelector === 'self') {
            $contentView.addClass('scroll-x');
        }

        if (this.untilRevisionPicker) {
            this.untilRevisionPicker.destroy();
        }
        if (this._options.untilRevisionPicker) {
            // pass null as second param to prevent the require from being extracted to the top level AMD module by the babel transform
            var CommitSelector = (0, _require3.default)('bitbucket/internal/feature/file-content/commit-selector/commit-selector', null);

            this.untilRevisionPicker = new CommitSelector({
                buttonEl: $toolbar.find('.commit-selector-button'),
                id: 'commit-selector'
            });
        } else {
            this.untilRevisionPicker = null;
        }

        if (this._options.rawLink) {
            this.$viewRaw = $toolbar.find('.raw-view-link');
        } else {
            this.$viewRaw = null;
        }

        if (this._options.modeToggle) {
            this.$modeToggle = $toolbar.find('.mode-toggle').tooltip({
                gravity: 'ne'
            });
        } else {
            this.$modeToggle = null;
        }
    };

    /**
     * @param {FileChange} fileChange - A change object for this diff.
     * @param {object} options - Options for this initForContent function.
     * @param {Path} options.headPath - The path of the file at HEAD.
     * @param {RevisionReference} options.headRef - The file's target revision reference.
     * @param {*} options.anchor - An anchor for deep linking.
     * @param {String} options.contentMode - The mode of content. This is either 'source' or 'diff'.
     * @param {boolean} options.followRenames - Whether to follow renames, used in the history dropdown.
     * @param {boolean} options.autoSrcPath - If true, follow renames in diff view.
     * @param {function} options.commentUrlBuilder - The comments rest endpoint to use.
     *
     * @returns {Promise}
     */
    FileContent.prototype.initForContent = function (fileChange, options) {
        var _this = this;

        options = options || {};
        var untilRevision = fileChange.getCommitRange().getUntilRevision();

        if (this.$viewSource) {
            if (fileChange.getType() === _fileChangeTypes2.default.DELETE || fileChange.getNodeType() === _contentTreeNodeTypes2.default.SUBMODULE) {
                this.$viewSource.addClass('hidden');
            } else {
                this.$viewSource.attr('href', _navbuilder2.default.currentRepo().browse().path(fileChange.getPath()).at(untilRevision && untilRevision.getId()).build());
            }
        }

        if (this.$viewRaw) {
            this.$viewRaw.attr('href', getRawUrl(fileChange.getPath(), untilRevision && untilRevision.getRevisionReference()));
        }

        if (this.untilRevisionPicker) {
            var itemUrl = function itemUrl(commit, self) {
                var urlBuilder = _navbuilder2.default.currentRepo();
                var change = commit.properties && commit.properties.change;

                if (self._mode === _fileContentModes2.default.DIFF) {
                    urlBuilder = urlBuilder.diff(new _fileChange2.default({
                        commitRange: new _commitRange2.default({
                            untilRevision: commit,
                            diffType: _diffType2.default.COMMIT
                        }),
                        path: change && change.path || self._path,
                        srcPath: change && change.srcPath || undefined
                    }), self._headRevisionRef, self._path, false);
                } else {
                    var urlParams = { until: commit.id };
                    if (change) {
                        if (change.path !== self._path.toString()) {
                            urlParams.untilPath = change.path;
                        }
                        if (change.srcPath) {
                            urlParams.sincePath = change.srcPath;
                        } else {
                            urlParams.autoSincePath = false;
                        }
                    }
                    if (!options.followRenames || !change) {
                        urlParams.autoSincePath = false;
                    }
                    urlBuilder = urlBuilder.browse().path(self._path).withParams(urlParams);
                }
                return urlBuilder.build();
            };
            this.untilRevisionPicker.init({
                followRenames: options.followRenames,
                headRevisionReference: options.headRef,
                itemTemplate: bitbucket.internal.feature.fileContent.commitSelectorItemAuthor,
                itemTitle: function itemTitle(commitId) {
                    return _aui2.default.I18n.getText('bitbucket.web.file.history.revision.clicktoview', commitId);
                },
                itemUrl: itemUrl,
                mode: options.contentMode,
                path: options.headPath,
                selectedCommit: untilRevision && untilRevision.toJSON()
            });
        }

        if (this.$breadcrumbs) {
            this.$breadcrumbs.html(this.renderBreadCrumbs(fileChange.getPath()));
        }

        if (this.$changeTypeLozenge) {
            this._initChangeTypeLozenge(fileChange);
        }

        if (this.$changeModeLozenge) {
            var lozenge = this.getFileChangedModeLozenge(fileChange);
            if (lozenge) {
                this.$changeModeLozenge.append((0, _jquery2.default)(lozenge).tooltip());
            }
        }

        if (this.$modeToggle) {
            this.$modeToggle.on('click', 'a:not(.active,.disabled)', function (e) {
                if (!_domEvent2.default.openInSameTab(e)) {
                    return;
                }
                e.preventDefault();
                _events2.default.trigger('bitbucket.internal.feature.filecontent.requestedModeChange', this, (0, _jquery2.default)(this).hasClass('mode-diff') ? _fileContentModes2.default.DIFF : _fileContentModes2.default.SOURCE);
            });
        }

        // Check the documentation in bitbucket/feature/files/file-handlers - please update if changing this
        var fileHandlingContext = {
            $toolbar: this.$toolbar,
            $container: this.$contentView,
            asyncDiffModifications: this._options.asyncDiffModifications,
            attachScroll: this._options.attachScroll,
            autoResizing: this._options.autoResizing,
            contentMode: this._options.contentMode,
            commentMode: this._options.commentMode,
            diffUrlBuilder: this._options.diffUrlBuilder,
            fileChange: fileChange.toJSON(),
            isExcerpt: !!this._options.isExcerpt,
            lineComments: this._options.lineComments,
            relevantContextLines: this._options.relevantContextLines,
            scrollStyle: this._options.scrollStyle,
            anchor: options.anchor,
            autoSrcPath: options.autoSrcPath,
            commentUrlBuilder: options.commentUrlBuilder,
            diffViewType: options.diffViewType,
            useDefaultHandler: options.useDefaultHandler,
            diffViewOptions: this._options.diffViewOptions
        };

        var $spinner = (0, _jquery2.default)('<div />').addClass('file-content-spinner').appendTo(this.$self);
        _events2.default.trigger('bitbucket.internal.feature.fileContent.handlerRequested', null, fileHandlingContext);

        var handlerPromise = _fileHandlers2.default._handle(fileHandlingContext).done(function (handler, errors) {
            _this.renderErrors(errors);

            if (fileHandlingContext.contentMode === _fileContentModes2.default.DIFF && !Object.values(_fileHandlers2.default.builtInHandlers).concat('lfs-diff-handler' //Hardcoded from LFS plugin
            ).includes(handler.handlerID)) {
                diffHandlerDeprecation();
            }

            _this.handler = handler;
            _this.$self.addClass(handler.extraClasses);

            var webFragmentContext = {
                handlerID: handler.handlerID,
                displayType: _this._options.contentMode,
                fileChange: fileHandlingContext.fileChange,
                commentMode: _this._options.commentMode
            };
            if (_this._options.toolbarWebFragmentLocationPrimary) {
                _this.$toolbar.children('.primary').append(bitbucket.internal.widget.webFragmentButtons({
                    location: _this._options.toolbarWebFragmentLocationPrimary,
                    context: webFragmentContext
                }));
            }
            if (_this._options.toolbarWebFragmentLocationSecondary) {
                _this.$toolbar.children('.secondary').prepend(bitbucket.internal.widget.webFragmentButtons({
                    location: _this._options.toolbarWebFragmentLocationSecondary,
                    context: webFragmentContext,
                    isReverse: true
                }));
            }
        });

        return _promise2.default.spinner($spinner, handlerPromise, 'large', { zIndex: 10 }).then(function (handler) {
            var deferred = _jquery2.default.Deferred();
            _lodash2.default.defer(function () {
                _events2.default.trigger('bitbucket.internal.feature.fileContent.requestHandled', null, fileHandlingContext, handler);
                // we need to delay the resolution of the returned promise until after these
                // callbacks are handled. Otherwise if the render is aborted before these callbacks
                // run, they might run on an empty page and cause errors (Code Insights is one of them).
                // To reproduce - switch files quickly with j/k.
                deferred.resolve(handler);
            });
            // delay the handler promise, but keep any other functions it exports (e.g. an abort() method to cancel pending XHR)
            return deferred.promise(handlerPromise);
        });
    };

    FileContent.prototype.renderErrors = function (errors) {
        this.$self.parent().find('.file-content-errors').remove();
        if (errors.length > 0) {
            // TODO STASHDEV-6164 to improve the UI
            this.$self.before(bitbucket.internal.feature.fileContent.errors({
                errors: _lodash2.default.map(errors, function (error) {
                    // Fallback to error which might be a raw string
                    return error.message || error;
                })
            }));
        }
    };

    FileContent.prototype.toggleToolbarDisable = function (disable) {
        this.$self.find('.file-toolbar .aui-button').toggleClass('disabled', disable).prop('disabled', disable).attr('aria-disabled', disable); // prop doesn't work on anchors
    };

    FileContent.prototype.renderBreadCrumbs = function (path) {
        var components = _lodash2.default.map(path.getComponents(), function (str) {
            return { text: str };
        });
        return bitbucket.internal.widget.breadcrumbs.crumbs({
            pathComponents: components,
            primaryLink: this._options.diffType === 'COMMIT' && !this._options.pullRequestDiffCurrent ? null : this._options.pullRequestDiffLinkUrl
        });
    };

    FileContent.prototype.getFileChangedModeLozenge = function (fileChange) {
        var srcExecutable = fileChange.getSrcExecutable();
        var executable = fileChange.getExecutable();

        // executable can be null if the file has been deleted. We want to show the lozenge when a file has been
        // added and is executable, but not when the it has been deleted or when a file has been added without +x
        var added = null;

        if (srcExecutable == null && executable === true || srcExecutable === false && executable === true) {
            added = true;
        } else if (srcExecutable === true && executable === false) {
            added = false;
        }

        if (added !== null) {
            return (0, _jquery2.default)(bitbucket.internal.feature.fileContent.fileChangeModeLozenge({
                added: added
            }));
        }
        return null;
    };

    /**
     * Init the FileContent
     *
     * @param {FileChange} fileChange
     * @param {object} options
     *
     * @returns {Promise}
     */
    FileContent.prototype.init = function (fileChange, options) {
        var initInternal = this._initInternal.bind(this, fileChange, options);
        this._lastInitPromise = this.reset().thenAbortable(initInternal, initInternal);
        return this._lastInitPromise;
    };

    /**
     * REALLY init the FileContent
     *
     * @param {FileChange} fileChange
     * @param {object} options
     *
     * @returns {Promise}
     */
    FileContent.prototype._initInternal = function (fileChange, options) {
        options = this._options = _jquery2.default.extend({}, FileContent.defaults, options);

        var commitRange = fileChange.getCommitRange();
        var headRef = options.headRef || commitRange.getUntilRevision() && commitRange.getUntilRevision().getRevisionReference();

        if (options.changeTypeLozenge && !fileChange.getType()) {
            throw new Error('Change type is required to show the change type lozenge.');
        }

        if (!commitRange.getUntilRevision() && (options.sourceLink || options.rawLink || options.untilRevisionPicker)) {
            throw new Error('Revision info is required to show a link to the source or raw file, or a revision picker.');
        }

        this.initToolbarItems(headRef, fileChange, options.autoSrcPath);

        return this.initForContent(fileChange, {
            headPath: options.headPath || fileChange.getPath(),
            headRef: headRef,
            anchor: options.anchor,
            contentMode: options.contentMode,
            followRenames: options.followRenames,
            autoSrcPath: options.autoSrcPath,
            commentUrlBuilder: options.commentUrlBuilder,
            diffViewType: options.diffViewType,
            useDefaultHandler: options.useDefaultHandler
        });
    };

    FileContent.prototype.reset = function () {
        var _this2 = this;

        this._lastInitPromise.abort();
        var resetInternal = function resetInternal() {
            return _this2._resetInternal();
        };
        // normal .then() is used here because we want to enforce that reset is called after the initPromise and that abort doesn't
        // stop after the init but before the reset.
        return _promise2.default.thenAbortable(this._lastInitPromise.then(resetInternal, resetInternal));
    };

    FileContent.prototype._resetInternal = function resetInternal() {
        if (this.handler) {
            if (this.handler.extraClasses) {
                this.$self.removeClass(this.handler.extraClasses);
            }

            if (_lodash2.default.isFunction(this.handler.destroy)) {
                this.handler.destroy();
            }

            delete this.handler;
        }

        return _jquery2.default.Deferred().resolve();
    };

    FileContent.prototype.destroy = function () {
        this.reset();
    };

    /**
     * Init the the change type lozenge
     *
     * @param {FileChange} fileChange
     */
    FileContent.prototype._initChangeTypeLozenge = function initChangeTypeLozenge(fileChange) {
        var srcPathHtml;
        var dstPathHtml;

        var path = fileChange.getPath();
        var srcPath = fileChange.getSrcPath() || path;

        if (fileChange.getType() === _fileChangeTypes2.default.RENAME) {
            srcPathHtml = _aui2.default.escapeHtml(srcPath.getName());
            dstPathHtml = _aui2.default.escapeHtml(path.toString());
        } else if (srcPath) {
            var src = srcPath.toString();
            var dst = path.toString();
            var diff = _ediff2.default.diff(_ediff2.default.tokenizeString(src), _ediff2.default.tokenizeString(dst));

            srcPathHtml = markRegions(src, diff.originalRegions, 'deleted');
            dstPathHtml = markRegions(dst, diff.revisedRegions, 'added');
        }

        this.$changeTypeLozenge.append(bitbucket.internal.feature.fileContent.fileChangeTypeLozenge({
            changeType: fileChange.getType(),
            previousPathContent: srcPathHtml,
            pathContent: dstPathHtml
        }));

        var gravity = function gravity() {
            var spaceRight = (0, _jquery2.default)(document).width() - (0, _jquery2.default)(this).offset().left - (0, _jquery2.default)(this).width() / 2;
            var tooltipWidth = (0, _jquery2.default)('.tipsy').outerWidth();
            return spaceRight > tooltipWidth / 2 + 10 ? 'n' : 'ne';
        };
        this.$changeTypeLozenge.find('.change-type-lozenge').tooltip({
            html: true,
            className: 'change-type-lozenge-tooltip',
            gravity: gravity
        });
    };

    function markRegions(s, regions, markClass) {
        var result = '';
        var start = 0;
        for (var i = 0; i < regions.length; i++) {
            var region = regions[i];
            result += _aui2.default.escapeHtml(s.substring(start, region.start)) + '<span class="' + markClass + '">' + _aui2.default.escapeHtml(s.substring(region.start, region.end)) + '</span>';
            start = region.end;
        }
        if (start < s.length) {
            result += _aui2.default.escapeHtml(s.substring(start));
        }
        return result;
    }

    exports.default = FileContent;
    module.exports = exports['default'];
});