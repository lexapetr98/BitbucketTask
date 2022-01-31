define('bitbucket/internal/util/feature-loader', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'require', 'bitbucket/internal/util/events'], function (module, exports, _aui, _jquery, _lodash, _require2, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _require3 = babelHelpers.interopRequireDefault(_require2);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    /**
     * Checks that the shape of module fits the interface we expect.
     * @param module {Object} An object to be verified
     * @param handlerName {String} The name of the module's linked handler, for use in error messages.
     */
    function ensureValidModule(module, handlerName) {
        if (typeof module.load !== 'function' || typeof module.unload !== 'function') {
            throw new Error('Modules require both a load and unload callback. Please use:\n' + registerExample(handlerName));
        }
    }

    /**
     * Return an example usage of loader.
     * @param handlerName {String} the example seciton name to use.
     * @return {String} example text
     */
    function registerExample(handlerName) {
        return "FeatureLoader.registerHandler('" + handlerName + "', /urlMatcher/, {\n" + '    load : loadFn,\n' + '    unload : unloadFn,\n' + "    keyboardShortcutContexts : [ 'commit', ... ]" + '});';
    }

    /**
     * A class for loading handlers of the page from different AMD modules.
     * @constructor
     */
    function FeatureLoader(options) {
        if (!(this instanceof FeatureLoader)) {
            return new FeatureLoader(options);
        }

        options = _jquery2.default.extend({}, FeatureLoader.defaults, options);

        var currentUrl = window.location.href;
        var currentHandlers = [];
        var handlerData = {};

        var loadingPromise = _jquery2.default.Deferred().resolve();
        var hasPending;
        var inited = false;

        var el;
        var keyboardShortcuts;

        var context = {};

        function setElement(newEl) {
            el = newEl;
        }

        function setContext(newContext) {
            context = babelHelpers.extends({}, context, newContext);
        }

        function setKeyboardShortcuts(newKeyboardShortcuts) {
            keyboardShortcuts = newKeyboardShortcuts;
        }

        function registerHandler(handlerName, urlRegex, moduleOrModuleName) {
            var handler;

            if (_lodash2.default.has(handlerData, handlerName)) {
                throw new Error("A handler with the name '" + handlerName + "' already exists.");
            }
            if (!moduleOrModuleName) {
                throw new Error('No module or module name was provided. Please use:\n' + registerExample(handlerName));
            }

            if (typeof moduleOrModuleName === 'string') {
                handler = handlerData[handlerName] = {
                    name: handlerName,
                    urlRegex: urlRegex,
                    moduleName: moduleOrModuleName
                };
            } else {
                ensureValidModule(moduleOrModuleName, handlerName);

                handler = handlerData[handlerName] = {
                    name: handlerName,
                    urlRegex: urlRegex,
                    module: moduleOrModuleName
                };
            }

            // if it should be currently loaded and the current stuff isn't about to be unloaded,
            // load it immediately.
            if (inited && !hasPending && _lodash2.default.includes(getHandlersForUrl(window.location.href), handler)) {
                load(handler);
            }

            return this;
        }

        function unload(handler) {
            if (!_lodash2.default.includes(currentHandlers, handler)) {
                return _jquery2.default.Deferred().resolve();
            }

            var maybePromise = handler.module.unload(el);
            currentHandlers = _lodash2.default.without(currentHandlers, handler);

            function afterUnload() {
                _events2.default.trigger(options.unloadedEvent, null, handler);
            }

            if (maybePromise && maybePromise.then) {
                return maybePromise.then(afterUnload);
            }
            afterUnload();
            return _jquery2.default.Deferred().resolve();
        }

        /**
         * Loads a module. Will first unload the current module if there is one.
         * @param handlerName {String} name of the handler to load.
         * @return {$.Deferred.promise}
         */
        function load(handler) {
            if (_lodash2.default.includes(currentHandlers, handler)) {
                return _jquery2.default.Deferred().resolve();
            }

            if (!handler.module) {
                handler.module = (0, _require3.default)(handler.moduleName);
                ensureValidModule(handler.module, handler.name);
            }

            var maybePromise = handler.module.load(el, context);
            currentHandlers.push(handler);

            function afterLoad() {
                _events2.default.trigger(options.loadedEvent, null, handler);
            }

            if (maybePromise && maybePromise.then) {
                return maybePromise.then(afterLoad);
            }
            afterLoad();
            return _jquery2.default.Deferred().resolve();
        }

        /**
         * Accept a request to load new content. The url/handler may never actually be loaded (newer requests will
         * supercede it if they come in).
         * Fallback to reloading the page if the requested url isn't associated with a handler.
         */
        function loadForCurrentUrl() {
            if (inited && currentUrl === window.location.href) {
                return;
            }
            currentUrl = window.location.href;
            var handlers = getHandlersForUrl(currentUrl);
            if (handlers.length) {
                _lodash2.default.forEach(handlers, function (handler) {
                    _events2.default.trigger(options.requestedEvent, null, handler.name);
                });

                if (!hasPending) {
                    hasPending = true;
                    loadingPromise.then(onReadyForRequest);
                }
            } else if (!inited) {
                // This is loading the initial URL.
                // We don't want to get into an infinite reload loop, so just send an error event to whoever is in charge of this loader.
                _events2.default.trigger(options.errorEvent, null, {
                    message: _aui2.default.I18n.getText('bitbucket.web.featureloader.nohandler'),
                    code: FeatureLoader.NO_HANDLER
                });
            } else {
                window.location.reload();
            }
        }

        /**
         * Executed when we are ready to load a pending module.
         *
         * Load a new handler's content. Fire pushState if a new url is provided.
         */
        function onReadyForRequest() {
            hasPending = false;

            var nextHandlers = getHandlersForUrl(window.location.href);

            var newHandlers = _lodash2.default.difference(nextHandlers, currentHandlers);
            var oldHandlers = _lodash2.default.difference(currentHandlers, nextHandlers);

            var handlersChanged = newHandlers.length || oldHandlers.length;

            if (handlersChanged) {
                var unloadAll = function unloadAll() {
                    if (!currentHandlers.length) {
                        // this page has no handlers, which is a bit of an error case. Empty the element for now.
                        (0, _jquery2.default)(el).empty();
                        return _jquery2.default.Deferred().resolve();
                    }
                    return _jquery2.default.when.apply(_jquery2.default, _lodash2.default.map(oldHandlers, unload));
                };
                var loadAll = function loadAll() {
                    return _jquery2.default.when.apply(_jquery2.default, _lodash2.default.map(newHandlers, load));
                };
                var unloadThenLoadAll = function unloadThenLoadAll() {
                    return unloadAll().then(loadAll);
                };

                loadingPromise = unloadThenLoadAll().then(function () {
                    // per-context disabling needs to be implemented in the plugin...FUUUUUUUU
                    // https://studio.atlassian.com/browse/AKS-14
                    // disable everything and reenable active contexts for now.
                    if (keyboardShortcuts) {
                        keyboardShortcuts.resetContexts();
                    }
                });
            }
        }

        function getHandlersForUrl(url) {
            return _lodash2.default.filter(handlerData, function (handler) {
                return handler.urlRegex && handler.urlRegex.test(url);
            });
        }

        function current() {
            return currentHandlers.slice();
        }

        function changeStateHandler() {
            loadForCurrentUrl();
        }

        function getKeyboardContextsForHandler(handler) {
            return handler.module && handler.module.keyboardShortcutContexts || [];
        }
        function keyboardShortcutHandler(keyboardShortcuts) {
            var contexts = _lodash2.default.chain(currentHandlers).flatMap(getKeyboardContextsForHandler).uniq().value();

            _lodash2.default.forEach(contexts, function (context) {
                keyboardShortcuts.enableContext(context);
            });
        }

        function init(el) {
            setElement(el);

            loadForCurrentUrl();
            _events2.default.on('bitbucket.internal.history.changestate', changeStateHandler);
            _events2.default.on('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', keyboardShortcutHandler);

            inited = true;
        }

        function destroy() {
            _events2.default.off('bitbucket.internal.history.changestate', changeStateHandler);
            _events2.default.off('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', keyboardShortcutHandler);
        }

        this.registerHandler = registerHandler;
        this.setElement = setElement;
        this.setContext = setContext;
        this.setKeyboardShortcuts = setKeyboardShortcuts;
        this.current = current;
        this.init = init;
        this.destroy = destroy;
        return this; // stop IDEA complaining about inconsistent return points
    }

    FeatureLoader.defaults = {
        unloadedEvent: 'stash.util.feature-loader.unloaded',
        loadedEvent: 'stash.util.feature-loader.loaded',
        requestedEvent: 'stash.util.feature-loader.loadRequested',
        errorEvent: 'stash.util.feature-loader.errorOccurred'
    };

    FeatureLoader.NO_HANDLER = 'NO_HANDLER';

    exports.default = FeatureLoader;
    module.exports = exports['default'];
});