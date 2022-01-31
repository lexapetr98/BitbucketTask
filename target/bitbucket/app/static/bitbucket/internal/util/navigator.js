define('bitbucket/internal/util/navigator', ['exports', 'bowser'], function (exports, _bowser) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.shortPlatform = exports.isWin = exports.isMac = exports.isLinux = exports.majorVersion = exports.shortBrowser = exports.isOpera = exports.isWebkit = exports.isSafari = exports.isMozilla = exports.isEdge = exports.isIE = exports.isChrome = undefined;

    var _bowser2 = babelHelpers.interopRequireDefault(_bowser);

    var getFirstMatch = function getFirstMatch(map) {
        return (Object.entries(map).find(function (_ref) {
            var _ref2 = babelHelpers.slicedToArray(_ref, 2),
                key = _ref2[0],
                isSet = _ref2[1];

            return isSet;
        }) || [])[0];
    };

    var isChrome = exports.isChrome = function isChrome() {
        return _bowser2.default.chrome || _bowser2.default.chromium;
    };
    var isIE = exports.isIE = function isIE() {
        return _bowser2.default.msie;
    };
    var isEdge = exports.isEdge = function isEdge() {
        return _bowser2.default.msedge;
    };
    var isMozilla = exports.isMozilla = function isMozilla() {
        return _bowser2.default.firefox;
    };
    var isSafari = exports.isSafari = function isSafari() {
        return _bowser2.default.safari;
    };
    var isWebkit = exports.isWebkit = function isWebkit() {
        return _bowser2.default.webkit;
    };
    var isOpera = exports.isOpera = function isOpera() {
        return _bowser2.default.opera;
    };

    var normalisedBrowsers = {
        Chrome: isChrome(),
        Firefox: isMozilla(),
        Edge: isEdge(),
        IE: isIE(),
        Safari: isSafari(),
        Opera: isOpera()
    };

    var shortBrowser = exports.shortBrowser = function shortBrowser() {
        return getFirstMatch(normalisedBrowsers);
    };

    var majorVersion = exports.majorVersion = function majorVersion() {
        return _bowser2.default.version && parseInt(_bowser2.default.version.split('.')[0]);
    };

    var isLinux = exports.isLinux = function isLinux() {
        return _bowser2.default.linux;
    };
    var isMac = exports.isMac = function isMac() {
        return _bowser2.default.mac;
    };
    var isWin = exports.isWin = function isWin() {
        return _bowser2.default.windows;
    };

    var normalisedPlatforms = {
        Win: isWin(),
        Mac: isMac(),
        Linux: isLinux()
    };
    var shortPlatform = exports.shortPlatform = function shortPlatform() {
        return getFirstMatch(normalisedPlatforms);
    };
});