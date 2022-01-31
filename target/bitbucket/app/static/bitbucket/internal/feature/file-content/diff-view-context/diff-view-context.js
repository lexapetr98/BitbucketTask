define('bitbucket/internal/feature/file-content/diff-view-context/diff-view-context', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/file-content/diff-view-context/diff-view-context-internal', 'bitbucket/internal/feature/file-content/diff-view-type', 'bitbucket/internal/model/file-change', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/navigator'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _diffViewContextInternal, _diffViewType, _fileChange, _ajax, _domEvent, _navigator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _diffViewContextInternal2 = babelHelpers.interopRequireDefault(_diffViewContextInternal);

    var _diffViewType2 = babelHelpers.interopRequireDefault(_diffViewType);

    var _fileChange2 = babelHelpers.interopRequireDefault(_fileChange);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var tooltip = (0, _navigator.isMac)() ? _aui2.default.I18n.getText('bitbucket.web.diffview.showmore.tooltip.cmd') : _aui2.default.I18n.getText('bitbucket.web.diffview.showmore.tooltip.ctrl');

    var contextParam = _navbuilder2.default.parse(location.href).getQueryParamValue('context');

    var DEFAULT_OPTIONS = {
        maxLimit: (0, _navigator.isIE)() ? 1000 : 5000,
        maxContext: contextParam && parseInt(contextParam, 10) || 10
    };

    function createSeparatedHunkHtml(lineStart, lineEnd, destOffset, changeType, isBelow, isAbove) {
        return isBelow || isAbove ? bitbucket.internal.feature.fileContent.hunkSeparator({
            tooltip: tooltip,
            lineStart: lineStart,
            lineEnd: lineEnd,
            destOffset: destOffset,
            changeType: changeType,
            isBelow: isBelow,
            isAbove: isAbove
        }) : '';
    }

    /**
     * Adds a listeners for context breaks so they can be expanded by a user click.
     *
     * @param {jQuery} $diffContent - container with all the diff content
     * @param {JSON.FileChangeJSON} fileChange - object with details about the current file
     * @param {function} expansionCallback - function to be used to render expanded contexts
     * @param {DiffViewType} diffViewType - what type of diff this context relates to, to determine correct ref to use for loading context
     */
    function attachExpandContext($diffContent, _ref) {
        var fileChange = _ref.fileChange,
            expansionCallback = _ref.expansionCallback,
            diffViewType = _ref.diffViewType;

        fileChange = new _fileChange2.default(fileChange);

        // Use a live event so new skipped containers will automatically have the same behaviour
        return $diffContent.on('click', '.skipped-container:not(.loading)', function (e) {
            e.preventDefault();

            var $container = (0, _jquery2.default)(e.currentTarget);
            // Stop events from firing twice
            $container.addClass('loading');
            // Replace the text so it will be centered vertical, but make sure it doesn't jump
            $container.find('.showmore span').html('&nbsp;');
            var $spinner = $container.find('.showmore').spin('small');

            var changeType = $container.data('change-type');

            var offset = $container.data('dest-offset');
            // Ctrl-click should load everything
            var maxContext = _domEvent2.default.isCtrlish(e) ? DEFAULT_OPTIONS.maxLimit - 1 : DEFAULT_OPTIONS.maxContext;
            var startIndex = $container.data('line-start') - 1;
            var endIndex = $container.data('line-end') - 1;

            function browse(sourceStart, limit) {
                var at = void 0;
                var path = void 0;
                var start = sourceStart;
                var sinceRevision = fileChange.getCommitRange().getSinceRevision();
                var untilRevision = fileChange.getCommitRange().getUntilRevision();

                if (diffViewType === _diffViewType2.default.EFFECTIVE) {
                    // For pull requests we are comparing the _effective_ diff with the target branch, we don't actually
                    // care about the destination. In the worse case the target branch has a file renamed, in which case
                    // we want the contents of the source file at the since revision, which we can't do without the 'toHash'
                    // TODO Some of this is redundant - please remove when STASHDEV-4033 is fixed.
                    at = sinceRevision && sinceRevision.getId() || untilRevision.getParents()[0].getId();
                    path = fileChange.getSrcPath() && fileChange.getSrcPath().toString() !== '' ? fileChange.getSrcPath() : fileChange.getPath();
                } else {
                    // for a COMMON_ANCESTOR or iterative diff use the untilRevision and make sure that the path matches
                    // ? because the sinceRevision is actually not a descendant of it and the lines don't work out?
                    at = untilRevision.getId();
                    path = fileChange.getPath();
                    // the start we're provided is for the since commit line numbers. We need to convert to line numbers for the until commit when we make the request.
                    start -= offset;
                }

                return _ajax2.default.rest({
                    statusCode: {
                        200: function _(xhr, testStatus, errorThrown, data) {
                            // This is about as dodgy as you get.
                            // We return 200 when the paging fails, which can happen if you're at the end of the
                            // file but don't know it and it's your first click.
                            // Look for the request line number in the error message and ignore it by returning
                            // a fake promise that has no lines.
                            // The number may also contain commas (eg. 1,345)
                            if (data && data.message && data.message.replace(/,/g, '').indexOf(' ' + start + ' ') > 0) {
                                return {
                                    promise: function promise() {
                                        return { lines: [] };
                                    }
                                };
                            }
                        }
                    },
                    url: _navbuilder2.default.rest().currentRepo().browse().path(path).at(at).withParams({ start: start, limit: limit }).build()
                }).then(function (data) {
                    // fetchContextHunks only ever thinks in terms of the lines on the since side.
                    // Sometimes we actually request the until commit's source which has different line numbers.
                    // We need to fool fetchContextHunks into thinking we got back lines from the since side.
                    // Since this is context, the lines themselves are always the same - it's just the start index that differs.
                    data.start = sourceStart;
                    return data;
                }).always(function () {
                    $spinner.spinStop();
                }).fail(function () {
                    // So the user can click on the separator again if the server went down
                    $container.removeClass('loading');
                });
            }

            _diffViewContextInternal2.default.fetchContext(startIndex, endIndex, browse, maxContext, DEFAULT_OPTIONS).then(_diffViewContextInternal2.default.toHunks(offset, changeType)).then(_lodash2.default.bind(expansionCallback, null, fileChange, $container));
        });
    }

    function getSeparatedHunkHtml(hunks, fileChangeType) {
        return _diffViewContextInternal2.default.getSeparatedHunkHtml(hunks, fileChangeType, createSeparatedHunkHtml);
    }

    exports.default = {
        attachExpandContext: attachExpandContext,
        getSeparatedHunkHtml: getSeparatedHunkHtml
    };
    module.exports = exports['default'];
});