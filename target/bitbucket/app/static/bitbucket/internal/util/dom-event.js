define('bitbucket/internal/util/dom-event', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/util/events', 'bitbucket/internal/util/navigator'], function (module, exports, _aui, _jquery, _lodash, _events, _navigator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    /**
     * Returns true if a mouse click event should be handled in the same tab, false otherwise
     * @param e a jquery mouse event
     */
    function openInSameTab(e) {
        return (!e.which || e.which === 1) && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey && !(0, _navigator.isIE)());
    }

    /* Returns true if a mouse click event was caused by a right button click, false otherwise*/
    function isRightClick(e) {
        return e.which === 3;
    }

    /* Return true if the ctrlKey is held down, or metaKey on Mac */
    function isCtrlish(e) {
        return (0, _navigator.isMac)() ? e.metaKey : e.ctrlKey;
    }

    /* Return true if the ctrlKey is held down (or metaKey on Mac) as well as the enter key */
    function isCtrlEnter(e) {
        return isCtrlish(e) && e.which === _aui.keyCode.ENTER;
    }

    /**
     * Linux: any modifier prevents scroll
     * FF: prevent scroll in Win and Mac when ANY modifier is pressed.
     * Chrome : Alt on Windows, Cmd on Mac handle history nav, and Shift on both OSes handles text highlighting.
     * Safari: Alt is history nav in Windows, Ctrl and Cmd both do it on Mac, and Shift only avoids scroll on Mac.
     * IE9: Alt key is history navigation.
     * @param e key event
     */
    function modifiersPreventScroll(e) {
        var result = false;

        if ((0, _navigator.isMozilla)() || (0, _navigator.isLinux)()) {
            result = isAnyModifierPressed(e);
        } else if ((0, _navigator.isChrome)()) {
            result = e.shiftKey || ((0, _navigator.isWin)() ? e.altKey : e.metaKey);
        } else if ((0, _navigator.isSafari)()) {
            result = (0, _navigator.isWin)() ? e.altKey : isAnyModifierPressed(e);
        } else if ((0, _navigator.isEdge)() || (0, _navigator.isIE)()) {
            result = e.altKey;
        }

        // Ensure the result is really a boolean, not just a truthy/falsy value
        return !!result;
    }

    function isAnyModifierPressed(e) {
        return e.altKey || e.shiftKey || e.ctrlKey || e.metaKey;
    }

    /**
     * When enabled, this function will send an event when a user changes their font size.
     */
    var listenForFontSizeChange = _lodash2.default.once(function () {
        var heightTest = (0, _jquery2.default)('<div style="position: fixed; visibility: hidden; speak: none; height: auto; top: -999px; left: -999px;">Ignore this text</div>').appendTo(document.body);
        var heightTestHeight = heightTest.height();
        var _checkHeight;
        var interval = 500;

        setTimeout(_checkHeight = function checkHeight() {
            var newHeight = heightTest.height();
            if (newHeight !== heightTestHeight) {
                heightTestHeight = newHeight;
                _events2.default.trigger('bitbucket.internal.util.events.fontSizeChanged');
            }
            setTimeout(_checkHeight, interval);
        }, interval);
    });

    /**
     * Returns a function which prevents the default action for the event, then calls `func` with the supplied arguments
     * @param {Function} func
     */
    function preventDefault(func) {
        return function (e /*, rest*/) {
            e && _lodash2.default.isFunction(e.preventDefault) && e.preventDefault();

            if (_lodash2.default.isFunction(func)) {
                return func.apply(this, arguments);
            }
        };
    }

    /**
     * Returns a function which stops propagation of the event, then calls `func` with the supplied arguments
     * @param {Function} func
     */
    function stopPropagation(func) {
        return function (e /*, rest*/) {
            e && _lodash2.default.isFunction(e.stopPropagation) && e.stopPropagation();

            if (_lodash2.default.isFunction(func)) {
                return func.apply(this, arguments);
            }
        };
    }

    /**
     * Only call the callback if the event target matches a selector
     * @param {HTMLElement|jQuery|string} target
     * @param {Function} func
     * @returns {Function}
     */
    function filterByTarget(target, func) {
        return function (e /*, rest*/) {
            if ((0, _jquery2.default)(e.target).is(target)) {
                return func.apply(this, arguments);
            }
        };
    }

    exports.default = {
        openInSameTab: openInSameTab,
        isAnyModifierPressed: isAnyModifierPressed,
        isRightClick: isRightClick,
        isCtrlish: isCtrlish,
        isCtrlEnter: isCtrlEnter,
        modifiersPreventScroll: modifiersPreventScroll,
        listenForFontSizeChange: listenForFontSizeChange,
        preventDefault: preventDefault,
        stopPropagation: stopPropagation,
        filterByTarget: filterByTarget
    };
    module.exports = exports['default'];
});