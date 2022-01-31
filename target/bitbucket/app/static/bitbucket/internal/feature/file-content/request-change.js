define('bitbucket/internal/feature/file-content/request-change', ['exports', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/commit-range', 'bitbucket/internal/model/revision', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/cache'], function (exports, _navbuilder, _commitRange, _revision, _ajax, _cache) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getUnreviewedChangesRequest = getUnreviewedChangesRequest;
    exports.getChangesRequestFromUrl = getChangesRequestFromUrl;
    exports.reset = reset;
    exports.invalidateCacheForUrl = invalidateCacheForUrl;

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _commitRange2 = babelHelpers.interopRequireDefault(_commitRange);

    var _revision2 = babelHelpers.interopRequireDefault(_revision);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _cache2 = babelHelpers.interopRequireDefault(_cache);

    var cache = new _cache2.default();

    function getUnreviewedChangesRequest(_ref) {
        var pullRequest = _ref.pullRequest,
            start = _ref.start,
            limit = _ref.limit;

        var prChangesUrlBuilder = _navbuilder2.default.rest().currentRepo().pullRequest(pullRequest).changes().withParams({ start: start, limit: limit });

        var unreviewedChangesUrl = prChangesUrlBuilder.withParams({ changeScope: 'unreviewed' }).build();

        if (cache.has(unreviewedChangesUrl)) {
            return cache.get(unreviewedChangesUrl);
        }

        var xhr = _ajax2.default.rest({
            url: unreviewedChangesUrl,
            statusCode: _ajax2.default.ignore404WithinRepository()
        }).fail(function () {
            cache.clear(unreviewedChangesUrl);
        });

        xhr.done(function (data) {
            // if there are no unreviewed changes, then cache using the URL difftree is going to use to ask for the
            // changes, but only once
            if (data.properties && data.properties.changeScope && data.properties.changeScope === 'ALL') {
                var _cacheUrl = prChangesUrlBuilder.withParams({ pullRequestId: pullRequest.id }).build();
                cache.set(_cacheUrl, xhr, _cache.Persist.ONCE);
            }

            // cache for the commit range regardless of whether we cached "all" changes
            var cacheUrl = _navbuilder2.default.rest().currentRepo().changes(new _commitRange2.default({
                untilRevision: new _revision2.default({ id: data.toHash }),
                sinceRevision: new _revision2.default({ id: data.fromHash })
            })).withParams({ start: start, limit: limit, pullRequestId: pullRequest.id }).build();
            cache.set(cacheUrl, xhr);
        });

        cache.set(unreviewedChangesUrl, xhr);
        return xhr;
    }

    function getChangesRequestFromUrl(url) {
        if (cache.has(url)) {
            return cache.get(url);
        }

        var xhr = _ajax2.default.rest({
            url: url,
            statusCode: _ajax2.default.ignore404WithinRepository()
        }).fail(function () {
            cache.clear(url);
        });
        cache.set(url, xhr);
        return xhr;
    }

    function reset() {
        cache.clear();
    }

    function invalidateCacheForUrl(url) {
        cache.clear(url);
    }

    // for interop with AMD importers
    exports.default = {
        getUnreviewedChangesRequest: getUnreviewedChangesRequest,
        getChangesRequestFromUrl: getChangesRequestFromUrl,
        reset: reset,
        invalidateCacheForUrl: invalidateCacheForUrl
    };
});