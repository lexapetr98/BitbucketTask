define('bitbucket/internal/feature/file-content/unified-diff-view/unified-diff-view', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/feature/file-content/diff-line-info', 'bitbucket/internal/feature/file-content/diff-view-context/diff-view-context', 'bitbucket/internal/feature/file-content/diff-view-file-types', 'bitbucket/internal/feature/file-content/diff-view-segment-types', 'bitbucket/internal/feature/file-content/diff-view/diff-view', 'bitbucket/internal/feature/file-content/line-handle', 'bitbucket/internal/feature/file-content/text-view/attach-simple-scroll-behavior', 'bitbucket/internal/model/file-change-types', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/util/object', 'bitbucket/internal/util/promise', 'bitbucket/internal/feature/file-content/stash-codemirror/search'], function (module, exports, _jquery, _lodash, _diffLineInfo, _diffViewContext, _diffViewFileTypes, _diffViewSegmentTypes, _diffView, _lineHandle, _attachSimpleScrollBehavior, _fileChangeTypes, _events, _function, _object, _promise) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _diffLineInfo2 = babelHelpers.interopRequireDefault(_diffLineInfo);

    var _diffViewContext2 = babelHelpers.interopRequireDefault(_diffViewContext);

    var _diffViewFileTypes2 = babelHelpers.interopRequireDefault(_diffViewFileTypes);

    var _diffViewSegmentTypes2 = babelHelpers.interopRequireDefault(_diffViewSegmentTypes);

    var _diffView2 = babelHelpers.interopRequireDefault(_diffView);

    var _lineHandle2 = babelHelpers.interopRequireDefault(_lineHandle);

    var _attachSimpleScrollBehavior2 = babelHelpers.interopRequireDefault(_attachSimpleScrollBehavior);

    var _fileChangeTypes2 = babelHelpers.interopRequireDefault(_fileChangeTypes);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _object2 = babelHelpers.interopRequireDefault(_object);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    var tryWithLogging = _promise2.default.tryWithLogging;


    /**
     * Add destination and source line numbers to individual lines in a context hunk
     *
     * @param {Object} hunk
     */
    function addContextLineNumbers(hunk) {
        var destinationStart = hunk.destinationLine;
        var sourceStart = hunk.sourceLine;

        hunk.segments[0].lines = _lodash2.default.map(hunk.segments[0].lines, function (line) {
            line.destination = destinationStart++;
            line.source = sourceStart++;
            return line;
        });

        return hunk;
    }

    /**
     * Add the hunk separators in the diff view.
     *
     * We'll work out the hunk separators and add them to the correct place in the editor.
     *
     * @param {UnifiedDiffView} diffView
     * @param {ContentChange} change
     */
    function addSeparators(diffView, change) {
        if (!change.linesAdded || diffView._options.isExcerpt) {
            return;
        }

        var diff = change.diff;

        var separators = _diffViewContext2.default.getSeparatedHunkHtml(diff.hunks, diffView._options.fileChange.type);
        var endSeparator;

        var firstHunkHandles = [];
        var lastLineHandle;
        var prevHunk;
        change.eachLine(function (data) {
            var handle = data.handles.FROM || data.handles.TO;
            if (data.hunk !== prevHunk) {
                prevHunk = data.hunk;
                firstHunkHandles.push(handle);
            }
            lastLineHandle = handle;
        }).done(function () {
            switch (change.type) {
                case 'INSERT':
                    var firstHandle = firstHunkHandles[0];
                    var firstIndex = diffView._editor.getLineNumber(firstHandle._handle);
                    var isTop = firstIndex === 0;
                    // we want the previous last line index as this would be the line
                    // where the last separator was located before the new content was added.
                    var previousLastIndex = diffView._editor.lastLine() - change.linesAdded;
                    var isBottom = firstIndex > previousLastIndex;

                    /**
                    * Case: 2 hunks
                    *
                    * --- separator --- (never keep)
                    * hunk
                    * --- separator --- (always keep)
                    * hunk
                    * --- separator --- (never keep)
                    *
                    *
                    * Case: 1 hunk
                    * --- separator --- (keep when injecting before first line)
                    * hunk
                    * --- separator --- (keep when injecting after last line)
                    */

                    if (diff.hunks.length > 1) {
                        firstHunkHandles.shift();
                        separators.shift();
                        separators.pop();
                        lastLineHandle = undefined;
                    } else {
                        if (!isTop) {
                            firstHunkHandles.shift();
                            separators.shift();
                        }
                        if (!isBottom) {
                            separators.pop();
                            lastLineHandle = undefined;
                        } else {
                            endSeparator = separators.pop();
                        }
                    }
                    break;
                case 'INITIAL':
                    if (firstHunkHandles.length === separators.length - 1) {
                        endSeparator = separators.pop();
                    }
                    break;
                default:
                    throw new Error('Unrecognized change type: ' + change.type);
            }

            diffView.operation(function () {
                _lodash2.default.forEach(_lodash2.default.zip(separators, firstHunkHandles),
                // limit the spread to a fn.binary to avoid arguments from the forEach to get passed to the callback
                _function2.default.spread(_function2.default.binary(_lodash2.default.partial(addHunkSeparator, diffView, !!'isAbove'))));
                // The end separator:
                // Because there are no more lines below the last separator, we need to make it part of the last line.
                // while this seems like something that makes sense, you must also realise that normally a separator
                // is the first item in a hunk, and is displayed _above_ the _first_ line in a hunk.
                if (endSeparator && !diffView._isEntireFile()) {
                    addHunkSeparator(diffView, !'isAbove', endSeparator, lastLineHandle);
                }
            });
        });
    }

    /**
     * Add a line widget to the diffview that functions as a hunk separator.
     *
     * @param {UnifiedDiffView} diffView
     * @param {boolean} isAbove
     * @param {string} separatorHtml
     * @param {StashLineHandle} handle
     */
    function addHunkSeparator(diffView, isAbove, separatorHtml, handle) {
        if (!separatorHtml) {
            return;
        }
        var $separator = (0, _jquery2.default)(separatorHtml);
        var widget = diffView.addLineWidget(handle, $separator[0], {
            coverGutter: true,
            noHScroll: true,
            above: isAbove,
            weight: 500
        });
        if (isAbove) {
            diffView.addLineClass(handle, 'wrap', 'first-line-of-hunk');
        }

        // Add a handle to the node so that when we need to remove this widget, we can do so via the editor API
        $separator.data('widget', widget);
    }

    /**
     * Remove a separator widget by calling its `clear` method.
     *
     * @param {CodeMirror.LineWidget} widget
     * @returns {*}
     */
    function removeSeparatorWidget(widget) {
        widget && widget.clear();
    }

    /**
     *
     * @param {string} type - DiffViewSegmentType
     * @param {Object} line
     * @returns {{lineNumber: (number), lineType: (string}}
     */
    function toLineLocator(type, line) {
        return {
            lineNumber: type === _diffViewSegmentTypes2.default.ADDED ? line.destination : line.source,
            lineType: type
        };
    }

    /**
     * Manage Unified Diff View and its base functionality.
     *
     * @param {Object} data
     * @param {Object} options
     * @constructor
     */
    function UnifiedDiffView(data, options) {
        _diffView2.default.apply(this, arguments);
    }
    _object2.default.inherits(UnifiedDiffView, _diffView2.default);
    UnifiedDiffView.defaults = _diffView2.default.defaults;

    /**
     * Initialize the Unified Diff
     */
    UnifiedDiffView.prototype.init = function () {
        if (!this._$container) {
            return; // destroyed already!
        }

        var self = this;
        this._$container.addClass('unified-diff');

        this.on('internal-change', _lodash2.default.partial(addSeparators, this));

        if (!this._options.isExcerpt) {
            _diffViewContext2.default.attachExpandContext(this._$container, {
                fileChange: this._options.fileChange,
                expansionCallback: this._expandContextLines,
                diffViewType: this._options.diffViewType
            });
        }

        this._$container.append(bitbucket.internal.feature.fileContent.unifiedDiffView.layout());

        var commentGutter = this._options.commentContext && this._options.commentContext.getGutterId();
        if (commentGutter) {
            this.registerGutter(commentGutter, { weight: 100 });
        }
        this.registerGutter('line-number-from', { weight: 200 });
        this.registerGutter('line-number-to', { weight: 300 });
        this.registerGutter('gutter-border', { weight: 1500 });

        this._editor = this._createEditor({}, this._$container.children('.diff-editor'));

        //Only syntax highlight if we have the entire file available.
        if (this._isEntireFile()) {
            var firstLine = _function2.default.dot('hunks.0.segments.0.lines.0.line')(this._data.diff);
            this._syntaxHighlighting(this._options.fileChange.path.name, firstLine, this._editor);
        }

        this._addDestroyable(function () {
            self._editor = null;
        });

        this._scrollingReady.finally(tryWithLogging(function () {
            // Editor might've been destroyed before this callback fires
            if (!self._editor) {
                return;
            }

            self._editor.setOption('scrollLineIntoViewFunc', function (lineInfo) {
                var lineHandle = self._editor.getLineHandle(lineInfo.from.line)._stashHandle;
                self.scrollHandleIntoFocus(lineHandle);
            });

            self._modifyDiff('INITIAL', self._data.diff, _diffLineInfo2.default.convertToLineInfos(self._data.diff, self._options));
        }));

        _diffView2.default.prototype.init.call(this);
    };

    /**
     * @see {@link DiffView:_acceptModification}
     * @private
     */
    UnifiedDiffView.prototype._acceptModification = function (changeType, diff, lines, at) {
        at = at || 0;
        var editor = this._editor;
        var text = _diffView2.default._combineTexts(lines);
        switch (changeType) {
            case 'INITIAL':
                editor.setValue(text);
                break;
            case 'INSERT':
                editor._insert(text, at, true);
                break;
            default:
                throw new Error('Unrecognized change type: ' + changeType);
        }

        _lodash2.default.forEach(lines, function (lineInfo, i) {
            var handle = new _lineHandle2.default(undefined, lineInfo.lineType, lineInfo.lineNumber, editor.getLineHandle(i + at));
            if (lineInfo.lineType !== _diffViewSegmentTypes2.default.ADDED) {
                lineInfo._setHandle(_diffViewFileTypes2.default.FROM, handle);
            }
            if (lineInfo.lineType !== _diffViewSegmentTypes2.default.REMOVED) {
                lineInfo._setHandle(_diffViewFileTypes2.default.TO, handle);
            }
        });
    };

    /**
     * Get the segment that is currently at the "focus point" of the editor.
     *
     * @param {number} diffViewOffset px offset of the entire diff view. To be included in our offset calculations
     * @returns {segment}
     * @private
     */
    UnifiedDiffView.prototype._getFocusSegment = function (diffViewOffset) {
        var editor = this._editor;
        var scrollInfo = editor.getScrollInfo();
        // We use ceil because CodeMirror does when you do the setFocusSegment().
        var offset = Math.ceil(scrollInfo.clientHeight * this._options.focusPoint) - Math.floor(diffViewOffset);

        if (offset < 0) {
            return null; // too far up for anything to be focused within the diff view.
        }

        // HACK: for some reason IE reports one pixel _less_ than other browsers. Foregoing the effort of finding out why
        // and adding 1px to the current focus line. Given that we're expecting the first pixel of each line here, we
        // still have a leeway of 16px out of 17px pe rline before we start skipping segments.
        var sprinkleOfIEMagic = 1;

        // find the line that  currently has focus (or last line if the file is super short)
        var currentFocusLineIndex = Math.min(editor.lastLine(), editor.lineAtHeight(scrollInfo.top + offset + sprinkleOfIEMagic, 'local'));
        var currentFocusHandle = editor.getLineHandle(currentFocusLineIndex);
        // translate from CodeMirror LineHandle to Stash LineInfo
        var currentFocusInfo = this._internalLines[currentFocusHandle._stashHandle.lineType][currentFocusHandle._stashHandle.lineNumber];
        // grab the segment out.
        return currentFocusInfo && currentFocusInfo.segment;
    };

    /**
     * Scroll to the location that puts the first line of the given segment at the 'focus point'
     *
     * @param {Array<Object>} segments
     * @private
     */
    UnifiedDiffView.prototype._setFocusSegment = function (segments) {
        var segment = segments[0];
        this.scrollHandleIntoFocus(this.getLineHandle(toLineLocator(segment.type, segment.lines[0])));
        var handles = _lodash2.default.chain(segments).flatMap('lines').map(toLineLocator.bind(null, segment.type)).map(this.getLineHandle).value();

        this._markLinesFocused([{ editor: this._editor, handles: handles }]);
    };

    /**
     * Get the line that is currently under the focus point of the editor.
     * @returns {*}
     * @private
     */
    UnifiedDiffView.prototype._getFocusLine = function () {
        var editor = this._editor;
        var scrollInfo = editor.getScrollInfo();

        // the toolbar stays on screen.
        var expectedDiffViewOffset = this._$fileToolbar && this._$fileToolbar.outerHeight();

        // The offset from widgets + file comments
        var extraOffset = this._$container[0].getBoundingClientRect().top - expectedDiffViewOffset;

        // We use ceil because CodeMirror does when you do the setFocusSegment().
        var scrollOffset = Math.ceil(scrollInfo.clientHeight * this._options.focusPoint) - (this._editorInnerOffset() - Math.abs(extraOffset));

        // If we're scrolled in to the diff (entered fixed mode) that's when we want to start taking the scroll offset
        // in to account to offset the widgets/file comments. (But not before, otherwise we'd calculate (top of diff + offset)
        // even when we're scrolled to the top of the page
        var offset = extraOffset <= 0 ? scrollOffset : 0;

        // HACK: for some reason IE reports one pixel _less_ than other browsers. Foregoing the effort of finding out why
        // and adding 1px to the current focus line. Given that we're expecting the first pixel of each line here, we
        // still have a leeway of 16px out of 17px pe rline before we start skipping segments.
        var sprinkleOfIEMagic = 1;

        // find the line that  currently has focus (or last line if the file is super short)
        var currentFocusLineIndex = Math.min(editor.lastLine(), editor.lineAtHeight(scrollInfo.top + offset + sprinkleOfIEMagic, 'local'));
        var currentFocusHandle = editor.getLineHandle(currentFocusLineIndex);

        return currentFocusHandle._stashHandle;
    };

    /**
     * Find the next comment anchor in a given direction, from the current focus
     *
     * @param {Direction} direction
     * @param {Array<Object>} anchors
     * @param {Object} focusedAnchorInfo
     * @private
     */
    UnifiedDiffView.prototype._findNextAnchor = function (direction, anchors, focusedAnchorInfo) {
        return this._findNextAnchorInEditor(this._editor, anchors, direction, focusedAnchorInfo);
    };

    UnifiedDiffView.prototype._attachScrollBehavior = function () {
        // there is a race condition where the container might be destroyed between the UnifiedDiffView initialising
        // and this function being called after a _.defer in DiffView.init
        if (!this._$container) {
            return _jquery2.default.Deferred().reject();
        }
        return (0, _attachSimpleScrollBehavior2.default)(this, this._editor, this._$container.children('.diff-editor'));
    };

    /**
     * @see {@link DiffView:_editorForHandle}
     * @private
     */
    UnifiedDiffView.prototype._editorForHandle = function () {
        return this._editor;
    };

    /**
     * Checks if the entire file is loaded
     *
     * @returns {boolean} if this is the entire file
     * @private
     */
    UnifiedDiffView.prototype._isEntireFile = function () {
        var isWholeFileOperation = this._options.fileChange.type === _fileChangeTypes2.default.ADD || this._options.fileChange.type === _fileChangeTypes2.default.DELETE;
        return isWholeFileOperation && !this._options.isExcerpt;
    };

    /**
     * Expand the context between two hunks. This callback will look at the hunks and inject the new lines in
     * to the CodeMirror editor and trigger change events.
     *
     * @private
     * @param {FileChange} fileChange
     * @param {jQuery} $context
     * @param {Array} hunks
     */
    UnifiedDiffView.prototype._expandContextLines = function (fileChange, $context, hunks) {
        if (!this._editor) {
            // destroyed
            return;
        }

        var handle = this.getLineHandle($context);
        var editorLine = this._editor.getLineNumber(handle._handle);
        var insertionLine = this._editor.lastLine() === editorLine ? editorLine + 1 : editorLine;

        this.removeLineClass(handle, 'wrap', 'first-line-of-hunk');

        hunks.forEach(function (hunk) {
            hunk.sourceSpan = hunk.destinationSpan = hunk.segments[0].lines.length;
            addContextLineNumbers(hunk);
        });

        if (hunks.length && hunks[0].segments.length && hunks[0].segments[0].lines.length) {
            var diff = { hunks: hunks };
            this._modifyDiff('INSERT', diff, _diffLineInfo2.default.convertToLineInfos(diff, this._options), insertionLine);
        }

        // Remove the widget responsible for this expansion
        removeSeparatorWidget($context.data('widget'));

        _events2.default.trigger('bitbucket.internal.feature.fileContent.diffViewExpanded', null, {
            $context: $context,
            hunk: hunks,
            at: editorLine
        });
    };

    exports.default = UnifiedDiffView;
    module.exports = exports['default'];
});