define('bitbucket/internal/feature/file-content/ediff/ediff-markers', ['module', 'exports', 'baconjs', 'jquery', 'lodash', 'bitbucket/internal/bbui/ediff/ediff', 'bitbucket/internal/feature/file-content/diff-view-segment-types', 'bitbucket/internal/util/bacon', 'bitbucket/internal/util/function'], function (module, exports, _baconjs, _jquery, _lodash, _ediff, _diffViewSegmentTypes, _bacon, _function) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _baconjs2 = babelHelpers.interopRequireDefault(_baconjs);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _ediff2 = babelHelpers.interopRequireDefault(_ediff);

    var _diffViewSegmentTypes2 = babelHelpers.interopRequireDefault(_diffViewSegmentTypes);

    var _bacon2 = babelHelpers.interopRequireDefault(_bacon);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var ediffTokenLimit = 750; // 10 lines * 75 tokens (roughly indicative of a long code line) per line. Open to tweaking

    /**
     * @typedef {object} Segment
     * @property Array<{line: string}> lines - list of line objects contain
     */

    /**
     * @typedef {object} Position
     * @property {number} lineOffset - offset of character in a single segment of text
     * @property {number} ch - character offset on line
     */

    /**
     * @typedef {object} MarkerOptions
     * @property {number} className - class to use for displaying marker
     */

    /**
     * @typedef {object} Marker
     * @property {number} line - line offset
     * @property {Position} from - position to start highlighting
     * @property {Position} to - position to finish highlighting
     * @property {MarkerOptions} options - rendering options
     */

    /**
     * Join the segment lines in to a full text representation for that segment
     *
     * @param {Segment} segment
     * @returns {string}
     */
    function joinSegmentLines(segment) {
        // caches the joined text for use when rendering the ediff
        return _lodash2.default.map(segment.lines, 'line').join('\n');
    }

    /**
     * Whether an Ediff should be rendered for a pair of segments.
     *
     * @param {Object[]} segmentTokens
     * @param {Object[]} previousSegmentTokens
     * @returns {boolean}
     */
    function shouldRenderEdiff(segmentTokens, previousSegmentTokens) {
        // Determine if we should render an ediff for these segments based on the number of tokens they contain.
        // Number of tokens is cheap and gives us a rough idea of the *potential* to cause a slow ediff render (but does not guarantee it).
        // The cost of calculating a better metric (number of differences between segments) is roughly equivalent to rendering the ediffs anyway.

        return segmentTokens.length < ediffTokenLimit && previousSegmentTokens.length < ediffTokenLimit;
    }

    /**
     * Add Ediff markers
     * @param {DiffView} diffView
     * @param {Object} change
     */
    function addEdiffMarkers(diffView, change) {
        var lines = _baconjs2.default.fromBinder(function (sink) {
            change.eachLine(sink).done(_lodash2.default.partial(sink, new _baconjs2.default.End()));
            return _jquery2.default.noop;
        });
        // This is where all the side-effects happen - calculate and then mark any ediffs in the view
        convertLinesToMarkers(lines).onValue(function (marker) {
            diffView.markText(marker.line, marker.from, marker.to, marker.options);
        });
    }

    /**
     * Convert a Bacon stream of lines into a stream of markers to be rendered.
     *
     * This method is a little strange, it takes the LineInfo from diff-view, which each contain a segment, which in
     * turn contain a list of the JSON lines. It's important to keep track of the LineInfo so we don't have to worry
     * about the mapping to the CodeMirror line (which could be split in two panes for side-by-side).
     *
     * <pre><code>
     * LineInfo {
     *    line: {line: 'this line'},
     *    segment: {
     *        type: 'ADDED',
     *        lines: [
     *            {line: 'another line'},
     *            {line: 'this line'}
     *        ]
     *    },
     *    handlers: {...}
     * }
     * </code></pre>
     *
     * Internally we group by the line segments so we can perform the relevant ediff logic, which tracks the
     * <i>relative</i> offset to the lines in a single segment. At the end we lookup the relevant LineInfo object.
     *
     * @param {Bacon<LineInfo>} lines
     * @returns {Bacon<Marker>}
     */
    function convertLinesToMarkers(lines) {
        function toSegment(lines) {
            return lines[0].segment;
        }

        var isConflict = _function2.default.dot('0.line.conflictMarker');

        // Group all the lines by their segments
        return _bacon2.default.split(lines, _function2.default.dot('segment')
        // Create a sliding window of each group of segments to make diffing possible
        ).slidingWindow(2, 2).filter(_function2.default.partialRight(_lodash2.default.every, _function2.default.not(isConflict)) //Reject if either the previous or current segment is a conflict
        ).filter(_function2.default.spread(function (previousLines, lines) {
            // Find adjacent REMOVED and ADDED segments. We only apply Ediff to these segments
            return toSegment(previousLines).type === _diffViewSegmentTypes2.default.REMOVED && toSegment(lines).type === _diffViewSegmentTypes2.default.ADDED;
        })
        // Calculate a stream of markers for both segments (and flatten then into a single stream)
        ).flatMap(_function2.default.spread(function (previousLines, lines) {
            function setRealMarkerLines(lines, markers) {
                return _baconjs2.default.fromArray(markers).map(function (marker) {
                    // Override the line offset with the _actual_ LineInfo
                    return _lodash2.default.assign({}, marker, {
                        line: lines[marker.line]
                    });
                });
            }
            var value = convertEdiffSegments(toSegment(previousLines), toSegment(lines));
            // The ordering of the markers doesn't matter
            return setRealMarkerLines(previousLines, value.from).merge(setRealMarkerLines(lines, value.to));
        }));
    }

    /**
     * Calculate ediff segments for two adjacent segments (removed and then added).
     *
     * @param {Segment} previousSegment
     * @param {Segment} segment
     * @returns {{from: Array<Marker> to: Array<Marker>}}
     */
    function convertEdiffSegments(previousSegment, segment) {
        function toInfo(segment) {
            var segmentText = joinSegmentLines(segment);
            return {
                text: segmentText,
                tokens: _ediff2.default.tokenizeString(segmentText)
            };
        }

        var segmentInfo = toInfo(segment);
        var previousSegmentInfo = toInfo(previousSegment);

        if (!shouldRenderEdiff(segmentInfo.tokens, previousSegmentInfo.tokens)) {
            return { to: [], from: [] };
        }

        function markRegion(regions, info) {
            return _lodash2.default.map(regions, _lodash2.default.partial(markRegionInSegment, info.text));
        }

        // At this point we have adjoining Removed and Added segments, we can now generate the ediff regions
        var ediffRegions = _ediff2.default.diff(previousSegmentInfo.tokens, segmentInfo.tokens);

        return {
            from: markRegion(ediffRegions.originalRegions, previousSegmentInfo),
            to: markRegion(ediffRegions.revisedRegions, segmentInfo)
        };
    }

    /**
     * Mark a region in a segment.
     *
     * @param {string} segmentText
     * @param {{start: number, end: number, type: string}} region
     * @returns {Marker}
     */
    function markRegionInSegment(segmentText, region) {
        // Get the text before the ediff region starts and the text contained in the ediff.
        // This will allow us to get the lines at which the ediff region starts and ends
        var precedingText = segmentText.slice(0, region.start);
        var containedText = segmentText.slice(region.start, region.end);

        // regionStartLineStart, lastContainedLineStart and regionEndLineStart give character positions
        // in the current segment's full text.
        //
        // The offset position of where the region starts on a line.
        var regionStartLineStart = precedingText.lastIndexOf('\n') + 1;
        // The character position that marks the start of the last line in this ediff region
        // This will be 0 if the region is contained to 1 line.
        var lastContainedLineStart = containedText.lastIndexOf('\n') + 1;
        // The character position at the start of the last line of the region.
        // If this region spans multiple lines, we add region.start to get the position within the segment
        var regionEndLineStart = lastContainedLineStart ? lastContainedLineStart + region.start : regionStartLineStart;

        // The starting character position on the first line of the region
        var lineStartPos = region.start - regionStartLineStart;
        // The ending character position on the last line of the region
        var lineEndPos = region.end - regionEndLineStart;

        // First line of the Ediff region
        var startLine = precedingText.split('\n').length - 1;
        // Offset of the Ediff region
        var endOffset = containedText.split('\n').length - 1;

        return {
            line: startLine,
            // Technically we don't need to the from lineOffset, but it makes this more symmetrical
            from: { lineOffset: 0, ch: lineStartPos },
            to: { lineOffset: endOffset, ch: lineEndPos },
            options: { className: 'ediff-' + region.type }
        };
    }

    var changeHandler;

    /**
     * Initialize the Ediff markers
     *
     * @param {{diffView: DiffView}} options
     * @return {{destroy: Function}} object with a destroy method to remove the event handler.
     */
    function init(options) {
        changeHandler = _lodash2.default.partial(addEdiffMarkers, options.diffView);
        options.diffView.on('internal-change', changeHandler);

        return {
            destroy: _lodash2.default.partial(destroy, options.diffView)
        };
    }

    /**
     * Unbind events
     *
     * @param {DiffView} diffView
     */
    function destroy(diffView) {
        diffView.off('internal-change', changeHandler);
    }

    exports.default = {
        init: init,
        _convertLinesToMarkers: convertLinesToMarkers
    };
    module.exports = exports['default'];
});