define('bitbucket/internal/feature/comments/diff-comment-container', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/feature/comments/comment-container', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/util/promise', 'bitbucket/internal/util/time-i18n-mappings'], function (module, exports, _jquery, _lodash, _commentContainer, _events, _function, _promise, _timeI18nMappings) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _commentContainer2 = babelHelpers.interopRequireDefault(_commentContainer);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    var _timeI18nMappings2 = babelHelpers.interopRequireDefault(_timeI18nMappings);

    var tryWithLogging = _promise2.default.tryWithLogging;


    var padding;
    _events2.default.on('bitbucket.internal.history.changestate', function () {
        // when you pushstate between tabs, reset padding because diff-tab includes a margin for the add comment column
        padding = null;
    });

    exports.default = _commentContainer2.default.extend({
        rootCommentListSelector: '.comment-list',
        initialize: function initialize() {
            _lodash2.default.bindAll(this, 'onResize', 'onWebPanelResize');

            // if no element is passed in, Backbone gives us a div we don't need. Gee, thanks!
            // we want to generate an element in that case.
            if (!this.$el.is('.comment-container')) {
                this.setElement((0, _jquery2.default)(bitbucket.internal.feature.comments(_jquery2.default.extend({
                    extraClasses: 'comment-box',
                    comments: this.options.collection && this.options.collection.toJSON(),
                    customMapping: _timeI18nMappings2.default.commentEditedAge,
                    pullRequest: this.options.anchor.getPullRequest()
                }, this.options.anchor.toJSON())))[0]);
            }

            if (!this.isFileCommentContainer() && this.options.context.diffView) {
                this.toggleComment(this.options.showComments);
                this.options.context.diffView.addLineClass(this.options.lineHandle, 'wrap', 'commented');
            }

            this.on('change', this.onResize);
            this.on('comment.saved', this.scrollIntoView);
            _events2.default.on('bitbucket.internal.webpanel.resize', this.onWebPanelResize);

            _commentContainer2.default.prototype.initialize.apply(this, arguments);
        },
        closeCommentForm: function closeCommentForm($form, options) {
            // try to destroy the box, unless the doNotDestory flag is set.
            // this flag is set when a comment is successfully submitted and the form is about to be replaced with a comment.
            if (!options || !options.doNotDestroy) {
                var $commentList = $form.parent().parent();

                // if this is a top-level form and there are no comments, remove the container.
                if ($commentList.is(this.rootCommentListSelector) && $commentList.children('.comment').length === 0) {
                    this.deleteDraftComment(this.getDraftCommentFromForm($form));
                    this._unbindMarkupEditor($form);
                    return this.destroy();
                }
            }

            return _commentContainer2.default.prototype.closeCommentForm.apply(this, arguments);
        },
        destroyIfEmpty: function destroyIfEmpty() {
            var $commentList = this.$(this.rootCommentListSelector);
            if ($commentList.children('.comment').length === 0 && !$commentList.find('textarea').val()) {
                this.destroy();
            }
        },
        /**
         * Clean up
         *
         * @param [isFileChangeCleanup] Passed through from {@link feature/comments/comment-context.destroy}
         */
        destroy: function destroy(isFileChangeCleanup) {
            _commentContainer2.default.prototype.destroy.apply(this, arguments);

            padding = null;

            if (this._widget) {
                this._widget.clear();
                this._widget = null;
            }

            this.off('change', this.onResize);

            if (this.options.lineHandle) {
                this.options.context.diffView.removeLineClass(this.options.lineHandle, 'wrap', 'commented');
            }
            _events2.default.trigger('bitbucket.internal.comment.commentContainerDestroyed', null, this.$el);
            this.context.destroy(this, isFileChangeCleanup);
        },
        focusCommentForm: _function2.default.lazyDefer(function ($form) {
            this.scrollToComment($form);
            var $textArea = $form.find('textarea');
            if (this.isFileCommentContainer()) {
                // file comments typically have a larger scroll
                // If the focus happen while scrolling things seem to go bad.
                setTimeout($textArea.focus.bind($textArea), 100);
            } else {
                $textArea.focus();
            }
        }),
        onCommentDeleted: function onCommentDeleted() {
            this.destroyIfEmpty();
        },
        onCommentEditorResize: function onCommentEditorResize() {
            this.onResize();
        },
        onWebPanelResize: function onWebPanelResize(e) {
            if (e.location === 'bitbucket.comments.extra' && _jquery2.default.contains(this.$el.get(0), e.el)) {
                this.onResize();
            }
        },
        onResize: function onResize() {
            if (this._widget) {
                this._widget.changed();
            }
            this.trigger('resize');
        },
        isFileCommentContainer: function isFileCommentContainer() {
            return !!this.$el.closest('.file-comments').length;
        },
        isActivityCommentContainer: function isActivityCommentContainer() {
            return !!this.$el.closest('.activity-item').length;
        },
        scrollToComment: function scrollToComment($el) {
            var _this = this;

            // When on the activity page the diff doesn't own the scrolling like it does on a standard Unified/SBS diff
            // Because of this we can't intelligently scroll on the activity page, so we wont scroll at all as it is
            // unlikely to be off by enough to confuse users.
            if (this.isActivityCommentContainer()) {
                return;
            }

            var diffView = this.options.context.diffView;
            // we need to check that there is a diffview, Image diffs don't have a diffview but do have file comments
            if (!diffView) {
                return;
            }

            diffView._scrollingReady.then(tryWithLogging(function () {
                var offset = $el.offset().top - _this.$el.offset().top;
                if (_this.isFileCommentContainer()) {
                    diffView.scrollToFileComments(offset, $el.height());
                } else {
                    diffView.scrollToWidgetOffset(_this.options.lineHandle, offset, $el.height());
                }
            }));
        },

        /**
         * Toggle this comment container
         *
         * @param {boolean} showComment if the comment should be shown
         */
        toggleComment: function toggleComment(showComment) {
            if (this.isFileCommentContainer()) {
                this.options.context.trigger('fileCommentsResized');
            } else if (showComment && !this._widget) {
                this._widget = this.options.context.diffView.addLineWidget(this.options.lineHandle, this.el, {
                    noHScroll: true,
                    coverGutter: true,
                    weight: 150
                });

                var redrawOnCommentHeightChanged = _lodash2.default.throttle(function () {
                    var currentHeight = this.getHeight();
                    if (this._previousHeight !== currentHeight) {
                        this.changed();
                        this._previousHeight = currentHeight;
                    }
                }, 200);

                this._widget.onRedraw(redrawOnCommentHeightChanged.bind(this._widget));
            } else if (!showComment && this._widget) {
                this._widget.clear();
                this._widget = null;
                this.el.parentElement.removeChild(this.el);
            }
        }
    });
    module.exports = exports['default'];
});