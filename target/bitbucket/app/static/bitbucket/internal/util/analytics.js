define('bitbucket/internal/util/analytics', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/util/navigator'], function (module, exports, _aui, _jquery, _lodash, _navigator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var EVENT_PREFIX = 'stash.client.';

    /**
     * Add browser/platform/resolution demographic info to the analytics data
     * @param {object} data
     * @returns {object}
     */
    function _mixinDemographics(data) {
        var demographics = {
            d_platform: (0, _navigator.shortPlatform)(),
            d_browser: (0, _navigator.shortBrowser)(),
            d_version: (0, _navigator.majorVersion)(),
            d_windowHeight: window.innerHeight,
            d_windowWidth: window.innerWidth,
            d_screenHeight: screen.height,
            d_screenWidth: screen.width
        };

        return _jquery2.default.extend({}, data, demographics);
    }

    /**
     * Record an analytics event
     * @param {string} eventName
     * @param {object} data - A simple, unnested object with the event attributes
     * @param {boolean?} trackDemographics
     */
    function add(eventName, data, trackDemographics) {
        if (eventName) {
            if (data != null && !_jquery2.default.isPlainObject(data)) {
                throw new Error('Analytics only supports plain objects');
            }

            if (!(0, _lodash.startsWith)(eventName, EVENT_PREFIX)) {
                eventName = EVENT_PREFIX + eventName;
            }

            if (trackDemographics) {
                data = _mixinDemographics(data);
            }

            var payload = _jquery2.default.extend({
                name: eventName
            }, {
                data: data
            });

            _aui2.default.trigger('analytics', payload);
        }
    }

    exports.default = {
        add: add,
        _mixinDemographics: _mixinDemographics
    };
    module.exports = exports['default'];
});