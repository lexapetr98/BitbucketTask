define('bitbucket/internal/widget/keyboard-shortcuts/keyboard-shortcuts', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/util/events', 'bitbucket/internal/util/navigator'], function (module, exports, _aui, _jquery, _lodash, _events, _navigator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var CTRL = /^[cC]trl$/i;
    var CMD = '\u2318'; // Mac `command` key symbol

    var ANALYTICS_EVENT_PREFIX = 'bitbucket.internal.keyboard.shortcuts';
    var enablingContext;

    var _shortcutsByDisplayContext = {};

    function KeyboardShortcuts() {
        if (!(this instanceof KeyboardShortcuts)) {
            return new KeyboardShortcuts();
        }

        this._enabledContexts = [];
    }

    KeyboardShortcuts.prototype._setRegistry = function (registry) {
        this._registry = registry;
    };

    KeyboardShortcuts.prototype._initContent = function () {
        this._dialog = _aui2.default.dialog2(aui.dialog.dialog2({
            titleText: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.header'),
            content: bitbucket.internal.widget.keyboardShortcutsContent({
                contextNames: _lodash2.default.keys(_shortcutsByDisplayContext),
                contexts: _lodash2.default.values(_shortcutsByDisplayContext)
            }),
            size: 'large',
            id: 'keyboard-shortcut-dialog'
        }));
    };

    KeyboardShortcuts.prototype._bind = function ($trigger) {
        this._$trigger = $trigger;
        var self = this;
        this._$trigger.on('click', function (e) {
            e.preventDefault();
            self._show();
        });
    };

    KeyboardShortcuts.prototype.enableContext = function (context) {
        if (_jquery2.default.inArray(context, this._enabledContexts) !== -1) {
            return;
        }
        enablingContext = context;
        this._registry.enableContext(context);
        enablingContext = undefined;
        this._enabledContexts.push(context);
    };

    KeyboardShortcuts.prototype.resetContexts = function () {
        _aui2.default.trigger('remove-bindings.keyboardshortcuts');
        this._enabledContexts = [];
        _aui2.default.trigger('add-bindings.keyboardshortcuts');
    };

    KeyboardShortcuts.prototype._show = function () {
        //If this is the first time shown, init the content
        if (!this._hasShown) {
            this._initContent();
            this._hasShown = true;
        }
        this._dialog.show();
    };

    KeyboardShortcuts.prototype.addCustomShortcut = function (context, keys, description, displayContext) {
        var shortcut = internalizeShortcut({
            keys: keys,
            context: context,
            displayContext: displayContext,
            description: description
        }, { convertOSModifier: false });
    };

    KeyboardShortcuts.convertOSModifier = function (key) {
        return (0, _navigator.isMac)() ? key.replace(CTRL, CMD) : key;
    };

    function internalizeShortcut(shortcut, options) {
        //need to do a copy to avoid messing up the shortcuts for whenIType
        shortcut = _jquery2.default.extend({}, shortcut);
        shortcut.keys = _lodash2.default.map(shortcut.keys, function (option) {
            return _lodash2.default.map(option, function (keypress) {
                if (_lodash2.default.every(['key', 'modifiers'], _lodash2.default.partial(_lodash2.default.has, keypress))) {
                    return keypress;
                }

                //Don't split on '+' when keypress length is 1, in case keypress is '+' only.
                var presses = keypress.length > 1 ? keypress.split('+') : keypress;
                if (!_lodash2.default.isArray(presses) || presses.length === 1) {
                    return keypress;
                }
                return {
                    key: presses.pop(),
                    // default is to convert the modifier
                    modifiers: options && options.convertOSModifier === false ? presses : _lodash2.default.map(presses, KeyboardShortcuts.convertOSModifier)
                };
            });
        });

        if (!shortcut.displayContext) {
            shortcut.displayContext = KeyboardShortcuts._contextDisplayInfo[shortcut.context] ? KeyboardShortcuts._contextDisplayInfo[shortcut.context].displayName : shortcut.context.replace(/\b[a-z]/g, function (str) {
                return str.toUpperCase();
            });
        }

        if (!_shortcutsByDisplayContext[shortcut.displayContext]) {
            _shortcutsByDisplayContext[shortcut.displayContext] = [];
        }
        _shortcutsByDisplayContext[shortcut.displayContext].push(shortcut);
    }

    KeyboardShortcuts.internalizeShortcuts = function (shortcuts) {
        _lodash2.default.forEach(shortcuts, internalizeShortcut);
    };

    KeyboardShortcuts._contextDisplayInfo = {
        repository: {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.repository')
        },
        'branch-compare': {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.branch-compare')
        },
        'branch-list': {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.branch-list')
        },
        commit: {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.commit')
        },
        commits: {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.commits')
        },
        'diff-tree': {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.diff-tree')
        }, //Map this to commit too
        'diff-view': {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.diff-view')
        },
        filebrowser: {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.filebrowser')
        },
        global: {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.global')
        },
        'pull-request': {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.pull-request')
        },
        'pull-request-list': {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.pull-request-list')
        },
        'pull-request-overview': {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.pull-request')
        },
        sourceview: {
            displayName: _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.context.sourceview')
        }
    };

    function fireKeyboardShocutAnalyticsEvent(context, keyEventName) {
        _events2.default.trigger('bitbucket.internal.ui.keyboard.shortcutClicked', null, {
            context: context,
            keyEventName: keyEventName
        });
    }

    var keyboardShortcuts = new KeyboardShortcuts();

    function onReady() {
        // hardcoded keyboard link selector for now

        keyboardShortcuts._bind((0, _jquery2.default)('.keyboard-shortcut-link'));

        var onAfterDocumentReady = _jquery2.default.Deferred();
        (0, _jquery2.default)(document).ready(function () {
            // ensure everyone has had a chance to bind listeners before initializing
            setTimeout(function () {
                onAfterDocumentReady.resolve();
            }, 0);
        });

        _aui2.default.bind('register-contexts.keyboardshortcuts', function (e, data) {
            keyboardShortcuts._setRegistry(data.shortcutRegistry);
            keyboardShortcuts.enableContext('global');

            onAfterDocumentReady.done(function () {
                _events2.default.trigger('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', keyboardShortcuts, keyboardShortcuts);
            });
        });

        _aui2.default.bind('shortcuts-loaded.keyboardshortcuts', function (e, data) {
            KeyboardShortcuts.internalizeShortcuts(data.shortcuts);
        });

        // TODO: load real keyboard shortcuts version.  Updating keyboard shortcuts will cause caching hell currently.
        _aui2.default.params['keyboardshortcut-hash'] = 'bundled';

        _aui2.default.trigger('initialize.keyboardshortcuts');

        // This is ugly but it avoids an uglier circular dependency that would exist if it was moved upto the list of dependencies.
        //
        // pass null as second param to prevent the require from being extracted to the top level AMD module by the babel transform
        require('bitbucket/internal/util/shortcuts', null).bind('keyboardShortcutsDialog', keyboardShortcuts._show.bind(keyboardShortcuts));
    }

    /**
     * Converts 'ctrl+shift+p' to ' Type (Ctrl + Shift + p)' (or the version for Mac)
     * and appends it to $el's title attribute.
     */
    function addTooltip($el, keys) {
        var keysTitle = _lodash2.default.chain(keys).split('+').map(KeyboardShortcuts.convertOSModifier).map(function (key) {
            if (key === 'shift') {
                return _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.key.shift');
            } else if (key === 'ctrl') {
                return KeyboardShortcuts.convertOSModifier(_aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.key.ctrl'));
            }
            return key;
        }).value().join(' + ');
        var oldTitle = $el.attr('title');
        $el.attr('title', oldTitle + _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.type', keysTitle));
        return {
            remove: function remove() {
                $el.attr('title', oldTitle);
            }
        };
    }

    /**
     * Sets up key board shortcut analytics
     *
     * @param {string} keyEventName - The name of the event to setup
     * @param {Bacon} baconStream
     */
    function bindKeyboardShortcutAnalytics(keyEventName, baconStream) {
        baconStream.onValue(fireKeyboardShocutAnalyticsEvent.bind(null, enablingContext, keyEventName));
    }

    /**
     * Gets the context that is currently being enabled.
     *
     * @returns {string} the name of the context being enabled.
     */
    function getEnablingContext() {
        return enablingContext;
    }

    function showDialog() {
        if (keyboardShortcuts) {
            keyboardShortcuts._show();
        }
    }

    function resetContexts() {
        keyboardShortcuts.resetContexts();
    }

    exports.default = {
        onReady: onReady,
        addTooltip: addTooltip,
        bindKeyboardShortcutAnalytics: bindKeyboardShortcutAnalytics,
        getEnablingContext: getEnablingContext,
        showDialog: showDialog,
        resetContexts: resetContexts,
        fireKeyboardShocutAnalyticsEvent: fireKeyboardShocutAnalyticsEvent
    };
    module.exports = exports['default'];
});