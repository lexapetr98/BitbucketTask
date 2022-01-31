define('bitbucket/internal/feature/comments/anchors', ['module', 'exports', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/page-state'], function (module, exports, _jquery, _navbuilder, _pageState) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    /**
     * Details for anchoring to a pull-requests general comments
     * @param {Object} [pullRequestInfo]
     * @param {string} [pullRequestInfo.projectKey]
     * @param {string} [pullRequestInfo.repoSlug]
     * @param {number} [pullRequestInfo.pullRequestId]
     * @api public
     * @constructor
     */
    function PullRequestAnchor(pullRequest) {
        this._pullRequest = pullRequest ? pullRequest.toJSON() : _pageState2.default.getPullRequest().toJSON();
        this._projectKey = this._pullRequest.toRef.repository.project.key;
        this._repoSlug = this._pullRequest.toRef.repository.slug;
        this._pullRequestId = this._pullRequest.id;
    }
    PullRequestAnchor.prototype.getPullRequest = function () {
        return this._pullRequest;
    };
    PullRequestAnchor.prototype.getId = function () {
        return 'pullrequest-' + this._projectKey + '-' + this._repoSlug + '-' + this._pullRequestId;
    };
    PullRequestAnchor.prototype.toJSON = function () {
        // the server doesn't want any anchor info. It NPE's if we provide it.
        return undefined;
    };
    PullRequestAnchor.prototype.urlBuilder = function () {
        return _navbuilder2.default.rest().project(this._projectKey).repo(this._repoSlug).pullRequest(this._pullRequestId).comments();
    };

    /**
     * Details for anchoring to a diff
     * @param {FileChange} fileChange - a change object for this diff.
     * @param {Repository} repo - a repository object
     * @api public
     * @constructor
     */
    function DiffAnchor(fileChange) {
        this._path = fileChange.getPath();
        this._srcPath = fileChange.getSrcPath();
        this._commitRange = fileChange.getCommitRange();
        this._projectKey = (fileChange.getRepository() || _pageState2.default).getProject().getKey();
        this._repoSlug = (fileChange || _pageState2.default).getRepository().getSlug();
    }
    DiffAnchor.prototype.getPullRequest = function () {
        return this._commitRange.getPullRequest() && this._commitRange.getPullRequest().toJSON();
    };
    DiffAnchor.prototype.getId = function () {
        return 'diff-' + this._projectKey + '-' + this._repoSlug + '-' + this._commitRange.getId() + '-' + this._path;
    };
    DiffAnchor.prototype.toJSON = function () {
        var json = {
            path: this._path.toString(),
            diffType: this._commitRange.getDiffType()
        };
        // TODO - if/when we start putting accurate hashes in our effective diff commitRanges, we can just always add these props.
        // NOTE: That would break Effective Diff draft restoration - the draft would be anchored to a specific diff
        if (this._commitRange.getDiffType() !== 'EFFECTIVE') {
            json.fromHash = this._commitRange.getSinceRevision() && this._commitRange.getSinceRevision().getId();
            json.toHash = this._commitRange.getUntilRevision().getId();
        }
        var srcPath = this._srcPath && this._srcPath.toString();
        if (srcPath) {
            // backend can't handle an empty srcPath.
            json.srcPath = srcPath;
        }
        return json;
    };
    DiffAnchor.prototype.urlBuilder = function () {
        var navRepo = _navbuilder2.default.rest().project(this._projectKey).repo(this._repoSlug);

        var pullRequest = this._commitRange.getPullRequest();
        if (pullRequest) {
            return navRepo.pullRequest(pullRequest.getId()).comments();
        }

        return navRepo.commit(this._commitRange.getUntilRevision().getId()).comments();
    };

    /**
     * Details for anchoring to a specific line in a diff
     * @param {DiffAnchor} diffAnchor - parent diff anchor
     * @param {string} lineType       - line type - 'ADDED', 'REMOVED', 'CONTEXT'
     * @param {number} lineNumber     - source line number for 'REMOVED' or 'CONTEXT', destination line number for 'ADDED'
     * @param {string} [fileType]     - Refers to whether the anchor is on the source file or the destination file in a diff
     *                                  Relevant to side-by-side diffs where typical value would be 'FROM' or 'TO'.
     * @api private
     * @constructor
     */
    function LineAnchor(diffAnchor, lineType, lineNumber, fileType) {
        this._diffAnchor = diffAnchor;
        this._lineType = lineType;
        this._line = lineNumber;
        this._fileType = fileType;
    }
    LineAnchor.prototype.getPullRequest = function () {
        return this._diffAnchor.getPullRequest();
    };
    LineAnchor.prototype.getId = function () {
        var fileType = this._fileType ? this._fileType + '-' : '';
        return 'line-' + this._diffAnchor.getId() + '-' + fileType + this._lineType + '-' + this._line;
    };
    LineAnchor.prototype.toJSON = function () {
        var json = _jquery2.default.extend(this._diffAnchor.toJSON(), {
            line: this._line,
            lineType: this._lineType
        });

        if (this._fileType) {
            json.fileType = this._fileType;
        }

        return json;
    };
    LineAnchor.prototype.urlBuilder = function () {
        return this._diffAnchor.urlBuilder();
    };

    exports.default = {
        PullRequestAnchor: PullRequestAnchor,
        DiffAnchor: DiffAnchor,
        LineAnchor: LineAnchor
    };
    module.exports = exports['default'];
});