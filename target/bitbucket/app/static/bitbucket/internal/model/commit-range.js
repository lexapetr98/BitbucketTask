define('bitbucket/internal/model/commit-range', ['module', 'exports', 'backbone-brace', 'bitbucket/internal/model/diff-type', 'bitbucket/internal/model/pull-request', 'bitbucket/internal/model/revision'], function (module, exports, _backboneBrace, _diffType, _pullRequest, _revision) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _diffType2 = babelHelpers.interopRequireDefault(_diffType);

    var _pullRequest2 = babelHelpers.interopRequireDefault(_pullRequest);

    var _revision2 = babelHelpers.interopRequireDefault(_revision);

    var EFFECTIVE = _diffType2.default.EFFECTIVE,
        COMMIT = _diffType2.default.COMMIT,
        RANGE = _diffType2.default.RANGE;

    var ROOT = 'ROOT';

    /**
     * Generate an ID from the pull request or revisions. Brace complains about
     * defining a getId function, so we eagerly calculate this.
     * Should it cause a performance concern at some point, we should take a look at modifying Brace.
     * It's very unlikely that will happen though.
     */
    function getId(commitRange) {
        //Get a string identifier that can be used as a key in a map of CommitRanges
        if (commitRange.getPullRequest()) {
            return commitRange.getPullRequest().getId();
        }

        return commitRange.getUntilRevision().getId() + '_' + (commitRange.getSinceRevision() ? commitRange.getSinceRevision().getId() : ROOT);
    }

    function getDiffType(commitRange) {
        var sinceId = commitRange.getSinceRevision() ? commitRange.getSinceRevision().getId() : ROOT;
        if (commitRange.getPullRequest() && sinceId === commitRange.getPullRequest().getToRef().getLatestCommit()) {
            // This has fucked up levels of raciness. The toRef could change under us at any time.
            return EFFECTIVE;
        }
        var untilParent = commitRange.getUntilRevision().hasParents() && commitRange.getUntilRevision().getParents()[0];
        var untilParentId = untilParent ? untilParent.getId() : ROOT;
        return untilParentId === sinceId ? COMMIT : RANGE;
    }

    exports.default = _backboneBrace2.default.Model.extend({
        namedAttributes: {
            diffType: 'string',
            pullRequest: _pullRequest2.default,
            untilRevision: _revision2.default,
            sinceRevision: _revision2.default
        },
        initialize: function initialize() {
            if (!this.getUntilRevision()) {
                if (this.getPullRequest()) {
                    //fromRef => the Ref for the FROM/source branch of the pull request (the "newer" end)
                    var fromRef = this.getPullRequest().getFromRef();
                    this.setUntilRevision(fromRef && new _revision2.default({
                        id: fromRef.getLatestCommit()
                    }));

                    //toRef => the Ref for the TO/target branch of the pull request (the "older" end)
                    var toRef = this.getPullRequest().getToRef();
                    this.setSinceRevision(toRef && new _revision2.default({
                        id: toRef.getLatestCommit()
                    }));
                } else {
                    throw new Error('Commits range requires either a pull request or revision(s)');
                }
            }

            if (this.getSinceRevision() && this.getSinceRevision().getId() === ROOT) {
                this.setSinceRevision(undefined);
            }

            this.setId(getId(this));

            if (!this.getDiffType()) {
                this.setDiffType(getDiffType(this));
            }
        }
    });
    module.exports = exports['default'];
});