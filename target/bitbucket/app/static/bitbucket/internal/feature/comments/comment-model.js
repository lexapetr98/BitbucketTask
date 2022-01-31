define('bitbucket/internal/feature/comments/comment-model', ['module', 'exports', '@atlassian/aui', 'backbone', 'backbone-brace', 'lodash', 'bitbucket/util/navbuilder'], function (module, exports, _aui, _backbone, _backboneBrace, _lodash, _navbuilder) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _backbone2 = babelHelpers.interopRequireDefault(_backbone);

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var Comment = _backboneBrace2.default.Model.extend({
        namedAttributes: {
            anchor: null,
            // attributes is deprecated for removal in 4.0
            attributes: null,
            author: null,
            avatarSize: null,
            comments: null,
            tasks: null,
            createdDate: 'number',
            html: 'string',
            id: 'number',
            isFocused: 'boolean',
            isUnread: 'boolean',
            parent: null,
            permittedOperations: null,
            properties: null,
            pullRequest: 'object',
            text: 'string',
            updatedDate: 'number',
            version: 'number'
        },
        validate: function validate(attributes) {
            if (!attributes.text || !/\S/.test(attributes.text)) {
                return _aui2.default.I18n.getText('bitbucket.web.comment.empty');
            }
        },
        url: function url() {
            var params = {
                markup: true
            };
            if (this.get('avatarSize') != null) {
                params.avatarSize = this.get('avatarSize');
            }
            if (this.get('version') != null) {
                params.version = this.get('version');
            }
            var anchor = this.get('anchor');
            if (_lodash2.default.get(anchor, 'commitRange.sinceRevision')) {
                // Check since initial commit won't have a since revision
                params.since = anchor.commitRange.sinceRevision.id;
            }

            // special case - comment collections have a urlBuilder
            // so we can use it to form a URL ourselves
            if (this.collection && this.collection.urlBuilder) {
                var builder = this.collection.urlBuilder().withParams(params);
                if (!this.isNew()) {
                    builder = builder.addPathComponents(this.get('id'));
                }
                return builder.build();
            }

            // Otherwise
            // Backbone appends comment id after query params in the base url
            // So we can't add query params via navbuilder. They must be added after.
            var uri = _navbuilder2.default.parse(_backboneBrace2.default.Model.prototype.url.apply(this, arguments));
            Object.keys(params).forEach(function (param) {
                return uri.addQueryParam(param, params[param]);
            });
            return uri.toString();
        },
        forEachCommentInThread: function forEachCommentInThread(fn) {
            fn(this);
            _lodash2.default.forEach(this.get('comments'), function (comment) {
                comment.forEachCommentInThread(fn);
            });
        },
        sync: function sync(method, model, options) {
            return _backbone2.default.sync(method, model, _lodash2.default.assign(options, {
                statusCode: {
                    404: function _(xhr, testStatus, errorThrown, data, fallbackError) {
                        var error = _lodash2.default.get(data, 'errors.0');

                        // TODO - our error handling needs some error codes to avoid this kind of heuristic stuff.
                        if (error && error.message && /comment/i.test(error.message)) {
                            //If replying, show a custom error and allow the user to reload the page
                            if (method === 'create' && model.get('parent') != null) {
                                return {
                                    title: _aui2.default.I18n.getText('bitbucket.web.comment.notfound'),
                                    message: _aui2.default.I18n.getText('bitbucket.web.comment.reply.parent.notfound.message'),
                                    shouldReload: true,
                                    fallbackUrl: undefined
                                };
                            } else if (method === 'update') {
                                return {
                                    title: _aui2.default.I18n.getText('bitbucket.web.comment.notfound'),
                                    message: _aui2.default.I18n.getText('bitbucket.web.comment.update.notfound.message'),
                                    shouldReload: true,
                                    fallbackUrl: undefined
                                };
                            }
                        }
                    }
                }
            }));
        }
    });

    // We have to add the type checking after Comment is already created so we can type-check against the Comment class.
    _backboneBrace2.default.Mixins.applyMixin(Comment, {
        namedAttributes: {
            comments: [Comment]
        }
    });

    exports.default = Comment;
    module.exports = exports['default'];
});