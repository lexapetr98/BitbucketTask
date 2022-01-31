define('bitbucket/internal/util/shortcuts/create-keyboard-shortcuts-handler', ['module', 'exports', 'bitbucket/internal/util/dom-event'], function (module, exports, _domEvent) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var domEvents = babelHelpers.interopRequireWildcard(_domEvent);
    var isAnyModifierPressed = domEvents.isAnyModifierPressed;


    var inputElements = ['input', 'select', 'textarea'];
    var isInputElement = function isInputElement(element) {
        return inputElements.includes(element.tagName.toLowerCase());
    };

    /**
     * Execute handler for first matching key in the keyMap
     *
     * @param {Object.<string, function>} keysMap
     */
    var createKeyboardShortcutsHandler = function createKeyboardShortcutsHandler(keysMap) {
        return function (event) {
            var currentTarget = event.currentTarget,
                target = event.target,
                key = event.key;

            var isEditableElement = isInputElement(target) || target.isContentEditable;

            if (currentTarget !== target && isEditableElement || isAnyModifierPressed(event)) {
                //Ignore events raised from text-receiving elements when using delegated event handling.
                return;
            }

            var handler = keysMap[key];

            if (typeof handler === 'function') {
                event.preventDefault();
                event.stopPropagation();

                handler();
            }
        };
    };

    exports.default = createKeyboardShortcutsHandler;
    module.exports = exports['default'];
});