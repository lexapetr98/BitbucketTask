define('bitbucket/internal/feature/readme/common/readme-common', ['exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/text'], function (exports, _jquery, _lodash, _navbuilder, _pageState, _text) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.onReady = exports.DATA = exports.updateLinks = exports.createUrl = undefined;

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _text2 = babelHelpers.interopRequireDefault(_text);

    var DATA = _jquery2.default.Deferred();

    /**
     * Correctly append a query parameter, either with '?' or '&' depending on the url.
     *
     * Ideally we would use jsuri but it plays silly buggers with paths without an folders
     *
     * @param {string} url - url to append parameters to
     * @param {string} key - the query parameter name
     * @param {string} value - the query parameter value
     * @returns {string} new url containing the additional query parameter
     */
    var appendQueryParam = function appendQueryParam(url, key, value) {
        var fragment = '';
        var fragmentIndex = url.indexOf('#');
        if (fragmentIndex !== -1) {
            fragment = url.substr(fragmentIndex);
            url = url.substr(0, fragmentIndex);
        }
        return url + ((0, _lodash.includes)(url, '?') ? '&' : '?') + encodeURIComponent(key) + '=' + encodeURIComponent(value) + fragment;
    };

    /**
     * Creates the relevant REST URL for a readme file at given revision.
     * Passes the file contentId purely for browser caching.
     *
     * eg.
     * /markup/latest/projects/PROJECT_1/repos/rep_1/markup/somedir/README.md?at=master
     */
    var createUrl = function createUrl(path, revision, contentId) {
        var params = {
            blob: contentId,
            at: revision,
            markup: true,
            htmlEscape: false,
            hardwrap: false
        };
        return _navbuilder2.default.rest().currentRepo().raw().path(path).withParams(params).build();
    };

    /**
     * Update all of the {@code a} and {@code img} links with '?at=branch' to allow users to stay within the current context.
     * @param {jQuery} $content - element to search for links within
     * @param {string=} dir     - optional parameter for {@link #_appendAtIfRelative}
     * @returns {jQuery} the same {@code $content}
     */
    var updateLinks = function updateLinks($content, dir) {
        var updateAll = function updateAll(tag, attr, process) {
            var refId = _pageState2.default.getRevisionRef().getId();
            $content.find(tag).each(function (i, el) {
                el.setAttribute(attr, _appendAtIfRelative(el.getAttribute(attr), refId, dir, process));
            });
        };

        updateAll('a', 'href');

        // For images always append the 'raw' query parameter to ensure Stash displays it correctly
        updateAll('img', 'src', function (link) {
            return _navbuilder2.default.parse(link).getQueryParamValues('raw').length === 0 ? appendQueryParam(link, 'raw', '') : link;
        });
        return $content;
    };

    /**
     *
     * This method will not append to absolute links, or links that are only a #fragment reference.
     *
     * @param {string} link - URL to update
     * @param {string} at   - current ref
     * @param {string=} dir - optional path, most likely {@code window.location.pathname}
     * @param {Function=} process - optional function to process relative links
     * @returns {string} potentially updated URL
     * @private
     */
    var _appendAtIfRelative = function _appendAtIfRelative(link, at, dir, process) {
        // Don't touch absolute URIs ("mailto:...", "http:...", etc), or #fragment links
        if (link && !_text2.default.isUriAbsolute(link) && !(0, _lodash.startsWith)(link, '#')) {
            // If we're viewing from '/browse' then the relative paths will be wrong
            // Don't append dir if link starts with '/' - should be relative to host
            if (dir && !(0, _lodash.endsWith)(dir, '/') && !(0, _lodash.startsWith)(link, '/')) {
                link = dir + '/' + link;
            }

            // Don't bother searching if we're on the default ref
            if (!_pageState2.default.getRevisionRef().isDefault()) {
                link = appendQueryParam(link, 'at', at);
            }

            link = process ? process(link) : link;
        }
        return link;
    };

    function onReady() {
        _PageDataPlugin.ready('com.atlassian.bitbucket.server.bitbucket-web:markup-extension-provider', 'bitbucket.layout.repository', function (value) {
            return DATA.resolve(value);
        });
    }

    exports.createUrl = createUrl;
    exports.updateLinks = updateLinks;
    exports.DATA = DATA;
    exports.onReady = onReady;
});