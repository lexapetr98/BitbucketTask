define('bitbucket/internal/feature/file-content/diff-view-context/diff-view-context-internal', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/feature/file-content/diff-view-segment-types', 'bitbucket/internal/model/file-change-types', 'bitbucket/internal/util/function'], function (module, exports, _jquery, _lodash, _diffViewSegmentTypes, _fileChangeTypes, _function) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _diffViewSegmentTypes2 = babelHelpers.interopRequireDefault(_diffViewSegmentTypes);

    var _fileChangeTypes2 = babelHelpers.interopRequireDefault(_fileChangeTypes);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var EMPTY_HUNK = {
        destinationLine: 1,
        destinationSpan: 0,
        sourceLine: 1,
        sourceSpan: 0
    }; /**
        * Defines methods that operate on data only, no REST or Stash calls should happen in this module.
        */


    var isAdded = _function2.default.eq(_diffViewSegmentTypes2.default.ADDED);

    /**
     * Renders separated html snippets for the given hunks.
     *
     * @param {Array} hunks - objects containing details about the hunks
     * @param {function} toHtml - converts the relative line values to html
     * @returns {Array}
     */
    function getSeparatedHunkHtml(hunks, fileChangeType, toHtml) {
        /**
         * Look at a hunk and inspect its diff to see the change type
         * @param {Object} hunk
         * @returns {string}
         */
        function getChangeType(fileChangeType) {
            switch (fileChangeType) {
                case _fileChangeTypes2.default.ADD:
                    return _diffViewSegmentTypes2.default.ADDED;
                case _fileChangeTypes2.default.DELETE:
                    return _diffViewSegmentTypes2.default.REMOVED;
                default:
                    return _diffViewSegmentTypes2.default.CONTEXT;
            }
        }

        var changeType = getChangeType(fileChangeType);

        var added = isAdded(changeType);

        function getHunk(hunk) {
            return {
                line: added ? hunk.destinationLine : hunk.sourceLine,
                span: added ? hunk.destinationSpan : hunk.sourceSpan,
                isLastPage: hunk.isLastPage
            };
        }

        // Offset is _always_ relative to source
        function calcOffset(hunk) {
            return hunk.sourceLine + hunk.sourceSpan - (hunk.destinationLine + hunk.destinationSpan);
        }

        // Append an empty 'hunk' to the start so we can calculate the separation gap between this hunk and the next
        var separators = _lodash2.default.map(_lodash2.default.zip([EMPTY_HUNK].concat(hunks), hunks.concat({})), function (args) {
            var hunk = getHunk(args[0]);
            var nextHunk = getHunk(args[1]);
            var isBelow = nextHunk.line > 1;
            // Always show the end separator - we don't (safely) know how long the file is
            var isAbove = hunk.span > 0;

            // Data values needed for expanding
            var lineStart = hunk.line + hunk.span;
            var lineEnd = nextHunk.line - 1;
            // Added files have no offset - this is important for the logic in displayExpandedContext()
            var destOffset = added ? 0 : calcOffset(args[0]);

            return toHtml(lineStart, lineEnd, destOffset, changeType, isBelow, isAbove);
        });

        // If this is the last page then return everything except the final separator
        if (hunks[hunks.length - 1].isLastPage) {
            return separators.slice(0, separators.length - 1);
        }

        return separators;
    }

    /**
     * Will fetch the lines required to fill some/all of the context.
     * This may either do a single request and slice results in memory, or do two requests.
     *
     * @param startIndex source line to start expanding from (0-based)
     * @param endIndex source line to start expanding to (0-based)
     * @param browse callback returning a promise that normally invoked the /browse REST endpoint and returns
     *               Function(start, limit) => Promise<{start, size, text}>
     * @param maxContext number of lines to fetch in a single request
     * @param options {{maxLimit: number}}
     * @returns Promise<{startSep, endEnd, contexts: [{start, size, lines}]}>
     */
    function fetchContext(startIndex, endIndex, browse, maxContext, options) {
        // Unfortunately we don't know how big the file is, which makes this more complicated :(
        var limit = !isNaN(endIndex) ? endIndex - startIndex + 1 : options.maxLimit;

        function sliceLines(data, start, end) {
            return data && _lodash2.default.assign({}, data, {
                lines: data.lines.slice(start, end)
            });
        }

        /**
         * Handles the actual logic of what to do with a given start/limit request.
         * The callback allows the caller to make either one request or two, depending on the size of the request.
         *
         * This is the crux of what lines need to be shown and what to separate.
         *
         * To make the display logic easier we're return an array 'contexts' which will be joined with a separator
         * Return an array of one element means there is no separator to fill, but 'null' represents more data
         * ie at the start/end of the file
         * @param callback Function(start, limit) => Promise<[{start, size, [lines]}]>
         */
        var getExactResults = function getExactResults(callback) {
            return _jquery2.default.when(
            // Fetch 1 more result to work out if we're at the end
            startIndex === 0 ? null : callback(startIndex, maxContext + (!endIndex ? 1 : 0)), !endIndex ? null : callback(startIndex + limit - maxContext, maxContext)).then(function (lines1, lines2) {
                if (!lines2) {
                    // We don't actually know how many lines there are in this file
                    var hasMore = lines1.lines.length > maxContext;
                    return {
                        startSep: lines1.start + lines1.lines.length + (hasMore ? -1 : 0),
                        contexts: hasMore ? [sliceLines(lines1, 0, -1), null] : [lines1]
                    };
                } else if (!lines1) {
                    return {
                        startSep: 0,
                        endSep: lines2.start,
                        contexts: [null, lines2]
                    };
                }
                return {
                    startSep: lines1.start + maxContext,
                    endSep: lines2.start,
                    contexts: [lines1, lines2]
                };
            });
        };

        // Is the range of missing lines bigger than our configured maximum?
        if (limit < options.maxLimit) {
            // Do a single query and slice the results
            return browse(startIndex, limit).then(function (data) {
                // The remaining lines will fit within the space of two contexts
                if (limit <= maxContext * 2) {
                    return _jquery2.default.Deferred().resolve({
                        startSep: 0,
                        endSep: 0,
                        contexts: [data]
                    });
                }
                return getExactResults(function (start) {
                    return _jquery2.default.Deferred().resolve({
                        start: start,
                        lines: data.lines
                    });
                }).then(function (result) {
                    return _lodash2.default.assign({}, result, {
                        contexts: [sliceLines(result.contexts[0], 0, maxContext), sliceLines(result.contexts[1], -maxContext)]
                    });
                });
            });
        }
        // Limit is too big - do two requests with the exact size
        return getExactResults(browse);
    }

    /**
     * returns a function which transforms contexts pulled from a /browse REST response into hunks
     * that would fit into a /diff REST response and that can be inserted into a diff viewer.
     *
     * @param {number} offset - between the source and destination lines
     * @param {string} changeType - the type of file change we are expecting
     * @returns {string}
     */
    function toHunks(offset, changeType) {
        // +1 because n will be 0 indexed - this is just to track where we need this logic
        function fixOffset(n) {
            return n + 1;
        }

        return function display(result) {
            // Go through the contexts provided and turn them in to hunks that we can use
            // to display those hunks and work out if more separators are necessary
            var hunks = _lodash2.default.map(_lodash2.default.compact(result.contexts), function render(context) {
                return {
                    segments: [{
                        // We need to convert 'text' to 'line'
                        type: changeType,
                        lines: _lodash2.default.map(context.lines, function (line) {
                            return { line: line.text };
                        })
                    }],
                    sourceLine: fixOffset(context.start),
                    destinationLine: fixOffset(context.start) - offset,
                    isLastPage: context.isLastPage
                };
            });

            return hunks.length ? hunks : '';
        };
    }

    exports.default = {
        getSeparatedHunkHtml: getSeparatedHunkHtml,
        fetchContext: fetchContext,
        toHunks: toHunks,
        isAdded: isAdded
    };
    module.exports = exports['default'];
});