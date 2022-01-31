define('bitbucket/internal/feature/comments/comment-collection', ['module', 'exports', 'backbone', 'bitbucket/internal/feature/comments/comment-model'], function (module, exports, _backbone, _commentModel) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backbone2 = babelHelpers.interopRequireDefault(_backbone);

    var _commentModel2 = babelHelpers.interopRequireDefault(_commentModel);

    exports.default = _backbone2.default.Collection.extend({
        initialize: function initialize(models, options) {
            options = options || {};
            this.urlBuilder = options.urlBuilder || function () {
                return options.anchor.urlBuilder();
            };
        },
        model: _commentModel2.default,
        url: function url() {
            return this.urlBuilder().build();
        }
    });
    module.exports = exports['default'];
});