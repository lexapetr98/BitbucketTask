define('bitbucket/internal/util/dirty-tracker', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash'], function (module, exports, _aui, _jquery, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    /*
        Tracks whether a form field has been modified by the user directly and sets the `data-dirty` attribute on the element.
    
        dirtyTracker.track can be called with either a collection of elements or with a selector and/or container for live event binding.
        dirtyTracker.track can be called without params and will default to live event binding for input and textarea fields on the document body.
    
        dirtyTracker.untrack will remove either the direct or live event binding. It needs to be passed the same parameters as the original `track` call.
     */

    var dirtyEvents = 'change input keypress keydown cut paste'; //Pokemon!
    var defaultContainer = document.body;
    var defaultSelector = 'input, textarea';

    function dirtyHandler(e, opts) {
        var nonPrintingChangeKeys = [_aui2.default.keyCode.BACKSPACE, _aui2.default.keyCode.DELETE];

        if (opts && opts.synthetic) {
            //this was a synthetic event that shouldn't influence the dirty state
            return;
        }

        if (!(0, _jquery2.default)(e.target).is('input[type=text], textarea') && e.type !== 'change') {
            //For form fields that aren't text inputs or textareas, only set dirty on the `change` event
            return;
        }

        if (e.type === 'keydown' && !_lodash2.default.includes(nonPrintingChangeKeys, e.keyCode)) {
            //We only want to catch the keydown when the user has deleted text, everything else is handled by the other events
            return;
        }

        (0, _jquery2.default)(this).attr('data-dirty', true).off(dirtyEvents, dirtyHandler); //Unbind from the element directly to handle non-live-event tracking
    }

    function track(opts) {
        opts = opts || {};

        if (opts.elements) {
            //we've got a collection of elements, bind the dirty tracking to them directly.
            (0, _jquery2.default)(opts.elements).on(dirtyEvents, dirtyHandler);
        }

        if (opts.selector || opts.container || !opts.elements) {
            //If there is a selector or container specified, assume we want to do live events augmented by the defaults.
            //Only do fully default live events when no `elements` are supplied
            var $container = (0, _jquery2.default)(opts.container || defaultContainer);
            var selector = opts.selector || defaultSelector;

            selector = _lodash2.default.invokeMap(selector.split(','), 'replace', /\s*$/, ':not([data-dirty])').join(',');

            $container.on(dirtyEvents, selector, dirtyHandler);
        }
    }

    function untrack(opts) {
        opts = opts || {};

        if (opts.elements) {
            //we've got a collection of elements, unbind the dirty tracking from them directly.
            (0, _jquery2.default)(opts.elements).off(dirtyEvents, dirtyHandler);
        }

        if (opts.selector || opts.container || !opts.elements) {
            //If there is a selector or container specified, assume we want to unbind the live events augmented by the defaults.
            //Only unbind the fully default live events when no `elements` are supplied
            var $container = (0, _jquery2.default)(opts.container || defaultContainer);
            var selector = opts.selector || defaultSelector;

            selector = _lodash2.default.map(selector.split(','), function (selectorPart) {
                return selectorPart.replace(/\s+$/, '') + ':not([data-dirty])';
            }).join(',');

            $container.off(dirtyEvents, selector, dirtyHandler);
        }
    }

    exports.default = {
        track: track,
        untrack: untrack
    };
    module.exports = exports['default'];
});