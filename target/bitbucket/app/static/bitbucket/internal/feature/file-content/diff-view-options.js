define('bitbucket/internal/feature/file-content/diff-view-options', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/client-storage', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _lodash, _clientStorage, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    // Make sure the storageKey only gets initialized when required
    var storageKey = _lodash2.default.once(function () {
        return _clientStorage2.default.buildKey(['diff-view', 'options'], 'user');
    });

    function DiffViewOptions() {}

    _events2.default.addLocalEventMixin(DiffViewOptions.prototype);

    /**
     * Lazily initialize our options here and cache them for future access.
     *
     * @returns {Object}
     */
    DiffViewOptions.prototype.getOptions = _lodash2.default.memoize(function () {
        return _lodash2.default.assign({}, this.defaults, _clientStorage2.default.getItem(storageKey()));
    });

    //The root options contain no overrides, but proxies will override this
    DiffViewOptions.prototype.getOverrides = function () {
        return null;
    };

    DiffViewOptions.prototype.defaults = {
        ignoreWhitespace: false,
        showWhitespaceCharacters: false,
        hideComments: false,
        hideEdiff: false,
        diffType: 'unified'
    };

    /**
     * Trigger the currently viewed file to update.
     *
     * Usually after an option has been changed.
     *
     * @param {string} key
     * @param {string} value
     */
    DiffViewOptions.prototype.triggerUpdate = function (key, value) {
        var entry = {
            key: key,
            value: value
        };
        this.trigger('change', entry);
        _events2.default.trigger('bitbucket.internal.feature.fileContent.optionsChanged', null, entry);
    };

    /**
     * Set a diff option
     *
     * We use a setter so that we can keep an internal reference to the
     * key/value pair while also updating clientStorage
     *
     * @param {string} key
     * @param {*} value
     * @param {boolean} [update] trigger an update event?
     */
    DiffViewOptions.prototype.set = function (key, value, update) {
        this.getOptions()[key] = value;
        //Also update storage
        _clientStorage2.default.setItem(storageKey(), this.getOptions());

        if (update !== false) {
            this.triggerUpdate(key, value);
        }
    };

    /**
     * Get a diff option
     *
     * @param {string} key
     * @returns {*}
     */
    DiffViewOptions.prototype.get = function (key) {
        return this.getOptions()[key];
    };

    /**
     * Create a new DiffViewOptions that sources out to this DiffViewOptions, but which can
     * add any hard or soft overrides that will pre-empt the underlying options.
     * (hard) override - is returned as the option value and if present no .set() requests for that key will be applied.
     * soft override - is returned as the option value but if present, .set() requests will still be respected and remove
     *                 the soft override.
     * @param overrides - initial hard overrides
     * @param softOverrides - initial soft overrides
     * @returns {DiffViewOptions}
     */
    DiffViewOptions.prototype.proxy = function () {
        var overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var softOverrides = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var target = this;
        var proxy = new DiffViewOptions();

        // NOTE: using $.extend means undefined overrides won't override options.
        // E.g. $.extend({}, { diffType: 'unified' }, { diffType: undefined }).diffType === 'unified'
        proxy.getOptions = function () {
            return _jquery2.default.extend({}, target.getOptions(), softOverrides, overrides);
        };

        /**
         * Use this to see which options are _hard_ overrides
         * Useful in the options panel for determining whether to disable the checkbox/radio for that option
         */
        proxy.getOverrides = function () {
            return _jquery2.default.extend({}, target.getOverrides(), overrides);
        };

        // In the future, a getSoftOverrides() might be useful to see which options are currently only set due to soft overrides
        // But there is no UI difference for that yet, so I'm not exposing it.

        /**
         * Set the real option, assuming no hard overrides. Will remove any soft overrides
         */
        proxy.set = function (key, value, update) {
            if (overrides[key] === undefined) {
                delete softOverrides[key];
                target.set(key, value, update);
            }
        };

        /**
         * Add a hard override for a given option - will block the option being set in the future
         * @returns {function()} to remove the override
         */
        proxy.setOverride = function (key, value, update) {
            var _this = this;

            if (overrides[key] !== undefined) {
                throw new Error('Cannot double-set overrides');
            }
            overrides[key] = value;
            if (update !== false) {
                this.triggerUpdate(key, value);
            }
            return function () {
                delete overrides[key];
                if (update !== false) {
                    _this.triggerUpdate(key, undefined);
                }
            };
        };

        /**
         * Add a soft override for a given option - will NOT block the option being set in the future.
         * @returns {function()} to remove the soft override
         */
        proxy.setSoftOverride = function (key, value, update) {
            var _this2 = this;

            if (overrides[key] !== undefined || softOverrides[key] !== undefined) {
                throw new Error('Cannot double-set soft overrides');
            }
            softOverrides[key] = value;
            if (update !== false) {
                this.triggerUpdate(key, value);
            }
            return function () {
                if (key in softOverrides && overrides[key] === undefined) {
                    delete softOverrides[key];
                    if (update !== false) {
                        _this2.triggerUpdate(key, undefined);
                    }
                }
            };
        };

        proxy.destroy = _events2.default.chainWith(target).on('change', function (entry) {
            if (overrides[entry.key] === undefined) {
                proxy.trigger('change', entry);
            }
        }).destroy;

        return proxy;
    };

    exports.default = new DiffViewOptions().proxy();
    module.exports = exports['default'];
});