define('bitbucket/internal/widget/setup-tracking', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/client-storage'], function (module, exports, _jquery, _lodash, _clientStorage) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var SESSION_STORE_KEY = 'stash.setup.complete.data';

    /**
     * @typedef {Object} Tracking
     * @property {boolean} isDevMode
     * @property {String} pageId
     * @property {String} serverId
     * @property {String} version
     */

    /**
     * @param {Tracking} tracking
     */
    var setupIframe = function setupIframe(tracking) {
        var iframeHost = tracking.isDevMode ? 'https://qa-wac.internal.atlassian.com' : 'https://www.atlassian.com';
        var iframeContextPath = '/pingback';
        var iframeQueryStringParams = _jquery2.default.param({
            product: 'stash',
            sid: tracking.serverId,
            pg: tracking.pageId,
            v: tracking.version
        });
        var iframeId = 'setup-progress-iframe';
        var $iframe = (0, _jquery2.default)('#' + iframeId);
        var iframeSrc = iframeHost + iframeContextPath + '?' + iframeQueryStringParams;
        if ($iframe.length) {
            $iframe.attr('src', iframeSrc);
        } else {
            // Setup progress iframe tracker
            (0, _jquery2.default)('<iframe>').attr('id', iframeId).css('display', 'none').appendTo('body').attr('src', iframeSrc);
        }
    };

    function clearCompleteTracking() {
        return _clientStorage2.default.removeSessionItem(SESSION_STORE_KEY);
    }

    /**
     * @returns {Tracking} The tracking information that should be used on the setup page, or null if its not in session
     * storage.
     */
    function getCompleteTracking() {
        return _clientStorage2.default.getSessionItem(SESSION_STORE_KEY);
    }

    /**
     * @param {Tracking} currentTracking The tracking page for the current page.
     */
    function storeCompleteTracking(currentTracking) {
        var completeTracking = _lodash2.default.assign({}, currentTracking, {
            pageId: 'setup-complete'
        });
        _clientStorage2.default.setSessionItem(SESSION_STORE_KEY, completeTracking);
    }

    /**
     * Tracks progress through the setup wizard in order to measure drop off
     */
    function track(maybePageId) {
        var $content = (0, _jquery2.default)('#content');
        // ServerId is used to uniquely identify an installation
        var serverId = $content.attr('data-server-id');
        var isDevMode = $content.attr('data-dev-mode-enabled') === 'true';
        var version = _jquery2.default.trim((0, _jquery2.default)('#product-version').text());
        var pageId = maybePageId ? maybePageId : window.location.pathname.replace(/\//g, '_');
        var tracking = {
            isDevMode: isDevMode,
            serverId: serverId,
            pageId: pageId,
            version: version
        };
        storeCompleteTracking(tracking);
        setupIframe(tracking);
    }

    /**
     * Submits a tracking event only if a previous tracking event has been stored in session storage.
     */
    function trackLoginPage() {
        var tracking = getCompleteTracking();
        if (tracking) {
            clearCompleteTracking();
            setupIframe(tracking);
        }
    }

    exports.default = {
        track: track,
        trackLoginPage: trackLoginPage
    };
    module.exports = exports['default'];
});