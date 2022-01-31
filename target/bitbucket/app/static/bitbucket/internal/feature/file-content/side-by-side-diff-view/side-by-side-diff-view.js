define('bitbucket/internal/feature/file-content/side-by-side-diff-view/side-by-side-diff-view', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/feature/file-content/diff-hunk-map/diff-hunk-map', 'bitbucket/internal/feature/file-content/diff-line-info', 'bitbucket/internal/feature/file-content/diff-view-file-types', 'bitbucket/internal/feature/file-content/diff-view-segment-types', 'bitbucket/internal/feature/file-content/diff-view/diff-view', 'bitbucket/internal/feature/file-content/line-handle', 'bitbucket/internal/feature/file-content/side-by-side-diff-view/synchronized-scroll', 'bitbucket/internal/model/direction', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/util/math', 'bitbucket/internal/util/object', 'bitbucket/internal/util/performance', 'bitbucket/internal/util/promise', 'bitbucket/internal/util/svg', 'bitbucket/internal/feature/file-content/stash-codemirror/search'], function (module, exports, _jquery, _lodash, _diffHunkMap, _diffLineInfo, _diffViewFileTypes, _diffViewSegmentTypes, _diffView, _lineHandle, _synchronizedScroll, _direction, _events, _function, _math, _object, _performance, _promise, _svg) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _diffHunkMap2 = babelHelpers.interopRequireDefault(_diffHunkMap);

    var _diffLineInfo2 = babelHelpers.interopRequireDefault(_diffLineInfo);

    var _diffViewFileTypes2 = babelHelpers.interopRequireDefault(_diffViewFileTypes);

    var _diffViewSegmentTypes2 = babelHelpers.interopRequireDefault(_diffViewSegmentTypes);

    var _diffView2 = babelHelpers.interopRequireDefault(_diffView);

    var _lineHandle2 = babelHelpers.interopRequireDefault(_lineHandle);

    var _synchronizedScroll2 = babelHelpers.interopRequireDefault(_synchronizedScroll);

    var _direction2 = babelHelpers.interopRequireDefault(_direction);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _math2 = babelHelpers.interopRequireDefault(_math);

    var _object2 = babelHelpers.interopRequireDefault(_object);

    var _performance2 = babelHelpers.interopRequireDefault(_performance);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    var _svg2 = babelHelpers.interopRequireDefault(_svg);

    var tryWithLogging = _promise2.default.tryWithLogging;


    var ADDED = _diffViewSegmentTypes2.default.ADDED;
    var CONTEXT = _diffViewSegmentTypes2.default.CONTEXT;
    var REMOVED = _diffViewSegmentTypes2.default.REMOVED;

    /**
     * Manage Side-by-side Diff View and its base functionality.
     *
     * @param {Object} data - diff JSON
     * @param {Object} options - file options
     * @constructor
     */
    function SideBySideDiffView(data, options) {
        options.combineLinkedSegments = true;
        _diffView2.default.apply(this, arguments);
    }
    _object2.default.inherits(SideBySideDiffView, _diffView2.default);
    SideBySideDiffView.defaults = _diffView2.default.defaults;

    /**
     * Initialize the Side-by-side Diff
     */
    SideBySideDiffView.prototype.init = function () {
        var _this = this;

        var self = this;
        if (!this._$container) {
            return; // destroyed already!
        }

        this._$container.addClass('side-by-side-diff');

        this._$container.append(bitbucket.internal.feature.fileContent.sideBySideDiffView.layout());

        this.fromEditorEl = this._$container.find('.side-by-side-diff-editor-from');
        this.toEditorEl = this._$container.find('.side-by-side-diff-editor-to');

        var commentGutter = this._options.commentContext && this._options.commentContext.getGutterId();
        if (commentGutter) {
            this.registerGutter(commentGutter, { weight: 100 });
        }
        this.registerGutter('line-number-from', {
            weight: 200,
            fileType: _diffViewFileTypes2.default.FROM
        });
        this.registerGutter('line-number-to', {
            weight: 200,
            fileType: _diffViewFileTypes2.default.TO
        });

        this._fromEditor = this._createEditor({
            gutterFilter: function gutterFilter(gutter) {
                return !gutter.fileType || gutter.fileType === _diffViewFileTypes2.default.FROM;
            }
        }, this.fromEditorEl);

        this._toEditor = this._createEditor({
            gutterFilter: function gutterFilter(gutter) {
                return !gutter.fileType || gutter.fileType === _diffViewFileTypes2.default.TO;
            }
        }, this.toEditorEl);

        var firstSegment = _function2.default.dot('hunks.0.segments.0')(this._data.diff);
        var firstHunkLine = _function2.default.dot('hunks.0.segments.0.lines.0.line')(this._data.diff);
        var secondHunkLine = _function2.default.dot('hunks.0.segments.1.lines.0.line')(this._data.diff);

        // if the first segment is added then the top of the from side will be the second segment
        var fromFirstLine = firstSegment.type === ADDED ? secondHunkLine : firstHunkLine;
        var fromName = _function2.default.dot('srcPath.name')(this._options.fileChange) ? this._options.fileChange.srcPath.name : this._options.fileChange.path.name;
        this._syntaxHighlighting(fromName, fromFirstLine, this._fromEditor);

        // if the first segment is removed then the top of the to side will be the second segment
        var toFirstLine = firstSegment.type === REMOVED && secondHunkLine ? secondHunkLine : firstHunkLine;
        var toName = this._options.fileChange.path.name;
        this._syntaxHighlighting(toName, toFirstLine, this._toEditor);

        this._lineInfos = _diffLineInfo2.default.convertToLineInfos(this._data.diff, this._options);

        this._scrollingReady.finally(tryWithLogging(function () {
            if (!_this._fromEditor) {
                return; // destroyed already
            }
            _this._modifyDiff('INITIAL', _this._data.diff, _this._lineInfos);
            _this._setupFindScrollIntoViewFunction(_this._fromEditor, _diffViewFileTypes2.default.FROM);
            _this._setupFindScrollIntoViewFunction(_this._toEditor, _diffViewFileTypes2.default.TO);
        }));

        this.on('internal-load', function () {
            if (!this._syncScrollingInfo) {
                // destroyed
                return;
            }

            this.setupHunkmaps(this._syncScrollingInfo.linkedFromAndToRegions);
            this._initSegmentLinking(this._syncScrollingInfo.linkedFromAndToRegions);
            // HACK - we need to scroll to the first change only after the page updates scrollbars
            // to represent the newly loaded content.
            // The scrollbars are updated on('change', whenOpDone).
            // If we directly listened on('change') here, we would execute first, which is bad.
            // If we listened on('load') here, we'd execute first, which is bad.
            // So we bind late - we wait until 'load' to enqueue ourselves with 'change', so that
            // we are the last callback called and the scrollbars will have been updated.
            // Why not setTimeout? Because that would wait an event loop and the browser might paint needlessly.
            // Why not use an event for 'scrollbars-updated-for-first-content'? Because what happens if
            // requestWindowScrolls is denied? We'd have to have a second code path which is probably even less readable..
            // All in all, this hack seems (subjectively) less evil.
            this.on('internal-change', function onChangeOnce() {
                this._whenOpDone(this._scrollEditorToFirstChange.bind(this));
                this.off('internal-change', onChangeOnce); // STASHDEV-7900 will let us use .once('change')
            });
        });

        var refreshDiffView = self.refresh.bind(self);

        _events2.default.on('bitbucket.internal.feature.sidebar.expandEnd', refreshDiffView);
        _events2.default.on('bitbucket.internal.feature.sidebar.collapseEnd', refreshDiffView);
        _events2.default.on('bitbucket.internal.feature.commit.difftree.collapseAnimationFinished', refreshDiffView);

        _diffView2.default.prototype.init.call(this);
    };

    /**
     * Prepare the diff view for GC. It's unusable after this.
     */
    SideBySideDiffView.prototype.destroy = function () {
        _diffView2.default.prototype.destroy.call(this);

        this._fromEditor = null;
        this._toEditor = null;
    };

    /**
     * @see {@link DiffView:_acceptModification}
     * @protected
     */
    SideBySideDiffView.prototype._acceptModification = function (changeType, diff, lineInfos) {
        if (changeType !== 'INITIAL') {
            throw new Error('Unrecognized change type: ' + changeType);
        }

        var fromLineInfos = _lodash2.default.reject(lineInfos, { lineType: ADDED });
        var toLineInfos = _lodash2.default.reject(lineInfos, { lineType: REMOVED });

        this._fromEditor.setValue(_diffView2.default._combineTexts(fromLineInfos));
        this._toEditor.setValue(_diffView2.default._combineTexts(toLineInfos));

        function isPairedToChange(prevLineInfo, lineInfo) {
            // a context line after a context line from a different segment means there is a change in the other editor
            return prevLineInfo.segment !== lineInfo.segment && prevLineInfo.lineType === _diffViewSegmentTypes2.default.CONTEXT && lineInfo.lineType === _diffViewSegmentTypes2.default.CONTEXT;
        }

        function setupLines(lineInfos, editor, handleProp) {
            var prevLineInfo;
            _lodash2.default.forEach(lineInfos, function (lineInfo, i) {
                var handle = editor.getLineHandle(i);
                lineInfo._setHandle(handleProp, new _lineHandle2.default(handleProp, lineInfo.lineType, lineInfo.lineNumber, handle));

                if (prevLineInfo && isPairedToChange(prevLineInfo, lineInfo)) {
                    editor.addLineClass(handle, 'wrap', 'paired-with-change');
                }
                prevLineInfo = lineInfo;
            });
        }

        setupLines(fromLineInfos, this._fromEditor, _diffViewFileTypes2.default.FROM);
        setupLines(toLineInfos, this._toEditor, _diffViewFileTypes2.default.TO);
    };

    var editorForFileType = {};
    editorForFileType[_diffViewFileTypes2.default.FROM] = '_fromEditor';
    editorForFileType[_diffViewFileTypes2.default.TO] = '_toEditor';

    /**
     * @see {@link DiffView:_editorForHandle}
     * @protected
     */
    SideBySideDiffView.prototype._editorForHandle = function (handle) {
        return this[editorForFileType[handle.fileType]];
    };

    /**
     * Return the segment that is currently at the 'focus point' in the viewport
     *
     * @param {number} diffViewOffset px offset of the diffview from the top of the viewport. We offset our values by this.
     * @returns {Object} segment
     * @private
     */
    SideBySideDiffView.prototype._getFocusSegment = function (diffViewOffset) {
        var focusOffset = this._fromEditor.getScrollInfo().clientHeight * this._options.focusPoint;
        if (diffViewOffset > focusOffset) {
            return null; // too far up for anything to be focused.
        }

        // HACK: for some reason IE reports one pixel _less_ than other browsers. Foregoing the effort of finding out why
        // and adding 1px to the current focus line. Given that we're expecting the first pixel of each line here, we
        // still have a leeway of 16px out of 17px per line before we start skipping segments.
        var sprinkleOfIEMagic = 1;

        var scrollPos = focusOffset + this._syncScrollingInfo.combinedScrollable._getScrollTop() - diffViewOffset + sprinkleOfIEMagic;
        scrollPos = Math.ceil(scrollPos); // CodeMirror ceils its values, so we do that to avoid subpixel errors.
        var focusedRegion = _lodash2.default.find(this._syncScrollingInfo.combinedRegions, function (region) {
            return region._getOffset() <= scrollPos && region._getOffset() + region.getHeight() > scrollPos;
        });

        // if the diff is too short, use the last region.
        return (focusedRegion || _lodash2.default.last(this._syncScrollingInfo.combinedRegions))._seg;
    };

    /**
     * Scroll to the location that puts the first line of the given segment at the 'focus point'
     *
     * @param {Object[]} segments
     * @private
     */
    SideBySideDiffView.prototype._setFocusSegment = function (segments) {
        var focusedRegions = _lodash2.default.filter(this._syncScrollingInfo.combinedRegions, function (region) {
            return _lodash2.default.includes(segments, region._seg);
        });

        var focusOffset = this._fromEditor.getScrollInfo().clientHeight * this._options.focusPoint;
        this._scrollToSourcePosition(null, focusedRegions[0]._getOffset() - focusOffset);

        var lineInfos = _lodash2.default.chain(focusedRegions).flatMap('_linkedRegions').flatMap('_lineInfos').uniq().value();

        function handles(lineInfos, fileType) {
            return _lodash2.default.compact(lineInfos.map(function (lineInfo) {
                return lineInfo.handles[fileType];
            }));
        }

        var self = this;
        this.operation(function () {
            self._markLinesFocused([{
                editor: self._fromEditor,
                handles: handles(lineInfos, _diffViewFileTypes2.default.FROM)
            }, {
                editor: self._toEditor,
                handles: handles(lineInfos, _diffViewFileTypes2.default.TO)
            }]);
        });
    };

    /**
     * Find the next comment anchor in a given direction, from the current focus
     *
     * @param {Direction} direction
     * @param {Array<Object>} anchors
     * @param {Object} focusedAnchorInfo
     * @private
     */
    SideBySideDiffView.prototype._findNextAnchor = function (direction, anchors, focusedAnchorInfo) {
        var anchorsByFileType = _lodash2.default.groupBy(anchors, _function2.default.dot('_fileType'));
        var nextFromAnchorInfo = anchorsByFileType.FROM && this._findNextAnchorInEditor(this._fromEditor, anchorsByFileType.FROM, direction, focusedAnchorInfo);
        var nextToAnchorInfo = anchorsByFileType.TO && this._findNextAnchorInEditor(this._toEditor, anchorsByFileType.TO, direction, focusedAnchorInfo);

        if (!nextFromAnchorInfo || !nextToAnchorInfo) {
            // if there's only one, it's that one
            return nextFromAnchorInfo || nextToAnchorInfo || null;

            // When moving downward, the FROM comes first when equal. When moving upward, TO comes first.
        } else if (direction === _direction2.default.UP && nextToAnchorInfo.offset < nextFromAnchorInfo.offset || direction === _direction2.default.DOWN && nextToAnchorInfo.offset >= nextFromAnchorInfo.offset) {
            return nextFromAnchorInfo;
        }
        return nextToAnchorInfo;
    };

    /**
     * Set up the hunk maps for the From and To sides of the editor.
     * @param linkedRegions
     */
    SideBySideDiffView.prototype.setupHunkmaps = function (linkedRegions) {
        var self = this;
        var fromRegions = linkedRegions.map(_lodash2.default.head);
        var toRegions = linkedRegions.map(_lodash2.default.last);
        var focusPoint = this._options.focusPoint;

        /**
         * Scroll the given editor to a relative position
         * @param {CodeMirror} editor
         * @param {Array<CodeMirrorRegion>} regions
         * @param {number} fraction
         */
        function scrollTo(editor, regions, fraction) {
            var scrollInfo = editor.getScrollInfo();
            var contentHeight = scrollInfo.height;
            var viewportHeight = scrollInfo.clientHeight;
            // position our clicked location {options.focusPoint} from the top
            // Also bound it to the top of the editor.
            var sideOffset = Math.max(0, contentHeight * fraction - viewportHeight * focusPoint);

            var regionIndex = _lodash2.default.findIndex(regions, function (region) {
                // getOffsetTop() is relative to the current scroll position, so we have to add the current scroll position
                // to it to get a value relative to the window
                var top = scrollInfo.top + region.getOffsetTop();
                return top <= sideOffset && top + region.getHeight() > sideOffset;
            });

            var srcRegion = regions[regionIndex];
            var combinedRegion = self._syncScrollingInfo.combinedRegions[regionIndex];
            var combinedScrollInfo = self._syncScrollingInfo.combinedScrollable.getScrollInfo();

            var regionOffset = sideOffset - (scrollInfo.top + srcRegion.getOffsetTop());
            var regionFraction = regionOffset / srcRegion.getHeight();

            // convert back to a final height that is relative to the combined scrollable so we can scroll to it
            var destHeight = combinedScrollInfo.top + combinedRegion.getOffsetTop() + regionFraction * combinedRegion.getHeight();

            self._scrollToSourcePosition(0, destHeight);
        }

        var fromHunkMap = new _diffHunkMap2.default(this.fromEditorEl, fromRegions, {
            scrollToFn: _lodash2.default.partial(scrollTo, this._fromEditor, fromRegions)
        });
        var toHunkMap = new _diffHunkMap2.default(this.toEditorEl, toRegions, {
            scrollToFn: _lodash2.default.partial(scrollTo, this._toEditor, toRegions)
        });

        var hunkMaps = [fromHunkMap, toHunkMap];

        var redraw = _lodash2.default.debounce(_lodash2.default.invokeMap.bind(_lodash2.default, hunkMaps, 'redraw'), 100);

        this._addDestroyable(fromHunkMap);
        this._addDestroyable(toHunkMap);

        this.on('widgetAdded', redraw);
        this.on('widgetChanged', redraw);
        this.on('widgetCleared', redraw);
        this.on('resize', redraw);

        this._fromEditor.on('scroll', function (editor) {
            fromHunkMap.diffScrolled(editor.getScrollInfo());
        });
        this._toEditor.on('scroll', function (editor) {
            toHunkMap.diffScrolled(editor.getScrollInfo());
        });
        this._addDestroyable(function () {
            self._fromEditor = null;
            self._toEditor = null;
        });
    };

    /**
     * Set up a few different behaviors:
     * - Synchronized scrolling between the left and right sides
     * - Page-level scroll forwarding for a 'full-screen' mode.
     * - scrolls the editor to the first real change in the file.
     *
     * @param {LineInfo[]} lineInfos
     * @returns {SyncScrollingInfo}
     * @private
     */
    SideBySideDiffView.prototype._attachScrollBehavior = function () {
        var self = this;
        var fromEditor = this._fromEditor;
        var toEditor = this._toEditor;
        var lineInfos = this._lineInfos;

        if (!fromEditor) {
            return _jquery2.default.Deferred().reject(); // destroyed before we started
        }

        // set up synchronized scrolling between the two sides.
        var syncScrollingInfo = _synchronizedScroll2.default.setupScrolling(this, lineInfos, fromEditor, toEditor, {
            includeCombinedScrollable: true,
            focusHeightFraction: self._options.focusPoint
        });

        // store for use in segment navigation
        this._syncScrollingInfo = syncScrollingInfo;

        // Link up the combined scrollable from our sync scrolling to the window
        // - Whenever the page is scrolled, it will call our scroll() function and we need to forward that to the combined scrollable.
        // - Whenever the page is resized, it'll let us know so we can resize ourself as needed.
        // - We can also call the onSizeChange and onInternalScroll callbacks it adds whenever we need the page to update based on our
        //   scroll location or size changes.
        var $editorColumns = self._$container.children('.diff-editor, .segment-connector-column');
        var cachedHeight;
        var promise = this._requestWindowScrolls({
            scrollSizing: function scrollSizing() {
                return syncScrollingInfo.combinedScrollable.getScrollInfo();
            },
            scroll: function scroll(x, y) {
                if (y != null) {
                    // ignore horizontal changes
                    syncScrollingInfo.combinedScrollable.scrollToNative(null, y);
                }
            },
            resize: function resize(width, height) {
                if (cachedHeight !== height) {
                    cachedHeight = height;
                    // ignore width changes
                    syncScrollingInfo.combinedScrollable.setClientHeight(height);
                    $editorColumns.height(height);
                    self.refresh();
                }
            },
            onSizeChange: function onSizeChange(fn) {
                self.on('resize', fn);
            }
        }); // TODO - ensure STASHDEV-6144 has not regressed after removing refresh.

        this._addDestroyable(syncScrollingInfo);

        return promise;
    };

    /**
     * Setup the center SVG segment-linking column to handle resizing and scrolling.
     *
     * @param {CodeMirrorRegion[][]} linkedRegionsList - a list of regions from each scrollable (from, to) that are linked together.
     * @private
     */
    SideBySideDiffView.prototype._initSegmentLinking = function (linkedRegionsList) {
        var $segmentColumn = (0, _jquery2.default)('.segment-connector-column');
        var svgEl = _svg2.default.createElement('svg', {});
        $segmentColumn.append(svgEl);

        var updateSegmentConnectors = updateSegmentLinkingColumn.bind(null, getLinkableSegments(linkedRegionsList), svgEl, this._getLineClasses);

        var resize = _performance2.default.enqueueCapped(requestAnimationFrame, function resize() {
            svgEl.setAttribute('height', $segmentColumn.height());
            svgEl.setAttribute('width', $segmentColumn.width());
            updateSegmentConnectors();
        });

        var updateSegmentConnectorsOnAnimationFrame = _performance2.default.enqueueCapped(requestAnimationFrame, updateSegmentConnectors);

        this.on('sync-scroll', updateSegmentConnectors);
        this.on('widgetAdded', updateSegmentConnectorsOnAnimationFrame);
        this.on('widgetChanged', updateSegmentConnectorsOnAnimationFrame);
        this.on('widgetCleared', updateSegmentConnectorsOnAnimationFrame);
        this.on('resize', resize);
        resize();
    };

    /**
     * Scroll a line handle in to the focus area
     * @param {StashLineHandle} handle
     */
    SideBySideDiffView.prototype.scrollHandleIntoFocus = function (handle) {
        var editor = this._editorForHandle(handle);
        var editorScrollInfo = editor.getScrollInfo();

        var regionSideIndex = handle.fileType === _diffViewFileTypes2.default.FROM ? 0 : 1;

        // !!!GIANT HACKS!!!
        // STASHDEV-8325
        // WHen line handles/anchors are fixed this should go away.
        if (handle.lineType === CONTEXT && handle.fileType === _diffViewFileTypes2.default.TO) {
            editor = this._fromEditor;
            regionSideIndex = 0;
        }

        var regionIndex = _lodash2.default.findIndex(this._syncScrollingInfo.linkedFromAndToRegions, function (regions) {
            return regions[regionSideIndex]._startIndex <= handle.lineNumber && regions[regionSideIndex]._endIndex > handle.lineNumber;
        });

        var srcRegion = this._syncScrollingInfo.linkedFromAndToRegions[regionIndex][regionSideIndex];
        var combinedRegion = this._syncScrollingInfo.combinedRegions[regionIndex];

        var regionOffset = editor.heightAtLine(handle.lineNumber) - editor.heightAtLine(srcRegion._startIndex);
        var combinedScrollInfo = this._syncScrollingInfo.combinedScrollable.getScrollInfo();

        var destHeight = combinedScrollInfo.top + combinedRegion.getOffsetTop() + regionOffset;

        this._scrollToFocusedOffset(destHeight, editorScrollInfo, editor);
    };

    /**
     * Setup the scroll function in the editor for the find functions
     *
     * @param {CodeMirror} editor
     * @param {string} fileType
     * @private
     */
    SideBySideDiffView.prototype._setupFindScrollIntoViewFunction = function (editor, fileType) {
        var self = this;
        editor.setOption('scrollLineIntoViewFunc', function (lineInfo) {
            self.scrollHandleIntoFocus(self.getLineHandleFromNumber(lineInfo.from.line, fileType));
        });
    };

    /**
     * Return whether a segment contains modification lines.
     *
     * @param {Object} segment
     * @returns {boolean}
     * @private
     */
    function isModification(segment) {
        return segment && segment.type !== _diffViewSegmentTypes2.default.CONTEXT;
    }

    /**
     * Return whether a region contains modification lines.
     * @param {CodeMirrorRegion} region
     * @returns {boolean}
     * @private
     */
    function isRegionModification(region) {
        return isModification(region && region._seg) && region._numLines > 0;
    }

    /**
     * Return whether a segment contains a conflict
     *
     * @param {Object} segment
     * @returns {boolean}
     * @private
     */
    function isConflicted(segment) {
        return Boolean(segment.lines[0].conflictMarker);
    }

    /**
     * Return whether a region contains a conflict
     *
     * @param {CodeMirrorRegion|getLinkableSegments.ConflictedRegion} region
     * @returns {boolean}
     * @private
     */
    function isRegionConflicted(region) {
        return region.conflicted || isConflicted(region._seg);
    }

    /**
     * Scroll an editor to the first change, based of a set of segments.
     *
     * @private
     */
    SideBySideDiffView.prototype._scrollEditorToFirstChange = function () {
        var firstChange = this._findNextChange(null, this._allSegments);
        if (firstChange) {
            this._setFocusSegment(firstChange);
        }
    };

    /**
     * Get a list of segments for use in the central SVG column. The list only includes modified segments, and
     * conflicted segments.
     *
     * @param {CodeMirrorRegion[][]} linkedRegionsList - a list of regions from each scrollable (from, to) that are linked together.
     */
    function getLinkableSegments(linkedRegionsList) {
        /**
         * Combined a few adjacent conflict regions into a single one for use in the segment linking column.
         * @param {CodeMirrorRegion} region
         * @returns {getLinkableSegments.ConflictedRegion}
         * @constructor
         * @private
         */
        function ConflictedRegion(region) {
            if (!(this instanceof ConflictedRegion)) {
                return new ConflictedRegion(region);
            }
            this._regions = [region];
            this.conflicted = true;
            this.classesInfo = {
                lineType: region._seg.type,
                conflictMarker: region._seg.lines[0].conflictMarker
            };
            this.getOffsetTop = function () {
                return this._regions[0].getOffsetTop();
            };
            this.getHeight = function () {
                return _lodash2.default.chain(this._regions).invokeMap('getHeight').reduce(_math2.default.add).value();
            };
            this.push = function (region) {
                this._regions.push(region);
            };
        }

        return linkedRegionsList.reduce(function combineConflicts(memo, linkedRegions) {
            var previousLinkedRegions = memo.previous;
            var previousConflict = previousLinkedRegions && _lodash2.default.some(previousLinkedRegions, isRegionConflicted);
            var currentConflict = _lodash2.default.some(linkedRegions, isRegionConflicted);

            if (currentConflict && previousConflict) {
                // join with the previous conflict region
                _lodash2.default.forEach(previousLinkedRegions, function (conflictedRegion, i) {
                    conflictedRegion.push(linkedRegions[i]);
                });
                return memo;
            }

            if (currentConflict) {
                // create a new conflict region to sum up all the upcoming conflicts
                linkedRegions = _lodash2.default.map(linkedRegions, ConflictedRegion);
            }

            memo.previous = linkedRegions;
            memo.regions.push(linkedRegions);
            return memo;
        }, {
            previous: null,
            regions: []
        }).regions.filter(function filterContext(linkedRegions) {
            return linkedRegions.some(_function2.default.or(isRegionModification, isRegionConflicted));
        });
    }

    /**
     * @param {CodeMirrorRegion[][]} linkedRegionsList - a list of regions from each scrollable (from, to) that are linked together.
     * @param {Element} svgEl - <svg> element to populate
     * @param {Function} getLineClasses - a function that returns a string with the appropriate CSS classes, given some metadata about a line.
     */
    function updateSegmentLinkingColumn(linkedRegionsList, svgEl, getLineClasses) {
        var svgStyle;
        var height = svgEl.offsetHeight || parseFloat((svgStyle = window.getComputedStyle(svgEl)).height);
        var width = svgEl.offsetWidth || parseFloat(svgStyle.width);
        var pastWidth = width + 1;
        var curvePointLeft = width * 0.4;
        var curvePointRight = width * 0.6;

        var regionInfo = linkedRegionsList.map(function getInfo(linkedRegions) {
            return linkedRegions.map(function (r) {
                var offset = 0;

                if (r._editor.getWrapperElement().classList.contains('searching')) {
                    // Calculate the offsets between the scroller and the wrapper elements so that
                    // when the search field is open, the segment connectors get moved accordingly
                    var scrollerOffset = r._editor.getScrollerElement().getBoundingClientRect().top;
                    var wrapperOffset = r._editor.getWrapperElement().getBoundingClientRect().top;
                    offset = scrollerOffset - wrapperOffset;
                }

                var top = r.getOffsetTop() + offset;
                var bottom = top + r.getHeight();

                return {
                    region: r,
                    top: top + 0.5, // SVG points are centered on the middle of the pixel, so the lines are antialiased and blurry. shifting them down by 0.5 pixels realigns them back with the pixel grid and makes them sharp again
                    bottom: bottom + 0.5,
                    above: top < 0,
                    inside: bottom > 0 && top < height,
                    below: bottom > height
                };
            });
        });

        var visibleRegionInfo = regionInfo.filter(function isVisible(linkedRegionInfos) {
            return linkedRegionInfos.some(_function2.default.dot('inside')) || linkedRegionInfos.some(_function2.default.dot('above')) && linkedRegionInfos.some(_function2.default.dot('below'));
        });

        function getPath(fromRegionInfo, toRegionInfo) {
            return new _svg2.default.PathBuilder().moveTo(-1, fromRegionInfo.top).curve(curvePointLeft, fromRegionInfo.top, curvePointRight, toRegionInfo.top, pastWidth, toRegionInfo.top).lineTo(pastWidth, toRegionInfo.bottom).curve(curvePointRight, toRegionInfo.bottom, curvePointLeft, fromRegionInfo.bottom, -1, fromRegionInfo.bottom).close().build();
        }

        function getClassesInfo(regionInfo, otherRegionInfo) {
            if (regionInfo.region.classesInfo) {
                return regionInfo.region.classesInfo;
            }
            var firstLineInfo = regionInfo.region._lineInfos[0];
            var otherFirstLineInfo = otherRegionInfo.region._lineInfos[0];
            return firstLineInfo ? {
                conflictMarker: firstLineInfo.line.conflictMarker,
                lineType: firstLineInfo.lineType
            } : {
                conflictMarker: null,
                lineType: otherFirstLineInfo.lineType
            };
        }
        function getClasses(fromRegionInfo, toRegionInfo) {
            var fromInfo = getClassesInfo(fromRegionInfo, toRegionInfo);
            var toInfo = getClassesInfo(toRegionInfo, fromRegionInfo);
            var allClasses = getLineClasses(fromInfo.lineType, fromInfo.conflictMarker, false) + ' ' + getLineClasses(toInfo.lineType, toInfo.conflictMarker, false);
            return _lodash2.default.uniq(allClasses.split(/\s+/)).join(' ');
        }

        var templateData = visibleRegionInfo.map(_function2.default.spread(function (fromRegionInfo, toRegionInfo) {
            return {
                path: getPath(fromRegionInfo, toRegionInfo),
                extraClasses: getClasses(fromRegionInfo, toRegionInfo)
            };
        }));

        while (svgEl.hasChildNodes()) {
            svgEl.removeChild(svgEl.firstChild);
        }

        var isAddedAndRemoved = function isAddedAndRemoved(classes) {
            return _lodash2.default.includes(classes, 'added') && _lodash2.default.includes(classes, 'removed');
        };

        var getSvgGradient = _lodash2.default.once(function (gradientId) {
            //Would be nice to move the offset to CSS with the `stop-color`, but it didn't like that
            var stops = [{
                class: 'removed',
                offset: '0%'
            }, {
                class: 'removed',
                offset: '30%'
            }, {
                class: 'added',
                offset: '70%'
            }, {
                class: 'added',
                offset: '100%'
            }];

            stops = _lodash2.default.map(stops, _svg2.default.createElement.bind(_svg2.default, 'stop'));

            return _lodash2.default.reduce(stops, function (grad, stop) {
                grad.appendChild(stop);
                return grad;
            }, _svg2.default.createElement('linearGradient', {
                id: gradientId
            }));
        });

        var gradientId = 'added-and-removed-svg-gradient';
        var fragment = templateData.map(function (data) {
            var props = {
                class: 'segment-connector ' + data.extraClasses,
                d: data.path
            };

            if (isAddedAndRemoved(data.extraClasses)) {
                //This sucks, but Firefox won't let you set a svg gradient fill via CSS.
                props.fill = 'url(#' + gradientId + ')';
            }

            return _svg2.default.createElement('path', props);
        }).concat(getSvgGradient(gradientId) //Add the gradient definition as the last element
        ).reduce(function (frag, pathEl) {
            frag.appendChild(pathEl);
            return frag;
        }, document.createDocumentFragment());

        svgEl.appendChild(fragment);
    }

    exports.default = SideBySideDiffView;
    module.exports = exports['default'];
});