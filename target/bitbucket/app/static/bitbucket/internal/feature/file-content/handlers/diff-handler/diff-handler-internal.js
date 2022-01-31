define('bitbucket/internal/feature/file-content/handlers/diff-handler/diff-handler-internal', ['module', 'exports', 'lodash', 'bitbucket/internal/feature/file-content/diff-view-segment-types'], function (module, exports, _lodash, _diffViewSegmentTypes) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _diffViewSegmentTypes2 = babelHelpers.interopRequireDefault(_diffViewSegmentTypes);

    var infiniteContext = 10000; // not actually infinite, but sufficiently large.

    /**
     * Checks that all of the segments contain only added <i>or</i> only removed lines.
     *
     * @param {{hunks: [{segments: [{type: string}]}]}} data - diff data containing hunks/segments for a single file
     * @returns {boolean} return true if all the segments are only added or only removed, otherwise false
     */
    function isAddedOrRemoved(diff) {
        function isAll(type) {
            return _lodash2.default.every(diff && diff.hunks, function (hunk) {
                return _lodash2.default.every(hunk.segments, { type: type });
            });
        }
        return isAll(_diffViewSegmentTypes2.default.ADDED) || isAll(_diffViewSegmentTypes2.default.REMOVED);
    }

    /**
     * Creates an override DiffViewOptions that gives the impression that only 'unified' diff is available, and doesn't
     * allow for consumers to set new values (such as when a shortcut is used).
     *
     * @param {{get: function, set: function}} diffViewOptions - storage for options
     * @param {boolean} canHaveSideBySideDiffView - whether side-by-side diff view is available
     * @param {boolean} forceComments - always show comments
     * @returns {{get: function, set: function}} an option view that may hijack calls to the real options
     */
    function optionsOverride(diffViewOptions, canHaveSideBySideDiffView, forceComments) {
        return diffViewOptions.proxy({
            diffType: canHaveSideBySideDiffView ? undefined : 'unified',
            hideComments: forceComments ? false : undefined
        });
    }

    exports.default = {
        infiniteContext: infiniteContext,
        isAddedOrRemoved: isAddedOrRemoved,
        optionsOverride: optionsOverride
    };
    module.exports = exports['default'];
});