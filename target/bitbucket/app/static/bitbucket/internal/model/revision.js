define('bitbucket/internal/model/revision', ['module', 'exports', 'backbone-brace', 'bitbucket/internal/model/repository', 'bitbucket/internal/model/revision-reference'], function (module, exports, _backboneBrace, _repository, _revisionReference) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _repository2 = babelHelpers.interopRequireDefault(_repository);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    /**
     * Revision is a commit. It should be similar to the server-side
     * "com.atlassian.stash.commit.Commit" class.
     *
     */
    var Revision = _backboneBrace2.default.Model.extend({
        namedAttributes: {
            id: null,
            displayId: null,
            repository: _repository2.default,
            message: null,
            author: null,
            authorTimestamp: null,
            committer: null,
            committerTimestamp: null,
            parents: null,
            properties: null
        },
        hasParents: function hasParents() {
            return this.getParents() && this.getParents().length;
        },
        getRevisionReference: function getRevisionReference() {
            return new _revisionReference2.default({
                id: this.getId(),
                displayId: this.getDisplayId(),
                type: _revisionReference2.default.type.COMMIT,
                repository: this.getRepository(),
                latestCommit: this.getId()
            });
        }
    });

    // We have to add the type checking after Revision is already created so we can type-check against the Revision class.
    _backboneBrace2.default.Mixins.applyMixin(Revision, {
        namedAttributes: {
            parents: [Revision]
        }
    });

    exports.default = Revision;
    module.exports = exports['default'];
});