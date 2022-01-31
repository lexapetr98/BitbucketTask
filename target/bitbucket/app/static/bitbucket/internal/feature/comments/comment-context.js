define('bitbucket/internal/feature/comments/comment-context', ['module', 'exports', 'backbone', 'jquery', 'lodash', 'bitbucket/internal/feature/comments/comment-container', 'bitbucket/internal/util/client-storage', 'bitbucket/internal/util/events'], function (module, exports, _backbone, _jquery, _lodash, _commentContainer, _clientStorage, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backbone2 = babelHelpers.interopRequireDefault(_backbone);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _commentContainer2 = babelHelpers.interopRequireDefault(_commentContainer);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    exports.default = _backbone2.default.View.extend({
        initialize: function initialize() {
            this._containers = {};
            this.checkForNewContainers();

            var self = this;

            _events2.default.on('bitbucket.internal.feature.comments.commentAdded', this._commentAddedHandler = function (commentJson, $comment) {
                if (self.$el.find($comment).length && self.$el.find('.comment').length === 1) {
                    _events2.default.trigger('bitbucket.internal.feature.comments.firstCommentAdded', null, self.$el);
                }
            });

            // Support migration from single draft
            var savedDrafts = this.getDrafts() || [];
            this.unrestoredDrafts = this.drafts = _lodash2.default.isArray(savedDrafts) ? savedDrafts : [savedDrafts];
            this.restoreDrafts();
        },
        includesContainer: function includesContainer(name) {
            return _lodash2.default.has(this._containers, name);
        },
        registerContainer: function registerContainer(containerEl, anchor) {
            var containerId = anchor.getId();
            if (!this.includesContainer(containerId)) {
                this._registerContainer(containerId, containerEl, anchor);
            }
        },
        _registerContainer: function _registerContainer(name, element, anchor) {
            this._containers[name] = new _commentContainer2.default({
                name: name,
                context: this,
                el: element,
                anchor: anchor
            });
            return this._containers[name];
        },
        checkForNewContainers: function checkForNewContainers() {
            var self = this;
            _lodash2.default.forEach(this.findContainerElements(), function (commentContainer) {
                self.registerContainer(commentContainer, self.getAnchor(commentContainer));
            });
        },
        findContainerElements: function findContainerElements() {
            return this.$('.comment-container');
        },
        getAnchor: function getAnchor() /*$commentContainerElement*/{
            return this.options.anchor;
        },
        /**
         * Remove any properties from the draft that make it difficult to do an accurate "sameness" check
         * @param {Object} originalDraft
         * @returns {Object} - The modified draft
         */
        clarifyAmbiguousDraftProps: function clarifyAmbiguousDraftProps(originalDraft) {
            //Comment text is not useful in determining "sameness"
            return _lodash2.default.omit(originalDraft, 'text');
        },
        deleteDraftComment: function deleteDraftComment(draft, persist) {
            persist = _lodash2.default.isBoolean(persist) ? persist : true;

            var isSameDraft = _lodash2.default.isEqual.bind(_lodash2.default, this.clarifyAmbiguousDraftProps(draft));

            //Remove drafts which match the supplied draft (ignoring text)
            this.drafts = _lodash2.default.reject(this.drafts, _lodash2.default.flow(this.clarifyAmbiguousDraftProps.bind(this), isSameDraft));

            if (persist) {
                this.saveDraftComments();
            }
        },
        getDrafts: function getDrafts() {
            return _clientStorage2.default.getSessionItem(this.getDraftsKey());
        },
        getDraftsKey: function getDraftsKey() {
            return _clientStorage2.default.buildKey(['draft-comment', this.options.anchor.getId()], 'user');
        },
        /**
         * @abstract
         */
        restoreDrafts: _jquery2.default.noop,
        saveDraftComment: function saveDraftComment(draft) {
            //Remove any old versions of this comment (don't persist yet)
            this.deleteDraftComment(draft, false);

            //Only add drafts that have content
            draft.text && this.drafts.push(draft);

            this.saveDraftComments();
        },
        saveDraftComments: function saveDraftComments() {
            _clientStorage2.default.setSessionItem(this.getDraftsKey(), this.drafts);
        },
        /**
         * Clean up the comment context
         * We pass in the isFileChangeCleanup when the `container` was not passed in the first time
         * this way we can explicitly only trigger the lastCommentDeleted event when the comment was
         * actually deleted, rather than trigger it as part of the file change cleanup.
         *
         * @param {CommentContext} [container]
         * @param {boolean} isFileChangeCleanup
         */
        destroy: function destroy(container, isFileChangeCleanup) {
            if (container) {
                container.remove();
                delete this._containers[container.options.name];

                if (!this.$el.has('.comment').length && !isFileChangeCleanup) {
                    _events2.default.trigger('bitbucket.internal.feature.comments.lastCommentDeleted', null, this.$el);
                }
            } else {
                isFileChangeCleanup = true;
                _lodash2.default.invokeMap(this._containers, 'destroy', isFileChangeCleanup);
                this._containers = null;

                if (this._commentAddedHandler) {
                    _events2.default.off('bitbucket.internal.feature.comments.commentAdded', this._commentAddedHandler);
                    delete this._commentAddedHandler;
                }
            }
        }
    });
    module.exports = exports['default'];
});