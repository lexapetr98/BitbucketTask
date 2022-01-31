define('bitbucket/internal/util/feature-detect', ['module', 'exports', 'lib/react/anim-event-name', 'lodash'], function (module, exports, _animEventName, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _animEventName2 = babelHelpers.interopRequireDefault(_animEventName);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var vendors = ['ms', 'moz', 'webkit', 'o'];

    function prefixed(prop) {
        var capped = prop.charAt(0).toUpperCase() + prop.substring(1);
        return [prop].concat(_lodash2.default.map(vendors, function (prefix) {
            return prefix + capped;
        }));
    }

    /**
     * Does this browser support localStorage?
     * @function
     */
    var supportsLocalStorage = _lodash2.default.once(function () {
        try {
            window.localStorage.setItem('___stash_test', 'true');
            window.localStorage.removeItem('___stash_test');
            return true;
        } catch (e) {
            console && console.log('Note: localStorage not supported in this browser.');
            return false;
        }
    });

    /**
     * Does this browser support the FileReader API?
     * @function
     */
    var supportsFileReader = _lodash2.default.once(function () {
        return !!(window.File && window.FileList && window.FileReader);
    });

    /**
     * Does this browser support FormData and XHR2?
     * @function
     */
    var supportsFormData = _lodash2.default.once(function () {
        return !!window.FormData;
    });

    /**
     * Does this browser return captured groups when calling String.prototype.split with a RegExp.
     * @function
     */
    var supportsSplitCapture = _lodash2.default.once(function () {
        return 'a1a'.split(/(\d)/).length === 3; //Non-supporting browsers will have length === 2
    });

    /**
     * Does this browser support css transforms?
     * @function
     */
    var supportsTransforms = _lodash2.default.once(function () {
        return _lodash2.default.find(prefixed('transform'), function (prop) {
            return document.body.style[prop] !== undefined;
        });
    });

    /**
     * Does this browser support css transitions?
     * @function
     */
    var supportsTransitions = _lodash2.default.once(function () {
        return _lodash2.default.find(prefixed('transition'), function (prop) {
            return document.body.style[prop] !== undefined;
        });
    });

    /**
     * Does this browser support modifying an element's classes via classList?
     * @function
     */
    var supportsClasslist = _lodash2.default.once(function () {
        return 'classList' in document.documentElement;
    });

    /**
     * Does this browser support CSS animations
     * @function
     */
    var supportsAnimations = _lodash2.default.once(function () {
        return _lodash2.default.find(prefixed('animationName'), function (prop) {
            return document.documentElement.style[prop] !== undefined;
        });
    });

    /**
     * Tests whose outcome will be used by CSS not JS, so the result will be reflected in classes on the html element.
     * Should be defined in the form {className: function test(){}}
     */
    var cssTests = {
        'pointer-events': function pointerEvents() {
            var element = document.createElement('x');
            element.style.cssText = 'pointer-events:auto';
            return element.style.pointerEvents === 'auto';
        },
        'no-cssanimations': function noCssanimations() {
            return !supportsAnimations();
        }
    };

    /**
     * Does this browser support Web Real-Time Communication (WebRTC) and provide access to the system's media devices
     */
    var supportsUserMedia = _lodash2.default.once(function () {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    });

    /**
     * Does this browser support HTML5 video elements
     */
    var supportsVideo = _lodash2.default.once(function () {
        return !!document.createElement('video').canPlayType;
    });

    /**
     * Iterate through all the cssTests and add classes to the html element for any that pass
     */
    (function runCssTests(tests) {
        var docEl = document.documentElement;

        _lodash2.default.forEach(tests, function (test, className) {
            //I'm loathe to add a jQuery dependency just for adding a class. ClassList supported in IE10+
            test() && (supportsClasslist() ? docEl.classList.add(className) : docEl.className += ' ' + className);
        });
    })(cssTests);

    exports.default = {
        localStorage: supportsLocalStorage,
        fileReader: supportsFileReader,
        formData: supportsFormData,
        splitCapture: supportsSplitCapture,
        cssAnimation: supportsAnimations,
        cssTransform: supportsTransforms,
        cssTransition: supportsTransitions,
        getUserMedia: supportsUserMedia,
        video: supportsVideo,
        transitionEndEventName: _lodash2.default.once(_animEventName2.default.transitionEndEventName),
        animationEndEventName: _lodash2.default.once(_animEventName2.default.animationEndEventName)
    };
    module.exports = exports['default'];
});