define('bitbucket/internal/feature/comments/diff-comment-context', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/feature/comments/anchors', 'bitbucket/internal/feature/comments/comment-collection', 'bitbucket/internal/feature/comments/comment-context', 'bitbucket/internal/feature/comments/diff-comment-container', 'bitbucket/internal/feature/file-content/diff-view-file-types', 'bitbucket/internal/feature/file-content/diff-view-options', 'bitbucket/internal/feature/file-content/diff-view-segment-types', 'bitbucket/internal/model/direction', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/util/shortcuts', 'bitbucket/internal/util/time-i18n-mappings'], function (module, exports, _jquery, _lodash, _anchors, _commentCollection, _commentContext, _diffCommentContainer, _diffViewFileTypes, _diffViewOptions, _diffViewSegmentTypes, _direction, _events, _function, _shortcuts, _timeI18nMappings) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _anchors2 = babelHelpers.interopRequireDefault(_anchors);

    var _commentCollection2 = babelHelpers.interopRequireDefault(_commentCollection);

    var _commentContext2 = babelHelpers.interopRequireDefault(_commentContext);

    var _diffCommentContainer2 = babelHelpers.interopRequireDefault(_diffCommentContainer);

    var _diffViewFileTypes2 = babelHelpers.interopRequireDefault(_diffViewFileTypes);

    var _diffViewOptions2 = babelHelpers.interopRequireDefault(_diffViewOptions);

    var _diffViewSegmentTypes2 = babelHelpers.interopRequireDefault(_diffViewSegmentTypes);

    var _direction2 = babelHelpers.interopRequireDefault(_direction);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    var _timeI18nMappings2 = babelHelpers.interopRequireDefault(_timeI18nMappings);

    var LineAnchor = _anchors2.default.LineAnchor;

    exports.default = _commentContext2.default.extend({
        events: {
            'click .add-comment-trigger': 'addCommentClicked',
            'mouseenter .dummy-comment-trigger, .add-comment-trigger': 'initTooltip'
        },
        initialize: function initialize() {
            this._destroyables = [];

            _lodash2.default.bindAll(this, 'onDiffChange', 'onFileCommentsResized', 'onCommentContainerDestroyed', 'onDiffViewOptionsChange');
            this._initFileCommentButton = this._initFileCommentButton.bind(this, this.options.$toolbar);

            this._destroyables.push(_events2.default.chain().once('bitbucket.internal.feature.fileContent.requestHandled', this._initFileCommentButton));
            this.setDiffView(this.options.diffView);

            this._dvOptions = this.options.diffViewOptions || _diffViewOptions2.default;

            // create a map of comment objects indexed by their ID
            this._commentsById = this.options.lineComments && _lodash2.default.keyBy(this.options.lineComments, _function2.default.dot('id'));

            this.$el.toggleClass('commentable', this.options.allowCommenting);

            this.toggleComments(!this._dvOptions.get('hideComments'));

            this._dvOptions.on('change', this.onDiffViewOptionsChange);
            _events2.default.on('bitbucket.internal.comment.commentContainerDestroyed', this.onCommentContainerDestroyed);

            this.renderFileComments();

            _commentContext2.default.prototype.initialize.apply(this, arguments);

            var fileCommentContainer = this._getFileCommentContainer();
            if (fileCommentContainer) {
                this._initializeFileCommentContainer(fileCommentContainer);
            }
        },
        _initFileCommentButton: function _initFileCommentButton($toolbar) {
            $toolbar.find('.add-file-comment-trigger').on('click', this.addFileCommentClicked.bind(this)).tooltip({
                gravity: 'ne'
            });
        },
        _initializeFileCommentContainer: function _initializeFileCommentContainer(fileCommentContainer) {
            fileCommentContainer.on('resize', this.onFileCommentsResized);
        },
        /**
         * Get the comment container for file comments if it exists.
         * @private
         */
        _getFileCommentContainer: function _getFileCommentContainer() {
            var anchor = this.options.anchor;
            var containerId = anchor.getId();
            if (this.includesContainer(containerId)) {
                return this._containers[containerId];
            }
        },
        _registerContainer: function _registerContainer(name, element, anchor) {
            this._containers[name] = new _diffCommentContainer2.default({
                anchor: anchor,
                context: this,
                el: element,
                name: name,
                urlBuilder: this.options.urlBuilder
            });
            return this._containers[name];
        },
        addFileCommentClicked: function addFileCommentClicked() {
            this.forceShowingComments();
            var container = this.addCommentContainerForFile();
            container.openNewCommentForm();
        },
        initTooltip: function initTooltip(e) {
            var $trigger = (0, _jquery2.default)(e.currentTarget);
            if ($trigger.data('tooltip-inited')) {
                return;
            }
            $trigger.data('tooltip-inited', true);
            $trigger.tooltip({
                gravity: 'w',
                delayOut: 200
            }).trigger('mouseenter');
        },
        addCommentClicked: function addCommentClicked(e) {
            e.preventDefault();
            this.forceShowingComments();
            var $line = (0, _jquery2.default)(e.target).closest('.line');
            var container = this.addCommentContainerForLine($line);
            container.openNewCommentForm();
        },
        forceShowingComments: function forceShowingComments() {
            if (this._dvOptions.get('hideComments')) {
                this._dvOptions.set('hideComments', false);
            }
        },
        addCommentContainerForFile: function addCommentContainerForFile() {
            var fileCommentContainer = this._getFileCommentContainer();
            if (fileCommentContainer) {
                return fileCommentContainer;
            }

            var $commentContainer = (0, _jquery2.default)(bitbucket.internal.feature.comments(this.options.anchor.toJSON()));
            $commentContainer.appendTo(this.$('.file-comments'));
            this.registerContainer($commentContainer[0], this.options.anchor);

            fileCommentContainer = this._getFileCommentContainer();
            this._initializeFileCommentContainer(fileCommentContainer);

            return fileCommentContainer;
        },
        addCommentContainerForLine: function addCommentContainerForLine($line, commentsJSON) {
            var anchor = this.getLineAnchor($line);
            var lineHandle = $line.lineType ? $line : this.diffView.getLineHandle($line);
            var containerId = anchor.getId();
            var urlBuilder = this.options.urlBuilder;
            if (!this.includesContainer(containerId)) {
                this._containers[containerId] = new _diffCommentContainer2.default({
                    anchor: anchor,
                    collection: commentsJSON ? new _commentCollection2.default(commentsJSON, {
                        anchor: anchor,
                        urlBuilder: urlBuilder
                    }) : undefined,
                    context: this,
                    lineHandle: lineHandle,
                    name: containerId,
                    showComments: !this._dvOptions.get('hideComments'),
                    urlBuilder: urlBuilder
                });
            }
            return this._containers[containerId];
        },
        destroy: function destroy(container) {
            if (!container) {
                if (this.diffView) {
                    this.diffView.off('change', this.onDiffChange);
                }
                this.$el.removeClass('commentable');
                this._dvOptions.off('change', this.onDiffViewOptionsChange);
                this._dvOptions = null;
                _events2.default.off('bitbucket.internal.comment.commentContainerDestroyed', this.onCommentContainerDestroyed);

                _lodash2.default.invokeMap(this._destroyables, 'destroy');
                this._destroyables = null;
            }

            _commentContext2.default.prototype.destroy.apply(this, arguments);
        },
        findContainerElements: function findContainerElements() {
            return this.$('.line .comment-box, .file-comments > .comment-container');
        },
        getAnchor: function getAnchor(commentContainerEl) {
            if ((0, _jquery2.default)(commentContainerEl).closest('.file-comments').length) {
                return this.options.anchor;
            }
            return this.getLineAnchor((0, _jquery2.default)(commentContainerEl).closest('.line'));
        },
        getGutterId: function getGutterId() {
            return this.options.allowCommenting ? 'add-comment-trigger' : null;
        },
        getLineAnchor: function getLineAnchor($line) {
            var lineHandle = $line.lineType ? $line : this.diffView.getLineHandle($line);
            return new LineAnchor(this.options.anchor, lineHandle.lineType, lineHandle.lineNumber, lineHandle.fileType);
        },
        /**
         * Render the fileComments that were passed in to the current comment context.
         */
        renderFileComments: function renderFileComments() {
            var pullRequest = this.options.anchor.getPullRequest();
            this.$el.prepend(bitbucket.internal.feature.fileComments({
                comments: this.options.fileComments,
                pullRequest: pullRequest,
                customMapping: _timeI18nMappings2.default.commentEditedAge
            }));
        },
        /**
         * Add anchored comments to the current diff view.
         *
         * Filters out only the line comments and add them to the correct line based on their anchors.
         *
         * @param {Object} anchoredComments
         */
        addAnchoredComments: function addAnchoredComments() {
            var self = this;
            var diffView = this.diffView;

            var anchoredComments = this.options.lineComments;

            // Check if this is a set of comments with anchors.
            if (anchoredComments && anchoredComments[0] && !anchoredComments[0].anchor) {
                return;
            }

            /**
             * Group anchored comments by fileType and line
             * @param {Array} anchoredComments
             */
            function commentsByLine(anchoredComments) {
                return _lodash2.default.chain(anchoredComments).filter(function (comment) {
                    return !!(comment.anchor && comment.anchor.line);
                }).groupBy(function (comment) {
                    return (comment.anchor.fileType || '') + comment.anchor.line;
                }).value();
            }

            // Find the lineHandle for each line that needs commenting and add comment containers for that line.
            _lodash2.default.forEach(commentsByLine(anchoredComments), function (lineComments) {
                var anchor = lineComments[0].anchor;
                var handle = diffView.getLineHandle({
                    fileType: anchor.fileType,
                    lineType: anchor.lineType,
                    lineNumber: anchor.line
                });
                // Only try to add a comment if we get back a valid handle.
                if (handle) {
                    self.addCommentContainerForLine(handle, lineComments);
                }
            });
        },
        onFileCommentsResized: function onFileCommentsResized() {
            this.trigger('fileCommentsResized');
        },
        onDiffChange: function onDiffChange(change) {
            if (change.type !== 'INITIAL' && change.type !== 'INSERT') {
                return;
            }

            if (change.type === 'INITIAL') {
                // if we have anchored line comments add them to the diff now.
                this.addAnchoredComments();
            }

            var diffView = this.diffView;
            var self = this;

            change.eachLine(function (data) {
                var line = data.line;
                var commentTriggerMarkup;
                var commentableLine = !data.attributes.expanded && data.line.conflictMarker !== 'MARKER';

                if (commentableLine && self.options.allowCommenting && change.type === 'INITIAL') {
                    commentTriggerMarkup = bitbucket.internal.feature.addCommentTrigger();
                } else {
                    commentTriggerMarkup = bitbucket.internal.feature.dummyCommentTrigger({
                        relevantContextLines: self.options.relevantContextLines
                    });
                }

                if (data.handles.FROM) {
                    diffView.setGutterMarker(data.handles.FROM, self.getGutterId(), (0, _jquery2.default)(commentTriggerMarkup)[0]);
                }

                // For side-by-side also populate the other side.
                if (data.handles.TO && data.handles.FROM !== data.handles.TO) {
                    diffView.setGutterMarker(data.handles.TO, self.getGutterId(), (0, _jquery2.default)(commentTriggerMarkup)[0]);
                }

                // if there are comments on this line, add a container for them. This is for Unified Diff only
                if (line.commentIds) {
                    // TODO (maybe) - rearrange for separated comment and diff response?
                    var lineComments = _lodash2.default.chain(line.commentIds).map(_function2.default.lookup(self._commentsById)).filter(_lodash2.default.identity).value();

                    if (lineComments.length) {
                        self.addCommentContainerForLine(data.handles.FROM || data.handles.TO, lineComments);
                    }
                }

                //Restore line drafts if there are any that haven't been restored
                if (self.unrestoredDrafts.length && change.type === 'INITIAL') {
                    //Context expansion will never have drafts to restore
                    _lodash2.default.chain(data.handles).values().compact().uniq().forEach(self.restoreDraftsForLine.bind(self)).value();
                }
            });
        },
        onCommentContainerDestroyed: function onCommentContainerDestroyed($el) {
            var fileComments = this._getFileCommentContainer();
            if (fileComments && $el === fileComments.$el) {
                _lodash2.default.defer(this.onFileCommentsResized.bind(this));
            }
        },
        onDiffViewOptionsChange: function onDiffViewOptionsChange(change) {
            if (change.key === 'hideComments') {
                this.toggleComments(!change.value);
            }
        },
        /**
         * For a line (defined by a handle), find any matching drafts and restore them
         * @param {StashLineHandle} handle
         */
        restoreDraftsForLine: function restoreDraftsForLine(handle) {
            var lineAnchor = _jquery2.default.extend({
                line: handle.lineNumber,
                lineType: handle.lineType
            }, {
                //Intentionally using $.extend because it won't copy fileType if it's undefined
                fileType: handle.fileType
            });

            var lineDrafts = this.getUnrestoredDraftsForLine(lineAnchor);

            if (lineDrafts.length) {
                var commentContainer = this.addCommentContainerForLine(handle);

                this._restoreDraftsToContainer(commentContainer, lineDrafts);

                // If we weren't able to restore at least 1 draft (can happen with replies/edits of outdated comments),
                // don't leave an empty container in the diff
                commentContainer.destroyIfEmpty();
            }
        },
        /**
         * Helper function which restores the matched drafts to the given container and prunes them from the unrestoredDrafts list
         * @param {DiffCommentContainer} container
         * @param {Array} drafts
         * @private
         */
        _restoreDraftsToContainer: function _restoreDraftsToContainer(container, drafts) {
            _lodash2.default.forEach(drafts, container.restoreDraftComment.bind(container));

            //Remove these drafts from the pool of unrestored drafts. We won't ever retry so we optimistically remove all of them
            this.unrestoredDrafts = _lodash2.default.difference(this.unrestoredDrafts, drafts);
        },
        /**
         * Only restores file comment drafts and filters out new comments on views that don't allow commenting
         * Line comment restore is done in restoreDraftsForLine (called from onDiffChange)
         */
        restoreDrafts: function restoreDrafts() {
            var self = this;

            if (!this.options.allowCommenting) {
                this.unrestoredDrafts = _lodash2.default.filter(this.unrestoredDrafts, function (draft) {
                    //If this is a file comment activity, maintain edits and replies for file comments
                    //Otherwise filter out all drafts except for line edits and replies
                    return (draft.id || draft.parent) && (self.$el.is('.file-comment-activity') || draft.anchor.line);
                });
            }

            this.restoreDraftFileComments();
        },
        /**
         * Restore any draft file comments
         */
        restoreDraftFileComments: function restoreDraftFileComments() {
            var fileDrafts = _lodash2.default.reject(this.unrestoredDrafts, _function2.default.dot('anchor.line'));

            if (fileDrafts.length) {
                this._restoreDraftsToContainer(this.addCommentContainerForFile(), fileDrafts);
            }
        },
        /**
         * Given a line anchor, return all the unrestored drafts attached to that line
         * @param lineAnchor - {line, lineType, fileType} to compare against
         * @returns {Array} - Array of drafts or empty array
         */
        getUnrestoredDraftsForLine: function getUnrestoredDraftsForLine(lineAnchor) {
            // we know the drafts are for the right context because we pulled them from localStorage using a draftsKey()
            // that includes all the context information. So we only need to check that props _within_ that context are the same between draft and line.
            var equalise = _lodash2.default.flow(this.unifyAnchorFileTypes, //unify the fileTypes
            _function2.default.partialRight(_lodash2.default.pick, 'fileType', 'line', 'lineType' // line specifier properties
            ));
            var isSameLineAnchor = _lodash2.default.isEqual.bind(_lodash2.default, equalise(lineAnchor));
            var matchesLineAnchor = _lodash2.default.flow(_function2.default.dot('anchor'), equalise, //Unify the anchor file types and extract just the line specifier properties
            isSameLineAnchor //Is the draft's anchor equal to the lineAnchor
            );
            return _lodash2.default.filter(this.unrestoredDrafts, matchesLineAnchor);
        },
        /**
         * Treat equivalent fileTypes as equal across unified and SBS diff
         * @param {Object} anchor - Anchor containing (at least) the fileType and lineType
         * @returns {Object} - The modified anchor
         */
        unifyAnchorFileTypes: function unifyAnchorFileTypes(anchor) {
            //For context and removed lines, a fileType of 'FROM' should be considered equal to not supplying a fileType
            var fromShouldEqualNone = (anchor.lineType === _diffViewSegmentTypes2.default.CONTEXT || anchor.lineType === _diffViewSegmentTypes2.default.REMOVED) && anchor.fileType === _diffViewFileTypes2.default.FROM;
            //For added lines, a fileType of 'TO' should be considered equal to not supplying a fileType
            var toShouldEqualNone = anchor.lineType === _diffViewSegmentTypes2.default.ADDED && anchor.fileType === _diffViewFileTypes2.default.TO;

            if (fromShouldEqualNone || toShouldEqualNone) {
                return _lodash2.default.omit(anchor, 'fileType');
            }
            return anchor;
        },
        /**
         * Overrides CommentContext.prototype.clarifyAmbiguousDraftProps and adds a call to unifyAnchorFileTypes
         * @param {Object} originalDraft
         * @returns {Object} - The modified draft
         */
        clarifyAmbiguousDraftProps: function clarifyAmbiguousDraftProps(originalDraft) {
            var draft = _commentContext2.default.prototype.clarifyAmbiguousDraftProps.call(this, originalDraft);

            draft.anchor = this.unifyAnchorFileTypes(draft.anchor);

            return draft;
        },
        setDiffView: function setDiffView(diffView) {
            if (this.diffView) {
                this.diffView.off('internal-change', this.onDiffChange);
            }
            this.diffView = diffView;
            if (diffView) {
                this.diffView.on('internal-change', this.onDiffChange);
                this._destroyables.push({
                    destroy: _shortcuts2.default.bind('addFileComment', this.addFileCommentClicked.bind(this))
                });
                this._destroyables.push({
                    destroy: _shortcuts2.default.bind('requestTertiaryNext', diffView._scrollToComment.bind(diffView, _direction2.default.DOWN))
                });
                this._destroyables.push({
                    destroy: _shortcuts2.default.bind('requestTertiaryPrevious', diffView._scrollToComment.bind(diffView, _direction2.default.UP))
                });
            }
        },

        /**
         * Toggle the comments display
         *
         * This function will ask each comment container to toggleComment
         *
         * @param {boolean} toggle the state of the comments
         */
        toggleComments: function toggleComments(showComments) {
            this.$el.toggleClass('hide-comments', !showComments);
            _lodash2.default.invokeMap(this._containers, 'toggleComment', showComments);
        }
    });
    module.exports = exports['default'];
});