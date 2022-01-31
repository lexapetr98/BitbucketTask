define('bitbucket/internal/feature/comments/activity-comment-container', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/feature/comments/comment-container', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _lodash, _commentContainer, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _commentContainer2 = babelHelpers.interopRequireDefault(_commentContainer);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    exports.default = _commentContainer2.default.extend({
        initialize: function initialize() {
            _commentContainer2.default.prototype.initialize.apply(this, arguments);
        },
        rootCommentListSelector: '.pull-request-activity',
        events: _lodash2.default.assign({}, _commentContainer2.default.prototype.events, {
            'focus .general-comment-form textarea': 'onGeneralFormTextareaFocused'
        }),
        initDeleteButtons: function initDeleteButtons() {
            this.createDeleteDialog().attachTo('.general-comment-activity .delete', null, this.el);
        },
        insertCommentIntoList: function insertCommentIntoList($comment, $commentList, commentJSON) {
            if ($commentList.is(this.rootCommentListSelector)) {
                // TODO: we need to order it along with other activity items.
                // Luckily, until we do activity reloading, we can be assured we're only adding comments at the top.

                var $generalCommentForm = $commentList.children(':first');
                $comment.insertAfter($generalCommentForm);
            } else {
                _commentContainer2.default.prototype.insertCommentIntoList.apply(this, arguments);
            }
        },
        closeCommentForm: function closeCommentForm($form) {
            // don't close the general comment form, just empty it out. Clean up any restored draft attributes
            $form.find('.error').remove(); // clear errors
            if ($form.is('.general-comment-form')) {
                this._unbindMarkupEditor($form);

                $form.addClass('collapsed');
                $form.find('textarea').val('').removeClass('restored').removeAttr('title').blur();

                this.deleteDraftComment(this.getDraftCommentFromForm($form));
            } else {
                _commentContainer2.default.prototype.closeCommentForm.apply(this, arguments);
            }
        },
        getExtraCommentClasses: function getExtraCommentClasses() {
            return 'general-comment-activity';
        },
        onGeneralFormTextareaFocused: function onGeneralFormTextareaFocused(e) {
            var $form = (0, _jquery2.default)(e.target).closest('.general-comment-form');

            if ($form.hasClass('collapsed')) {
                this._bindMarkupEditor($form);
                $form.removeClass('collapsed');
            }
        }
    });
    module.exports = exports['default'];
});