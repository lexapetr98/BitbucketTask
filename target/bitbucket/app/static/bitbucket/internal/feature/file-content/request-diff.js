define('bitbucket/internal/feature/file-content/request-diff', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/file-content/diff-view-options', 'bitbucket/internal/model/path', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/deprecation'], function (module, exports, _jquery, _lodash, _navbuilder, _diffViewOptions, _path, _ajax, _deprecation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _diffViewOptions2 = babelHelpers.interopRequireDefault(_diffViewOptions);

    var _path2 = babelHelpers.interopRequireDefault(_path);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _deprecation2 = babelHelpers.interopRequireDefault(_deprecation);

    // See notes on requestDiff. We cache to avoid multiple server requests for the same information by different handlers.
    var cache = {};
    var DEFAULT_CONTEXT_LINES = -1; // a negative value will set the context lines to the system default

    // Data is returned as an array due to the REST resource supporting multiple diffs
    // The first will not necessarily be the one we want. We want the first with the destination
    // set to the selected file. This avoids choosing the wrong diff where a file has been modified
    // and copied in the same commit, for example.
    function getMatchingDiff(fileChangeJSON, data) {
        if (_jquery2.default.isArray(data.diffs) && data.diffs.length) {
            var matchingDiff = _lodash2.default.find(data.diffs, function (diff) {
                if (diff.destination) {
                    return diff.destination.toString === new _path2.default(fileChangeJSON.path).toString();
                } else if (fileChangeJSON.srcPath) {
                    return diff.source.toString === new _path2.default(fileChangeJSON.srcPath).toString();
                }
                return false;
            }) || data.diffs[0]; //Or the first diff if none were found (this shouldn't happen)

            data = _lodash2.default.assign({ diff: matchingDiff }, data, matchingDiff);
            Object.keys(matchingDiff).forEach(function (key) {
                _deprecation2.default.prop(data, key, key, 'diff.' + key, '4.5', '5.0');
            });

            delete data.diffs;
        }
        return data;
    }

    /**
     * A builder to generate the diff URL.
     *
     * @param {JSON.FileChangeJSON} fileChangeJSON a fileChange object describing the change
     * @returns {bitbucket/util/navbuilder.Builder} a builder generating the diff URL
     * @private
     */
    function requestDiffUrlBuilder(fileChangeJSON) {
        var baseUrlBuilder = _navbuilder2.default.rest().project(fileChangeJSON.repository.project.key).repo(fileChangeJSON.repository.slug);

        var pullRequest = fileChangeJSON.commitRange.pullRequest;
        var diffUrlBuilder = pullRequest ? baseUrlBuilder.pullRequest(pullRequest.id) : baseUrlBuilder.commit(fileChangeJSON.commitRange);
        return diffUrlBuilder.diff(fileChangeJSON);
    }

    /**
     * Request diff information from the server. Requests are cached for the remainder of an event loop after they are resolved.
     * This helps with performance of multiple handlers requesting the same data.
     *
     * @param {JSON.FileChangeJSON} fileChange a fileChange object describing the change
     * @param {Object} options additional options
     * @returns {Promise} a promise that resolves to the diff JSON returned form the server.
     */
    function requestDiff(fileChange, options) {
        var fileChangeJSON = fileChange.toJSON ? fileChange.toJSON() : fileChange;
        if (fileChangeJSON.diff) {
            var diff = _jquery2.default.extend({
                lineComments: options.lineComments || [],
                fileComments: options.fileComments || []
            }, fileChangeJSON.diff);

            var data = _jquery2.default.extend({
                diff: diff,
                fromHash: fileChangeJSON.diff.properties && fileChangeJSON.diff.properties.fromHash,
                toHash: fileChangeJSON.diff.properties && fileChangeJSON.diff.properties.toHash
            }, diff);

            Object.keys(diff).forEach(function (key) {
                _deprecation2.default.prop(data, key, key, 'diff.' + key, '4.5', '5.0');
            });

            return _jquery2.default.Deferred().resolve(data);
        }

        options = options || {};
        var diffViewOptions = options.diffViewOptions || _diffViewOptions2.default;
        var ignoreWhitespace = options.hasOwnProperty('ignoreWhitespace') ? options.ignoreWhitespace : diffViewOptions.get('ignoreWhitespace');

        var contextLines = isNaN(Number(options.contextLines)) ? DEFAULT_CONTEXT_LINES : Math.floor(options.contextLines);

        var urlBuilder = (options.diffUrlBuilder || requestDiffUrlBuilder)(fileChangeJSON);
        var url = urlBuilder.withParams({
            avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                size: options.avatarSize || 'medium'
            }),
            markup: true,
            whitespace: ignoreWhitespace ? 'ignore-all' : '',
            contextLines: contextLines,
            withComments: options.withComments,
            autoSrcPath: options.autoSrcPath
        }).build();

        if (cache.hasOwnProperty(url) && cache[url].state() !== 'rejected') {
            return cache[url];
        }

        var xhr = _ajax2.default.rest({
            url: url,
            statusCode: options.statusCode || _ajax2.default.ignore404WithinRepository()
        });

        var piped = xhr.then(function (data) {
            if (data.errors && data.errors.length) {
                return _jquery2.default.Deferred().rejectWith(this, [this, null, null, data]);
            }
            data = getMatchingDiff(fileChangeJSON, data);

            setTimeout(function () {
                delete cache[url];
            });
            return data;
        });

        cache[url] = piped.promise(xhr);
        return cache[url];
    }

    exports.default = requestDiff;
    module.exports = exports['default'];
});