define('bitbucket/internal/feature/timezone/onboarding/timezone-onboarding', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/alerts/alerts', 'bitbucket/internal/feature/alerts/constants', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/client-storage', 'bitbucket/internal/util/events', 'bitbucket/internal/util/feature-enabled'], function (module, exports, _aui, _jquery, _navbuilder, _alerts, _constants, _pageState, _ajax, _clientStorage, _events, _featureEnabled) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _featureEnabled2 = babelHelpers.interopRequireDefault(_featureEnabled);

    var OFFSET_STORAGE_KEY = 'bitbucket_known_time_zone_offset';
    var OFFSET_SETTING_KEY = 'USER_BROWSER_TIME_ZONE_OFFSET';

    /**
     * Is time zone onboarding enabled on the server?
     * getFromProvider is essentially synchronous even though there is a promise API,
     * so this should always resolve before the first MarkupAttachments is initialised.
     * If it doesn't, onboarding will default to being disabled.
     */
    var timeZoneOnboardingEnabled;
    _featureEnabled2.default.getFromProvider('user.time.zone.onboarding').done(function (enabled) {
        timeZoneOnboardingEnabled = enabled;
    });

    /**
     * Fires an event for analytics purposes
     *
     * @param {String} name the name of the event to fire
     */
    function analyticsEvent(name) {
        _events2.default.trigger('bitbucket.internal.ui.time.zone.onboarding.' + name);
    }

    /**
     * Event handler which redirects to the user account page.
     * Fires an analytics event and updates the user setting before redirecting.
     */
    function changeTimeZone() {
        analyticsEvent('changed');
        setKnownBrowserOffset();
    }

    function getBrowserOffsetAs(func) {
        return func(new Date().getTimezoneOffset());
    }

    /**
     * @returns {string|null} the known browser offset from local storage
     */
    function getLocalKnownBrowserOffset() {
        var knownBrowserOffset = _clientStorage2.default.getItem(OFFSET_STORAGE_KEY);
        return knownBrowserOffset ? String(knownBrowserOffset) : null;
    }

    /**
     * Will try to read the known offset value from the user settings REST endpoint.
     *
     * @returns {Promise<string>} a promise that resolves with the known browser offset
     */
    function getServerKnownBrowserOffset() {
        var user = _pageState2.default.getCurrentUser();
        if (user) {
            return _ajax2.default.rest({
                url: _navbuilder2.default.rest().users(user.getSlug()).addPathComponents('settings').build(),
                type: 'GET',
                statusCode: {
                    '*': false // We don't ever want to show an error to the user when this fails
                }
            }).then(function (data) {
                var knownOffset = String(data[OFFSET_SETTING_KEY]);
                saveOffset(knownOffset);
                if (knownOffset != null) {
                    return knownOffset;
                }
                return null;
            });
        }

        return _jquery2.default.Deferred().reject().promise();
    }

    function getServerOffsetAs(func) {
        return func((0, _jquery2.default)('#content').attr('data-timezone'));
    }

    /**
     * @param {string} knownBrowserOffset
     * @returns {boolean} true if the user's browser offset is not equal to the current browser offset.
     */
    function knownOffsetHasChanged(knownBrowserOffset) {
        return knownBrowserOffset !== getBrowserOffsetAs(String);
    }

    /**
     * Saves the offset to local storage
     * @param offset
     */
    function saveOffset(offset) {
        _clientStorage2.default.setItem(OFFSET_STORAGE_KEY, offset);
    }

    /**
     * Set the currently reported browser offset as the known offset.
     *
     * @returns {Promise} a promise that completes when the REST request completes (or fails)
     */
    function setKnownBrowserOffset() {
        var data = {};
        data[OFFSET_SETTING_KEY] = getBrowserOffsetAs(String);
        return _ajax2.default.rest({
            url: _navbuilder2.default.rest().users(_pageState2.default.getCurrentUser().getSlug()).addPathComponents('settings').build(),
            type: 'POST',
            data: data,
            statusCode: {
                '*': false // We don't ever want to show an error to the user when this fails
            }
        }).done(function () {
            saveOffset(data[OFFSET_SETTING_KEY]);
        });
    }

    function onReady() {
        if (timeZoneOnboardingEnabled) {
            if (getBrowserOffsetAs(Number) !== getServerOffsetAs(Number)) {
                if (knownOffsetHasChanged(getLocalKnownBrowserOffset())) {
                    return getServerKnownBrowserOffset // Verify the Server agrees we should show the flag
                    ().done(function (knownOffset) {
                        if (knownOffsetHasChanged(knownOffset)) {
                            analyticsEvent('shown');
                            (0, _alerts.add)({
                                title: _aui2.default.I18n.getText('bitbucket.web.timezone.onboarding.title'),
                                description: _aui2.default.I18n.getText('bitbucket.web.timezone.onboarding.mismatch'),
                                closeable: true,
                                closeCallback: function closeCallback() {
                                    analyticsEvent('dismissed');
                                    setKnownBrowserOffset();
                                },
                                anchorText: _aui2.default.I18n.getText('bitbucket.web.timezone.onboarding.change'),
                                anchorLink: _navbuilder2.default.newBuilder('account').build(),
                                anchorCallback: changeTimeZone,
                                type: _constants.AlertType.INFO
                            });
                        }
                    });
                }
            }
        }
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});