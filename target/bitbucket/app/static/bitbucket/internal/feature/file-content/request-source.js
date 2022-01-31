define('bitbucket/internal/feature/file-content/request-source', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/property'], function (module, exports, _jquery, _lodash, _navbuilder, _ajax, _property) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _property2 = babelHelpers.interopRequireDefault(_property);

    var maxSourceLines = 5000;
    _property2.default.getFromProvider('page.max.source.lines').done(function (val) {
        maxSourceLines = val;
    });

    // See notes on requestSource. We cache to avoid multiple server requests for the same information by different handlers,
    // and also so source=handler and source-view can both request the first page without a full AJAX request twice.
    var cache = {};

    /**
     * A builder to generate the source URL.
     *
     * @param {JSON.FileChangeJSON} fileChangeJSON a fileChange object describing the change
     * @param {Object} [options] - additional options
     * @param {number} [options.start]
     * @param {number} [options.limit]
     * @param {boolean} [options.includeBlame]
     * @returns {string} a source URL
     * @private
     */
    function getSourceUrl(fileChangeJSON, options) {
        //$.extend to remove undefined properties
        var params = _jquery2.default.extend({}, {
            start: options.start || 0,
            limit: options.limit || maxSourceLines,
            blame: options.includeBlame ? true : undefined
        });

        return _navbuilder2.default.rest().currentRepo().browse().path(fileChangeJSON.path).at(fileChangeJSON.commitRange.untilRevision.displayId).withParams(params).build();
    }

    /**
     * Request diff information from the server. Requests are cached for the remainder of an event loop after they are resolved.
     * This helps with performance of multiple handlers requesting the same data.
     *
     * @param {JSON.FileChangeJSON} fileChange - a fileChange object describing the change
     * @param {Object} [options] - additional options
     * @param {number} [options.start]
     * @param {number} [options.limit]
     * @param {boolean} [options.includeBlame]
     * @param {Object} [options.statusCode]
     * @returns {Promise} a promise that resolves to the diff JSON returned form the server.
     */
    function requestSource(fileChange, options) {
        options = options || {};

        var fileChangeJSON = fileChange.toJSON ? fileChange.toJSON() : fileChange;
        var url = getSourceUrl(fileChangeJSON, options);

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

            _lodash2.default.defer(function () {
                delete cache[url];
            });
            return data;
        });

        cache[url] = piped.promise(xhr);
        return cache[url];
    }

    exports.default = requestSource;
    module.exports = exports['default'];
});