define('bitbucket/internal/feature/comments/activity-comment-context', ['module', 'exports', 'lodash', 'bitbucket/internal/feature/comments/activity-comment-container', 'bitbucket/internal/feature/comments/comment-context', 'bitbucket/internal/util/events'], function (module, exports, _lodash, _activityCommentContainer, _commentContext, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _activityCommentContainer2 = babelHelpers.interopRequireDefault(_activityCommentContainer);

    var _commentContext2 = babelHelpers.interopRequireDefault(_commentContext);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    exports.default = _commentContext2.default.extend({
        findContainerElements: function findContainerElements() {
            return [this.el];
        },
        _registerContainer: function _registerContainer(name, element, anchor) {
            this._containers[name] = new _activityCommentContainer2.default({
                name: name,
                context: this,
                el: element,
                anchor: anchor
            });
            return this._containers[name];
        },
        /**
         * Get the ActivityCommentContainer for this context
         * @returns {ActivityCommentContainer}
         */
        getActivityCommentContainer: function getActivityCommentContainer() {
            return this._containers[this.getAnchor().getId()];
        },
        /**
         * Try and restore all the unrestored drafts, if any can't be restored, try again the next time more activities are loaded
         */
        restoreDrafts: function restoreDrafts() {
            if (this.unrestoredDrafts.length) {
                var activityCommentContainer = this.getActivityCommentContainer();

                //Remove any restored drafts from the list
                this.unrestoredDrafts = _lodash2.default.reject(this.unrestoredDrafts, activityCommentContainer.restoreDraftComment.bind(activityCommentContainer));

                if (this.unrestoredDrafts.length) {
                    //There are still unrestored drafts, they might be attached to the next page of activity
                    _events2.default.once('bitbucket.internal.feature.pullRequestActivity.dataLoaded', this.restoreDrafts.bind(this));
                }
            }
        }
    });
    module.exports = exports['default'];
});