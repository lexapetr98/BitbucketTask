define('bitbucket/internal/feature/file-content/handlers/diff-handler', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/feature/files/file-handlers', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/comments/comments', 'bitbucket/internal/feature/file-content/binary-diff-view/binary-diff-view', 'bitbucket/internal/feature/file-content/binary-view/binary-view', 'bitbucket/internal/feature/file-content/content-message/content-message', 'bitbucket/internal/feature/file-content/diff-view-options', 'bitbucket/internal/feature/file-content/diff-view-options-panel/diff-view-options-panel', 'bitbucket/internal/feature/file-content/handlers/diff-handler/diff-handler-internal', 'bitbucket/internal/feature/file-content/request-diff', 'bitbucket/internal/feature/file-content/side-by-side-diff-view/side-by-side-diff-view', 'bitbucket/internal/feature/file-content/unified-diff-view/unified-diff-view', 'bitbucket/internal/model/file-change', 'bitbucket/internal/model/file-change-types', 'bitbucket/internal/model/file-content-modes', 'bitbucket/internal/model/path', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/promise'], function (module, exports, _jquery, _lodash, _fileHandlers, _events, _navbuilder, _comments, _binaryDiffView, _binaryView, _contentMessage, _diffViewOptions, _diffViewOptionsPanel, _diffHandlerInternal, _requestDiff, _sideBySideDiffView, _unifiedDiffView, _fileChange, _fileChangeTypes, _fileContentModes, _path, _ajax, _promise) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _fileHandlers2 = babelHelpers.interopRequireDefault(_fileHandlers);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _comments2 = babelHelpers.interopRequireDefault(_comments);

    var _binaryDiffView2 = babelHelpers.interopRequireDefault(_binaryDiffView);

    var _binaryView2 = babelHelpers.interopRequireDefault(_binaryView);

    var _contentMessage2 = babelHelpers.interopRequireDefault(_contentMessage);

    var _diffViewOptions2 = babelHelpers.interopRequireDefault(_diffViewOptions);

    var _diffViewOptionsPanel2 = babelHelpers.interopRequireDefault(_diffViewOptionsPanel);

    var _diffHandlerInternal2 = babelHelpers.interopRequireDefault(_diffHandlerInternal);

    var _requestDiff2 = babelHelpers.interopRequireDefault(_requestDiff);

    var _sideBySideDiffView2 = babelHelpers.interopRequireDefault(_sideBySideDiffView);

    var _unifiedDiffView2 = babelHelpers.interopRequireDefault(_unifiedDiffView);

    var _fileChange2 = babelHelpers.interopRequireDefault(_fileChange);

    var _fileChangeTypes2 = babelHelpers.interopRequireDefault(_fileChangeTypes);

    var _fileContentModes2 = babelHelpers.interopRequireDefault(_fileContentModes);

    var _path2 = babelHelpers.interopRequireDefault(_path);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    /**
     * Return a comment context to display and interact with the given data.
     * Will return null if the commentMode is NONE.
     *
     * @param {Object} options - file handler options
     * @param {Object} data - diff REST data
     * @param {Object} commentData - comment REST data
     * @returns {?CommentContext}
     */
    function getBoundCommentContext(options, data, commentData) {
        var $container = options.$container;
        var fileChange = new _fileChange2.default(options.fileChange);
        if (options.commentMode !== _comments2.default.commentMode.NONE) {
            // collate our comments from the two sources
            var commentsByType = commentData ? _lodash2.default.groupBy(commentData.values, function (comment) {
                return comment.anchor.line ? 'line' : 'file';
            }) : {
                line: data.lineComments || [],
                file: data.fileComments || []
            };

            return _comments2.default.bindContext($container, new _comments2.default.DiffAnchor(fileChange), {
                lineComments: commentsByType.line,
                fileComments: commentsByType.file,
                commentMode: options.commentMode,
                relevantContextLines: options.relevantContextLines,
                diffViewOptions: options.diffViewOptions,
                $toolbar: options.$toolbar,
                urlBuilder: options.commentUrlBuilder
            });
        }
        return null;
    }

    /**
     * Return the main view that will be used to display content
     * @param {Object} options - file handler options
     * @param {Object} data - diff REST data
     * @param {CommentContext} [commentContext] - the comment context, if any
     * @param {boolean} shouldShowSideBySideDiff - whether a side-by-side or unified diff is preferred.
     * @returns {{extraClasses: string?, destroy: Function?}} - the view
     */
    function getMainView(options, data, commentContext, shouldShowSideBySideDiff) {
        var diff = data.diff;
        var handlerEnum = _fileHandlers2.default.builtInHandlers;
        var $container = options.$container;
        var fileChange = new _fileChange2.default(options.fileChange);
        if (diff && (diff.binary || _binaryView2.default.treatTextAsBinary(diff.destination && diff.destination.extension))) {
            var binaryDiffView = new _binaryDiffView2.default(diff, options);
            binaryDiffView.handlerID = binaryDiffView.isDiffingImages() ? handlerEnum.DIFF_IMAGE : handlerEnum.DIFF_BINARY;
            return binaryDiffView;
        }

        if (!diff || !diff.hunks || !diff.hunks.length) {
            _contentMessage2.default.renderEmptyDiff($container, data, fileChange);
            return {
                handlerID: handlerEnum.DIFF_EMPTY,
                extraClasses: 'empty-diff message-content'
            };
        }

        if (diff.hunks[diff.hunks.length - 1].truncated) {
            _contentMessage2.default.renderTooLargeDiff($container, diff, fileChange, shouldShowSideBySideDiff);
            return {
                handlerID: handlerEnum.DIFF_TOO_LARGE,
                extraClasses: 'too-large-diff message-content'
            };
        }

        var DiffViewConstructor = shouldShowSideBySideDiff ? _sideBySideDiffView2.default : _unifiedDiffView2.default;
        var diffView = new DiffViewConstructor(data, _jquery2.default.extend({ commentContext: commentContext }, options));

        if (commentContext) {
            commentContext.setDiffView(diffView);
        }

        // Deferred for backwards compatibility - web fragments in file-content must render before the view is initialized.
        _lodash2.default.defer(diffView.init.bind(diffView));

        diffView.handlerID = shouldShowSideBySideDiff ? handlerEnum.DIFF_TEXT_SIDE_BY_SIDE : handlerEnum.DIFF_TEXT_UNIFIED;

        return diffView;
    }

    /**
     * A handler of diff files that will request diff information and call out to the correct diff view for the response.
     * It may show a binary diff, a textual diff, or an error message.
     */
    function handler(options) {
        if (options.contentMode !== _fileContentModes2.default.DIFF) {
            return false;
        }
        if (!options.diffViewOptions) {
            options.diffViewOptions = _diffViewOptions2.default;
        }

        var DEFAULT_RELEVANT_CONTEXT = 10; // if it is not available from the server for some reason
        var $container = options.$container;
        var fileChange = new _fileChange2.default(options.fileChange);
        var fileChangeType = fileChange.getType();
        var fileSupportsSideBySideView = !(fileChangeType === _fileChangeTypes2.default.ADD || fileChangeType === _fileChangeTypes2.default.DELETE || options.isExcerpt);
        // A function because fileSupportsSideBySideView can change after the data has returned
        function shouldShowSideBySideDiff(diffViewOptions) {
            return diffViewOptions.get('diffType') === 'side-by-side' && fileSupportsSideBySideView;
        }

        options.withComments = options.commentMode !== _comments2.default.commentMode.NONE;

        // For Side By Side diff set some custom options
        if (shouldShowSideBySideDiff(options.diffViewOptions)) {
            // we want to show all the context
            options.contextLines = _diffHandlerInternal2.default.infiniteContext;
            // don't pull in comments so the request can be cached
            options.withComments = false;
        }

        /**
         * Get the anchored comments for a diff. It will make an AJAX request to fetch all comments for a given
         * file (based on options.fileChange) and call the appropriate comment-context methods.
         *
         * @param {Object} options
         * @returns {Promise}
         */
        function getAnchoredComments(options) {
            var fileChange = new _fileChange2.default(options.fileChange);
            var repo = fileChange.getRepository();
            var commitRange = fileChange.getCommitRange();

            var commentBuilder;
            var repoBuilder = _navbuilder2.default.rest().project(repo.getProject().getKey()).repo(repo.getSlug());

            // If there is a commentUrlBuilder use that, otherwise:
            // Grab the pullrequest id or the commitrange
            if (options.commentUrlBuilder) {
                commentBuilder = options.commentUrlBuilder();
            } else if (commitRange.getPullRequest()) {
                commentBuilder = repoBuilder.pullRequest(commitRange.getPullRequest().getId()).comments();
            } else {
                commentBuilder = repoBuilder.commit(commitRange).comments();
            }

            var commentsUrl = commentBuilder.withParams({
                avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                    size: options.avatarSize || 'medium'
                }),
                path: new _path2.default(options.fileChange.path).toString(),
                markup: true
            }).build();

            var statusCode = options.statusCode || _ajax2.default.ignore404WithinRepository();
            _jquery2.default.extend(statusCode, {
                401: function _() {
                    return _jquery2.default.Deferred().resolve({
                        start: 0,
                        size: 0,
                        values: [],
                        isLastPage: true,
                        filter: null
                    }).promise();
                }
            });

            var xhr = _ajax2.default.rest({
                url: commentsUrl,
                statusCode: statusCode
            });

            var piped = xhr.then(function (data) {
                if (data.errors && data.errors.length) {
                    return _jquery2.default.Deferred().rejectWith(this, [this, null, null, data]);
                }

                return data;
            });

            return piped.promise(xhr);
        }

        // The comment getter can be a NOOP by default. For SBS it will point to a function that gets the comments.
        var requestComments = shouldShowSideBySideDiff(options.diffViewOptions) ? getAnchoredComments : _jquery2.default.noop;

        // Make the requests and wrap them in a promise
        var _requestPromises = _lodash2.default.compact([(0, _requestDiff2.default)(fileChange, options), requestComments(options)]);
        var requestPromise = _promise2.default.whenAbortable.apply(_promise2.default, _requestPromises);

        /**
         * Success Callback.
         * Called when both the Diff and Comments are successfully fetched.
         *
         * @param {Object} data - Diff data
         * @param {Object} [commentData] - Comment data
         * @returns {*}
         */
        function requestSuccessCallback(data, commentData) {
            var diff = data.diff;

            if (!fileChange.getType() || fileChange.getType === _fileChangeTypes2.default.UNKNOWN) {
                fileChange.setType(_fileChangeTypes2.default.guessChangeTypeFromDiff(diff));
                options.fileChange = fileChange.toJSON();
            }

            // Should not support side-by-side diff if the source is empty, otherwise
            // when displaying on file view we don't know if the file is added/removed
            if ((0, _lodash.get)(diff, 'hunks.0.sourceSpan') === 0) {
                fileSupportsSideBySideView = false;
            } else if (!fileChangeType) {
                fileSupportsSideBySideView = !_diffHandlerInternal2.default.isAddedOrRemoved(diff);
            }

            options.diffViewOptions = _diffHandlerInternal2.default.optionsOverride(options.diffViewOptions, fileSupportsSideBySideView, options.isExcerpt);
            options.relevantContextLines = options.relevantContextLines || DEFAULT_RELEVANT_CONTEXT;

            if (fileChange.getConflict()) {
                _contentMessage2.default.renderConflict($container, fileChange);
            }

            var optionsPanel = new _diffViewOptionsPanel2.default((0, _jquery2.default)(document), options.diffViewOptions);

            // Even if the diff is empty, we want to initialise file comments,
            // We won't be able to display existing file comments for unified diff view though, because we just don't have them
            // If we separate the diff request from the comments request for unified diff view,
            // we would be able to show them like we would for an empty side-by-side diff
            var commentContext = getBoundCommentContext(options, diff || {}, commentData);

            var mainView = getMainView(options, data, commentContext, shouldShowSideBySideDiff(options.diffViewOptions));

            var onDestroyCallbacks = [];
            _events2.default.trigger('bitbucket.internal.feature.fileContent.handlingDiff', null, {
                fileHandlingContext: options,
                data: data,
                mainView: mainView,
                onDestroy: function onDestroy(fn) {
                    return onDestroyCallbacks.push(fn);
                }
            });

            return {
                handlerID: mainView.handlerID,
                extraClasses: mainView.extraClasses,
                destroy: function destroy() {
                    _comments2.default.unbindContext(options.$container);
                    [mainView, optionsPanel, options.diffViewOptions].forEach(function (destroyable) {
                        if (destroyable && destroyable.destroy) {
                            destroyable.destroy();
                        }
                    });
                    onDestroyCallbacks.forEach(function (fn) {
                        return fn();
                    });
                }
            };
        }

        /**
         * Failure callback to execute when getting the diff or comments fails.
         * @param xhr
         * @param textStatus
         * @param errorThrown
         * @param data
         * @returns {Promise}
         */
        function requestFailureCallback(xhr, textStatus, errorThrown, data) {
            if (errorThrown === 'abort') {
                return _jquery2.default.Deferred().resolve();
            }
            _contentMessage2.default.renderErrors($container, data);
            return _jquery2.default.Deferred().resolve({
                extraClasses: 'diff-error message-content'
            });
        }

        return requestPromise.thenAbortable(requestSuccessCallback, requestFailureCallback);
    }

    exports.default = {
        handler: handler
    };
    module.exports = exports['default'];
});