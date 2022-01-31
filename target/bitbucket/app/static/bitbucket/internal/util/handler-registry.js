define('bitbucket/internal/util/handler-registry', ['module', 'exports', 'jquery', 'lodash'], function (module, exports, _jquery, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    /**
     * Callback to handle a specific type of this type of registry, be it file rendering or something else.
     *
     * @callback HandleCallback
     * @memberOf util/handler-registry
     *
     * @param {util/handler-registry.HandleCallbackOptions} options - Options data provided to handle callback.
     * @return {Promise} A promise object which will hopefully be resolved with a per-registry specific object.
     *                   Returning falsey here is the same as a rejected promise.
     */

    /**
     * @typedef {Object}    Handler
     * @memberOf util/handler-registry
     *
     * @property {number}                               [weight=1000] - Weight of handler determining the order it is tried.
     * @property {util/handler-registry.HandleCallback} handle        - Function called to handle file
     */

    /**
     * The properties of this object are purely determined by the API of the specific registry in use.
     *
     * @typedef {Object}    HandleCallbackOptions
     * @memberOf util/handler-registry
     */

    /**
     * An object that can 'register' objects  to 'handle' a single request, using promises to either
     * resolve or reject, which then passes to the next handler in order (determined by a specified weight).
     *
     * This registry may itself need to be namespaced depending on the requirements. For example there might be a single
     * registry for all the file handlers on a given page, or there might be a registry just for image files.
     *
     * @constructor
     */
    /**
     * @example
     * var registry = new require('bitbucket/internal/util/handler-registry');
     *
     * // The consumer determines the options _and_ the expected type of the result
     * registry._handle({type: 'foo'}).done(function(result) {
     *     console.log(result.toUpperCase());
     * });
     *
     * // Register one instance of a handler that conforms to _this_ registry API ('type' on options and returns a string)
     * registry.register({
     *     weight: 200,
     *     handle: function(options) {
     *         return options.type === 'foo' ? "hello" : null;
     *     }
     * });
     *
     * @namespace util/handler-registry
     */
    function HandlerRegistry() {
        // List of handlers in this specific registry
        this.handlers = [];
    }

    /**
     * Registers a {@linkcode Handler} for processing requests to the registry.
     *
     * @param {Handler}     handler - Handler to register.
     * @returns {Function}  A function to unregister the given {@linkcode Handler}.
     */
    HandlerRegistry.prototype.register = function (handler) {
        if (!_lodash2.default.isFunction(handler.handle)) {
            throw new Error('Handler must have a handle function');
        }
        handler.weight = typeof handler.weight === 'number' && !isNaN(handler.weight) ? handler.weight : 1000;

        this.handlers.push(handler);
        this.handlers = _lodash2.default.sortBy(this.handlers, function (handler) {
            return handler.weight;
        });
        var that = this;
        return function unregister() {
            var index = that.handlers.indexOf(handler);
            if (index >= 0) {
                that.handlers.splice(index, 1);
            }
        };
    };

    /**
     * Handles a request by calling registered handlers in order of their weight until the request is handled.
     * @param {HandleCallbackOptions}   options - See parameters passed into {@link HandleCallback}.
     * @returns {Promise}   Resolved with an object or rejected if no handler could be found.
     */
    HandlerRegistry.prototype._handle = function (_ref) {
        var useDefaultHandler = _ref.useDefaultHandler,
            options = babelHelpers.objectWithoutProperties(_ref, ['useDefaultHandler']);

        var deferred = _jquery2.default.Deferred();
        var aborted;
        var currentResult;

        var handlers = useDefaultHandler ? this.handlers.filter(function (handler) {
            return handler.builtIn;
        }) : this.handlers;
        var errors = [];
        function next(depth) {
            if (aborted) {
                return deferred.reject(new Error('Handling aborted.'));
            }
            if (depth < handlers.length) {
                // Falsey is handled as reject
                currentResult = handlers[depth].handle(options) || _jquery2.default.Deferred().reject();
                return _jquery2.default.when(currentResult).done(function (data) {
                    deferred.resolve(data || {}, errors);
                }).fail(function (error) {
                    error && errors.push(error);
                    next(depth + 1);
                });
            }
            deferred.reject(new Error('No registered handlers were able to handle file'));
        }

        next(0);

        return deferred.promise({
            abort: function abort() {
                if (!aborted && currentResult && currentResult.abort) {
                    currentResult.abort();
                }
                aborted = true;
            }
        });
    };

    /**
     * Unregisters all handlers.
     */
    HandlerRegistry.prototype._clear = function () {
        this.handlers = [];
    };

    exports.default = HandlerRegistry;
    module.exports = exports['default'];
});