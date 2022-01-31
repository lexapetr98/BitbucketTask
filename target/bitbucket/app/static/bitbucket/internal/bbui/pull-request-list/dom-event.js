define('bitbucket/internal/bbui/pull-request-list/dom-event', ['module', 'exports', 'bitbucket/internal/util/navigator'], function (module, exports, _navigator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = openInSameTab;


    /**
     * For a mouse click event, determine whether if it should be handled in the same tab or not.
     *
     * @param {MouseEvent} e a jquery mouse event
     * @returns {Boolean} true if a mouse click event should be handled in the same tab, false otherwise
     */
    function openInSameTab(e) {
        return (!e.which || e.which === 1) && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey && !(0, _navigator.isIE)());
    }
    module.exports = exports['default'];
});