define('bitbucket/internal/feature/comments/comments', ['module', 'exports', 'jquery', 'bitbucket/internal/feature/comments/activity-comment-context', 'bitbucket/internal/feature/comments/anchors', 'bitbucket/internal/feature/comments/comment-tips', 'bitbucket/internal/feature/comments/diff-comment-context'], function (module, exports, _jquery, _activityCommentContext, _anchors, _commentTips, _diffCommentContext) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _activityCommentContext2 = babelHelpers.interopRequireDefault(_activityCommentContext);

    var _anchors2 = babelHelpers.interopRequireDefault(_anchors);

    var _commentTips2 = babelHelpers.interopRequireDefault(_commentTips);

    var _diffCommentContext2 = babelHelpers.interopRequireDefault(_diffCommentContext);

    var commentMode = {
        CREATE_NEW: 'create-new', // allow top-level commenting, replying, and display all comments
        REPLY_ONLY: 'reply-only', // only allow writing replies, not new top-level comments
        READ: 'read', // show comments, don't allow creating any TODO: Not yet supported anywhere
        NONE: 'none' // don't show any comments or allow commenting
    };

    exports.default = _jquery2.default.extend({
        /**
        * Bind all comments within a $contextEl to a given anchor type (pull request activity or diff)
        * @param $contextEl
        * @param anchor
        */
        bindContext: function bindContext($contextEl, anchor, options) {
            if ($contextEl.data('comment-context')) {
                throw new Error('Duplicate comment context registered.');
            }

            var showComments = options && (options.commentMode === commentMode.READ || options.commentMode === commentMode.CREATE_NEW || options.commentMode === commentMode.REPLY_ONLY);
            var allowCommenting = options && options.commentMode === commentMode.CREATE_NEW;

            options = _jquery2.default.extend({
                el: $contextEl[0],
                anchor: anchor,
                allowCommenting: allowCommenting,
                showComments: showComments
            }, options);

            var context = anchor instanceof _anchors2.default.DiffAnchor ? new _diffCommentContext2.default(options) : new _activityCommentContext2.default(options);
            $contextEl.data('comment-context', context);
            return context;
        },
        updateContext: function updateContext($contextEl) {
            var context = $contextEl.data('comment-context');
            if (context) {
                context.checkForNewContainers();
            }
        },
        unbindContext: function unbindContext($contextEl) {
            var context = $contextEl.data('comment-context');
            if (context) {
                context.destroy();
            }
        },
        commentMode: commentMode
    }, _anchors2.default, _commentTips2.default);
    module.exports = exports['default'];
});