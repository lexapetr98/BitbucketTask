define('bitbucket/internal/feature/comments/comment-container', ['module', 'exports', '@atlassian/aui', 'backbone', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/comments/comment-collection', 'bitbucket/internal/feature/comments/comment-model', 'bitbucket/internal/feature/comments/comment-tips', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/util/history', 'bitbucket/internal/util/syntax-highlight', 'bitbucket/internal/util/time-i18n-mappings', 'bitbucket/internal/widget/aui/form/form', 'bitbucket/internal/widget/confirm-dialog/confirm-dialog', 'bitbucket/internal/widget/markup-editor/markup-editor'], function (module, exports, _aui, _backbone, _jquery, _lodash, _navbuilder, _commentCollection, _commentModel, _commentTips, _pageState, _domEvent, _events, _function, _history, _syntaxHighlight, _timeI18nMappings, _form, _confirmDialog, _markupEditor) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _backbone2 = babelHelpers.interopRequireDefault(_backbone);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _commentCollection2 = babelHelpers.interopRequireDefault(_commentCollection);

    var _commentModel2 = babelHelpers.interopRequireDefault(_commentModel);

    var _commentTips2 = babelHelpers.interopRequireDefault(_commentTips);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    var _syntaxHighlight2 = babelHelpers.interopRequireDefault(_syntaxHighlight);

    var _timeI18nMappings2 = babelHelpers.interopRequireDefault(_timeI18nMappings);

    var _form2 = babelHelpers.interopRequireDefault(_form);

    var _confirmDialog2 = babelHelpers.interopRequireDefault(_confirmDialog);

    var _markupEditor2 = babelHelpers.interopRequireDefault(_markupEditor);

    /**
     * Backbone view. Requires:
     * * this.anchor || options.anchor,
     * * this.rootCommentListSelector || options.rootCommentListSelector
     */

    var COMMENT_CONTAINER_MIN_WIDTH = 450; // Minimum width for showing comment tips in comment form

    exports.default = _backbone2.default.View.extend({
        initialize: function initialize() {
            _lodash2.default.bindAll(this, 'onCommentEditorResize', 'onCommentFocused');

            this.anchor = this.anchor || this.options.anchor;
            this.rootCommentListSelector = this.rootCommentListSelector || this.options.rootCommentListSelector;
            this.context = this.options.context;
            this.pullRequest = this.options.pullRequest || _pageState2.default.getPullRequest();
            this.urlBuilder = this.options.urlBuilder;

            if (!this.collection) {
                this.collection = new _commentCollection2.default([], {
                    anchor: this.anchor,
                    urlBuilder: this.urlBuilder
                });
            }

            this.initDeleteButtons();
            this.$el.imagesLoaded(this.onImagesLoaded.bind(this));
            _events2.default.trigger('bitbucket.internal.feature.comments.commentContainerAdded', null, this.$el);

            // We want to debounce for each instance of CommentContainer independently
            // so we have to bind the debounce at instantiation time
            var draftDebounceWait = 300;

            this.updateDraftComment = _lodash2.default.debounce(this.updateDraftComment, draftDebounceWait);
            //Make sure that draft deletion is always performed after any pending updates
            this.deleteDraftComment = _lodash2.default.debounce(this.deleteDraftComment, draftDebounceWait);

            this.on('comment.saved', _syntaxHighlight2.default.container.bind(null, this.$el));
            // immediately highlight any comments in this container
            _syntaxHighlight2.default.container(this.$el);

            // Triggers additional actions (e.g. opening reply form) when the comment is focused
            _events2.default.once('bitbucket.internal.feature.pullRequestActivity.focused', this.onCommentFocused);
        },
        events: {
            'submit form': 'onFormSubmit',
            'click a.times': 'onDateClicked',
            'click .cancel': 'onCancelClicked',
            'click .reply': 'onReplyClicked',
            'click .edit': 'onEditClicked',
            'click .task-create': 'onCreateTaskClicked',
            'keydown form': 'onFormKeydown',
            'input textarea': 'onTextareaInput',
            'comment-child-added .comment ': 'onChildrenChanged',
            'comment-child-removed .comment ': 'onChildrenChanged'
        },
        initDeleteButtons: function initDeleteButtons(e) {
            this.createDeleteDialog().attachTo('.delete', null, this.el);
        },
        createDeleteDialog: function createDeleteDialog() {
            var self = this;
            var confirmDialog = new _confirmDialog2.default({
                id: 'delete-repository-dialog',
                titleText: _aui2.default.I18n.getText('bitbucket.web.comment.delete.title'),
                titleClass: 'warning-header',
                panelContent: '<p>' + _aui2.default.I18n.getText('bitbucket.web.comment.delete.confirm') + '</p>',
                submitText: _aui2.default.I18n.getText('bitbucket.web.button.delete'),
                submitToHref: false,
                focusSelector: '.cancel-button'
            });

            confirmDialog.addConfirmListener(function (promise, $trigger, removeDialog) {
                removeDialog();
                self.deleteComment($trigger.closest('.comment'));
            });
            return confirmDialog;
        },
        sendOverviewAnalyticsEvent: function sendOverviewAnalyticsEvent(target, eventName, data) {
            if ((0, _jquery2.default)(target).closest('#pull-request-activity')) {
                _events2.default.trigger('bitbucket.internal.feature.pullRequest.' + eventName, null, data);
            }
        },
        onFormSubmit: function onFormSubmit(e) {
            e.preventDefault();
            // Comment containers can be nested (e.g. diff comment container inside activity-comment-container)
            // so we stopPropagation so it is only handled by the inner most container
            e.stopPropagation();
            this.submitCommentForm((0, _jquery2.default)(e.target));
        },
        onDateClicked: function onDateClicked(e) {
            e.preventDefault();
            // Comment containers can be nested (e.g. diff comment container inside activity-comment-container)
            // so we stopPropagation so it is only handled by the inner most container
            e.stopPropagation();
            (0, _jquery2.default)('.comment.focused').removeClass('focused');
            var $a = (0, _jquery2.default)(e.target).closest('a');
            $a.closest('.comment').addClass('focused');
            _history2.default.pushState(null, null, $a.prop('href'));
        },
        onCancelClicked: function onCancelClicked(e) {
            e.preventDefault();
            // Comment containers can be nested (e.g. diff comment container inside activity-comment-container)
            // so we stopPropagation so it is only handled by the inner most container
            e.stopPropagation();
            this.cancelCommentForm((0, _jquery2.default)(e.target).closest('form'));
        },
        onReplyClicked: function onReplyClicked(e) {
            // to filter auto-opening from email links
            if (e.originalEvent instanceof MouseEvent) {
                // Analytics event: stash.client.pullRequest.overview.comment.reply.clicked
                this.sendOverviewAnalyticsEvent(e.target, 'overview.comment.reply.clicked');
            }
            e.preventDefault();
            // Comment containers can be nested (e.g. diff comment container inside activity-comment-container)
            // so we stopPropagation so it is only handled by the inner most container
            e.stopPropagation();
            this.openReplyForm((0, _jquery2.default)(e.target).closest('.comment'));
        },
        onEditClicked: function onEditClicked(e) {
            // Analytics event: stash.client.pullRequest.overview.comment.edit.clicked
            this.sendOverviewAnalyticsEvent(e.target, 'overview.comment.edit.clicked');
            e.preventDefault();
            // Comment containers can be nested (e.g. diff comment container inside activity-comment-container)
            // so we stopPropagation so it is only handled by the inner most container
            e.stopPropagation();
            this.openEditForm((0, _jquery2.default)(e.target).closest('.comment'));
        },
        onCreateTaskClicked: function onCreateTaskClicked(e) {
            // Analytics event: stash.client.pullRequest.overview.comment.task.clicked
            this.sendOverviewAnalyticsEvent(e.target, 'overview.comment.task.clicked');
            e.preventDefault();
            // Comment containers can be nested (e.g. diff comment container inside activity-comment-container)
            // so we stopPropagation so it is only handled by the inner most container
            e.stopPropagation();
            var $comment = (0, _jquery2.default)(e.target).closest('.comment');
            _events2.default.trigger('bitbucket.internal.feature.tasks.createTask', null, $comment);
        },
        onImagesLoaded: function onImagesLoaded($img) {
            this.trigger('change');
        },
        onFormKeydown: function onFormKeydown(e) {
            if (_domEvent2.default.isCtrlEnter(e)) {
                e.preventDefault();
                // Comment containers can be nested (e.g. diff comment container inside activity-comment-container)
                // so we stopPropagation so it is only handled by the inner most container
                e.stopPropagation();
                (0, _jquery2.default)(e.target).closest('form').submit();
            }
        },
        onTextareaInput: function onTextareaInput(e) {
            if ((0, _jquery2.default)(e.target).closest('.comment-container').is(this.el)) {
                // Handle nested comment containers
                // Unfortunately if you've written a draft, then focus in another comment form (e.g. general comment form) and press a keyboard shortcut (such as cmd+r)
                // it will treat it as a change, even though you haven't really typed anything, and it will overwrite your other draft. Bit of an edge case though.
                this.updateDraftComment(e.target);
            }
        },
        onChildrenChanged: function onChildrenChanged(e) {
            // When a reply is removed the event triggered would be caught on the reply itself,
            // so we skip handling it in that case and wait for it to bubble up to the parent
            if (e.target === e.currentTarget) {
                return;
            }
            // We don't want the event bubbling further up the chain, just the immediate parent .comment of the
            // added/deleted comment or task
            e.stopPropagation();

            var $target = (0, _jquery2.default)(e.currentTarget);
            // find the number of tasks rows and replies that are not pending deletion (haven't been removed from the DOM yet)
            var numChildren = $target.find('> .content .task-list-row, > .replies > .comment').not('.pending-delete').length;
            $target.find('> .content > .actions > li > .delete').parent().toggleClass('hidden', !!numChildren);
        },
        onCommentFocused: function onCommentFocused($focused) {
            var action = _navbuilder2.default.parse(window.location).getQueryParamValue('action');
            var analyticsJson = {
                'comment.id': this.getCommentJSON($focused.closest('.comment')).id
            };

            if (action === 'reply') {
                $focused.find('.reply').first().click();
                // Analytics event: stash.client.comment.actions.reply
                this.sendOverviewAnalyticsEvent($focused, 'comment.actions.reply', analyticsJson);
            } else if (action === 'view') {
                // Analytics event: stash.client.comment.actions.view
                this.sendOverviewAnalyticsEvent($focused, 'comment.actions.view', analyticsJson);
            }
        },
        updateDraftComment: function updateDraftComment(textArea) {
            var draft = this.getDraftCommentFromForm((0, _jquery2.default)(textArea).closest('form'));
            this.context && this.context.saveDraftComment(draft);
        },
        getDraftCommentFromForm: function getDraftCommentFromForm($form) {
            var draft = this.getCommentFormJSON($form);

            if (draft.anchor) {
                //commitRange adds a bunch of noise to the stored comment
                delete draft.anchor.commitRange;
            }

            // $.extend doesn't copy undefined properties. JSON.stringify throws them away, so this gives us a consistent object for equality checks,
            // regardless of whether it's retrieved from the form or from sessionStorage.
            return _jquery2.default.extend({}, draft);
        },
        deleteDraftComment: function deleteDraftComment(draft) {
            this.context && this.context.deleteDraftComment(draft);
        },
        getRootCommentList: function getRootCommentList() {
            var $list = this.$(this.rootCommentListSelector);
            if (!$list.length) {
                $list = this.$el;
            }
            return $list;
        },
        render: function render() {
            var $newEl = bitbucket.internal.feature.comments(_jquery2.default.extend({
                comments: this.collection.toJSON(),
                customMapping: _timeI18nMappings2.default.commentEditedAge,
                pullRequest: this.options.anchor.getPullRequest()
            }, this.anchor.toJSON()));

            this.$el.replaceWith($newEl);

            this.setElement($newEl[0]);
        },
        _toJSON: function _toJSON($comment, text) {
            var parentId = parseInt($comment.parent().closest('.comment').attr('data-id'), 10);
            var id = parseInt($comment.attr('data-id'), 10);
            var version = parseInt($comment.attr('data-version'), 10);
            var anchor = this.anchor.toJSON();
            return {
                id: !isNaN(id) ? id : undefined,
                version: !isNaN(version) ? version : undefined,
                text: text,
                anchor: anchor,
                parent: !isNaN(parentId) ? { id: parentId } : undefined
            };
        },
        getCommentJSON: function getCommentJSON($comment) {
            return this._toJSON($comment, $comment.find('> .content > .message').attr('data-text')); // make sure to use .attr here to avoid type conversion by jQuery
        },
        getCommentFormJSON: function getCommentFormJSON($form) {
            var $commentRoot = $form.parent().is('.comment') ? $form.parent() : $form;
            return this._toJSON($commentRoot, $form.find('textarea').val());
        },

        renderContentUpdate: function renderContentUpdate($comment, commentJSON) {
            $comment.children('.content').replaceWith(bitbucket.internal.feature.commentContent({
                pullRequest: this.pullRequest && this.pullRequest.toJSON(),
                comment: commentJSON,
                hideDelete: !!$comment.find('> .replies > .comment').length,
                customMapping: _timeI18nMappings2.default.commentEditedAge
            }));
            $comment.attr('data-version', commentJSON.version).data('version', commentJSON.version);

            this.$el.imagesLoaded(this.onImagesLoaded.bind(this));
            this.scrollToComment($comment);
            this.trigger('change');
            _events2.default.trigger('bitbucket.internal.feature.comments.commentEdited', null, commentJSON, $comment);
        },
        insertCommentIntoList: function insertCommentIntoList($comment, $commentList, commentJSON) {
            var $insertBefore = $commentList.children('.comment:first');
            //TODO HACK: sort by ID is implied sort by createdDate. is that even what we want?
            while ($insertBefore.length) {
                if (parseInt($insertBefore.data('id'), 10) > commentJSON.id) {
                    break;
                }
                $insertBefore = $insertBefore.next('.comment');
            }

            $insertBefore = $insertBefore.length ? $insertBefore : $commentList.children('.comment-form-container:last');

            if ($insertBefore.length) {
                $comment.insertBefore($insertBefore);
            } else {
                $commentList.append($comment);
            }
        },
        renderComment: function renderComment(commentJSON, parentId, isContentUpdate) {
            var $comment;

            if (isContentUpdate && ($comment = (0, _jquery2.default)('.comment[data-id="' + commentJSON.id + '"]')).length) {
                return this.renderContentUpdate($comment, commentJSON);
            }

            commentJSON = _jquery2.default.extend({
                isNew: true
            }, commentJSON);

            var $parent = parentId && this.$('[data-id=' + parentId + ']');

            var $insertUnder = $parent // a reply
            ? $parent.children('.replies') : this.getRootCommentList();

            $comment = (0, _jquery2.default)(bitbucket.internal.feature.comment({
                pullRequest: this.pullRequest && this.pullRequest.toJSON(),
                numOfAncestors: $insertUnder.parents('.comment').length,
                extraClasses: this.getExtraCommentClasses(),
                comment: commentJSON,
                customMapping: _timeI18nMappings2.default.commentEditedAge
            }));

            this.insertCommentIntoList($comment, $insertUnder, commentJSON);

            // Should match the timing of the target-fade-animation in comments.less
            // We remove the clsas because Chrome bugs out and replays the animation when switching between
            // fixed and normal modes on the diff page.
            var targetFadeAnimationTime = 5000;
            setTimeout(_lodash2.default.bind($comment.removeClass, $comment, 'new'), targetFadeAnimationTime);

            this.scrollToComment($comment);
            $comment.hide().fadeIn('slow');

            this.$el.imagesLoaded(this.onImagesLoaded.bind(this));
            this.trigger('change');
            _events2.default.trigger('bitbucket.internal.feature.comments.commentAdded', null, commentJSON, $comment);

            $comment.trigger('comment-child-added');
        },
        getExtraCommentClasses: function getExtraCommentClasses() {
            return '';
        }, // Can be overridden for different contexts

        showErrorMessage: function showErrorMessage(model, error) {
            var $form = this;
            var $error = $form.find('.error');
            if (!$error.length) {
                $error = (0, _jquery2.default)('<div class="error"></div>');
                $form.find('.comment-form-footer').before($error);
            }
            $error.text(error);
        },
        cancelCommentForm: function cancelCommentForm($form) {
            this.closeCommentForm($form);
        },
        submitCommentForm: function submitCommentForm($form) {
            if (_form2.default.isSubmissionPrevented($form)) {
                return;
            }

            var self = this;
            var $spinner = $form.find('.comment-submit-spinner');

            var commentJSON = this.getCommentFormJSON($form);
            var isEdit = commentJSON.id != null;
            var isKnown = isEdit && this.collection.get(commentJSON.id);
            var parentId = commentJSON.parent && commentJSON.parent.id;
            var comment = isKnown ? this.collection.get(commentJSON.id) : new _commentModel2.default();

            comment.on('invalid', this.showErrorMessage, $form);
            if (comment.set(_jquery2.default.extend(commentJSON, {
                avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                    size: 'medium'
                })
            }), { validate: true })) {
                if (!isKnown) {
                    this.collection.push(comment);
                }
                // need to override the positioning - spin.js can't handle the absolute positioning of the container.
                $form.addClass('submitting');
                $spinner.spin('medium');
                _form2.default.preventSubmission($form);
                comment.save().done(function (commentResp) {
                    // hack to avoid "future" comments
                    commentResp.createdDate = Math.min(commentResp.createdDate, new Date().getTime());
                    commentResp.updatedDate = Math.min(commentResp.updatedDate, new Date().getTime());

                    self.closeCommentForm($form, { doNotDestroy: true });
                    self.renderComment(commentResp, parentId, isEdit);
                    self.trigger('comment.saved');
                }).fail(function () {
                    if (!isKnown && !isEdit) {
                        // it was a totally new comment. remove it from our models.
                        self.collection.remove(commentJSON.id);
                    }
                }).always(function () {
                    $spinner.spinStop();
                    $form.removeClass('submitting');
                    _form2.default.allowSubmission($form);
                });
            }
            comment.off('invalid', this.showErrorMessage);
        },
        deleteComment: function deleteComment($comment) {
            var commentJSON = this.getCommentJSON($comment);
            var comment;
            if (this.collection.get(commentJSON)) {
                comment = this.collection.get(commentJSON.id);
            } else {
                comment = new _commentModel2.default(commentJSON);
                this.collection.push(comment);
            }
            var $delete = $comment.find('> .content .delete');
            var deleteDims = { h: $delete.height(), w: $delete.width() };
            $delete.height(deleteDims.h).width(deleteDims.w).css('vertical-align', 'middle').empty().spin('small');

            var self = this;
            comment.destroy({ wait: true }).always(function () {
                $delete.spinStop();
            }).done(function () {
                $comment.addClass('pending-delete').fadeOut(function () {
                    $comment.trigger('comment-child-removed').remove();
                    self.onCommentDeleted();
                    self.trigger('change');
                    _events2.default.trigger('bitbucket.internal.feature.comments.commentDeleted', null, commentJSON);
                });
            }).fail(function () {
                // revert to Delete
                $delete.css('height', '').css('width', '').css('vertical-align', '').text(_aui2.default.I18n.getText('bitbucket.web.comment.delete'));
            });
        },
        onCommentDeleted: function onCommentDeleted() {
            // Can be overridden
        },
        onCommentEditorResize: _jquery2.default.noop,
        /**
         *
         * @param {jQuery} $comment
         * @returns {jQuery} - The comment form
         */
        openEditForm: function openEditForm($comment) {
            var commentJSON = this.getCommentJSON($comment);
            var $form = (0, _jquery2.default)(bitbucket.internal.feature.commentForm(_jquery2.default.extend({
                tips: this.$el.width() > COMMENT_CONTAINER_MIN_WIDTH ? _commentTips2.default.tips : [],
                currentUser: _pageState2.default.getCurrentUser() && _pageState2.default.getCurrentUser().toJSON()
            }, commentJSON)));
            var $originalContent = $comment.find('> .user-avatar, > .content');
            // detach the original comment from the DOM so that any items added to plugin points
            // on comments will retain any event listeners and data they may have set.
            $originalContent.detach();
            $comment.prepend($form).addClass('comment-form-container');
            $form.data('originalContent', $originalContent);

            this._bindMarkupEditor($form);
            this.focusCommentForm($form);

            this.trigger('change');
            _events2.default.trigger('bitbucket.internal.feature.comments.commentFormShown', null, $form);

            return $form;
        },
        /**
         *
         * @param {jQuery} $replyToComment
         * @returns {jQuery} - The comment form
         */
        openReplyForm: function openReplyForm($replyToComment) {
            var $replies = $replyToComment.children('.replies');
            return this.openCommentForm($replies, { location: 'top' });
        },
        /**
         *
         * @returns {jQuery} - The comment form
         */
        openNewCommentForm: function openNewCommentForm() {
            return this.openCommentForm(this.getRootCommentList(), {
                location: 'bottom'
            });
        },
        /**
         *
         * @param {jQuery} $commentList
         * @param {?Object} options
         * @returns {jQuery} - The comment form
         */
        openCommentForm: function openCommentForm($commentList, options) {
            var attachmentMethod = options && options.location === 'top' ? 'prependTo' : 'appendTo';
            // check if there is a form open that is not an edit form.
            var $formContainer = $commentList.children('.comment-form-container').not('.comment');

            if (!$formContainer.length) {
                $formContainer = (0, _jquery2.default)(bitbucket.internal.feature.commentFormListItem({
                    tips: this.$el.width() > COMMENT_CONTAINER_MIN_WIDTH ? _commentTips2.default.tips : [],
                    currentUser: _pageState2.default.getCurrentUser() && _pageState2.default.getCurrentUser().toJSON()
                }))[attachmentMethod]($commentList);

                //Only bindMarkupEditor to new forms
                this._bindMarkupEditor($formContainer.find('form'));
            }

            var $form = $formContainer.find('form');
            this.focusCommentForm($form);

            this.trigger('change');
            _events2.default.trigger('bitbucket.internal.feature.comments.commentFormShown', null, $form);

            return $form;
        },
        closeCommentForm: function closeCommentForm($form) {
            $form.find('.error').remove(); // clear errors
            this.deleteDraftComment(this.getDraftCommentFromForm($form));
            this._unbindMarkupEditor($form);

            var $originalContent = $form.data('originalContent');
            var $li = $form.parent();

            if ($originalContent) {
                // edits - the form is inside a living comment, so revert back to that comment's content.
                $li.removeClass('comment-form-container');

                $form.replaceWith($originalContent);
            } else {
                // it's a new comment - remove it entirely.
                $li.remove();
            }

            this.trigger('change');
            _events2.default.trigger('bitbucket.internal.feature.comments.commentFormHidden', null, $form);
        },
        /**
         * Focus comment form textarea. Deferred to give the form time to get inserted into the DOM
         */
        focusCommentForm: _function2.default.lazyDefer(function ($form) {
            this.scrollToComment($form);
            $form.find('textarea').focus();
        }),

        /**
         * Scroll a comment into view if it is not already in view.
         *
         * @abstract
         * @param {jQuery} $el - The HTML element of the comment
         */
        scrollToComment: _jquery2.default.noop,

        /**
         * For a given comment form, populate the contents of its textarea with the draft text
         * and set the appropriate attributes which are cleared on the first interaction with the comment
         * @param {jQuery|HTMLElement} form - The comment form
         * @param {Object} draft - The draft to populate from
         */
        populateCommentFormFromDraft: function populateCommentFormFromDraft(form, draft) {
            (0, _jquery2.default)(form).find('textarea').val(draft.text).addClass('restored').attr('title', _aui2.default.I18n.getText('bitbucket.web.comment.restored.draft.title')).trigger('input' //Fake an input to trigger initial sizing of textarea
            ).one('click input', function () {
                (0, _jquery2.default)(this).removeClass('restored').removeAttr('title');
            });
        },
        /**
         * Get the comment element from the DOM with the matching comment ID
         * @param {number} commentId
         * @returns {jQuery}
         */
        getCommentElById: function getCommentElById(commentId) {
            return this.$('.comment[data-id=' + commentId + ']');
        },
        /**
         * Attempt to restore a draft comment and return success or failure
         * @param {Object} draft
         * @returns {boolean} - success
         */
        restoreDraftComment: function restoreDraftComment(draft) {
            var $form;

            if (draft.id) {
                //edit
                var $comment = this.getCommentElById(draft.id);

                if ($comment.length) {
                    if (parseInt(draft.version, 10) < parseInt($comment.attr('data-version'), 10)) {
                        //to avoid overwriting an external modification, discard drafts whose version is older than the current version
                        this.context.deleteDraftComment(draft);
                        return true; //even though we didn't restore it, we don't want it to be kept around
                    }

                    $form = this.openEditForm($comment);
                }
            } else if (draft.parent) {
                //reply
                var $parent = this.getCommentElById(draft.parent.id);

                if ($parent.length) {
                    $form = this.openReplyForm($parent);
                }
            } else {
                //new comment
                $form = this.openNewCommentForm();
            }

            $form && this.populateCommentFormFromDraft($form, draft);

            return !!$form;
        },
        _bindMarkupEditor: function _bindMarkupEditor($form) {
            _markupEditor2.default.bindTo($form).on('resize', this.onCommentEditorResize);
        },
        _unbindMarkupEditor: function _unbindMarkupEditor($form) {
            _markupEditor2.default.unbindFrom($form);
        },
        destroy: function destroy() {
            //for any forms (open comments) inside this container, unbind and destroy the attached MarkupEditor
            this.$('form').each(_function2.default.thisToParam(this._unbindMarkupEditor.bind(this)));
        }
    });
    module.exports = exports['default'];
});