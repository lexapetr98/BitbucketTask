define('bitbucket/internal/model/page-state', ['module', 'exports', 'bitbucket/internal/util/events', 'bitbucket/internal/util/text'], function (module, exports, _events, _text) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _text2 = babelHelpers.interopRequireDefault(_text);

    var has = Object.prototype.hasOwnProperty;

    var state = {};
    var namedProps = {};
    var api = {
        extend: function extend(key, getterFn, setterFn) {
            if (getterFn || setterFn) {
                return addCustomProperty(key, getterFn, setterFn);
            }
            return addDefaultProperty(key);
        }
    };

    // do a raw get from storage
    function doGet(key) {
        return has.call(state, key) ? state[key] : undefined;
    }

    /**
     * do a raw set into storage. Fires an event with the old and new values.
     * This will overwrite the previous value.
     * @param key
     * @param value
     */
    function doSet(key, value) {
        var old = doGet(key);
        if (old !== value) {
            state[key] = value;
            _events2.default.trigger('bitbucket.internal.model.page-state.changed.' + key, api, {
                key: key,
                newValue: value,
                oldValue: old
            });
        }
    }

    // return a function that will get the given property when called
    function getter(key) {
        return function () {
            return doGet(key);
        };
    }
    // return a function that will set the given property when called
    function setter(key) {
        return function (value) {
            return doSet(key, value);
        };
    }

    /**
     * Adds a property to the api as a pair of getter and setter, just a getter, or just a setter.
     * @param key {string} the name of the property. A property like "project" will create a .getProject() and a .setProject()
     * @param getterFn {?function()} an optional getter function for the property
     * @param setterFn {?function(value)} an optional setter function that takes in a value
     * @return {*}
     */
    function addCustomProperty(key, getterFn, setterFn) {
        if (has.call(namedProps, key)) {
            throw new Error('The property ' + key + ' is already in use. Please use a different key.');
        }
        namedProps[key] = true;
        if (getterFn) {
            api['get' + _text2.default.toSentenceCase(key)] = getterFn;
        }
        if (setterFn) {
            api['set' + _text2.default.toSentenceCase(key)] = setterFn;
        }

        return this;
    }

    /**
     * Add a property with a trivial getter and setter.
     * @param {string} key
     * @return {*}
     */
    function addDefaultProperty(key) {
        return addCustomProperty(key, getter(key), setter(key));
    }

    // Reserve property names, even if we aren't using them.
    addDefaultProperty('currentUser');
    addDefaultProperty('project');
    addDefaultProperty('repository');
    addDefaultProperty('pullRequest');
    addDefaultProperty('branch');
    addDefaultProperty('commit');
    addDefaultProperty('commitRange');
    addDefaultProperty('filePath');
    addDefaultProperty('revisionRef');
    exports.default = api;
    module.exports = exports['default'];
});