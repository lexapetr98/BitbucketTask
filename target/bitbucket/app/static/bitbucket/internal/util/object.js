define('bitbucket/internal/util/object', ['exports', 'lodash'], function (exports, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.shallowEqual = exports.deepFreeze = exports.freeze = undefined;
    exports.uniqueFromArray = uniqueFromArray;
    exports.inherits = inherits;

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    function identity(a) {
        return a;
    }

    var has = Object.prototype.hasOwnProperty;

    /**
     * Cast a thing to a string.
     *
     * @param {*} thing
     * @returns {string}
     */
    function stringVal(thing) {
        if ((typeof thing === 'undefined' ? 'undefined' : babelHelpers.typeof(thing)) === 'object') {
            return JSON.stringify(thing);
        }
        return String(thing);
    }

    /**
     * Given an array of objects, return a new array of objects that has duplicates removed
     * based on the given properties that define the uniqueness of an object.
     *
     * If also comparing non-primitives then Objects will converted using `JSON.stringify()`,
     * everything will be cast using String().
     *
     * @param {Array<object>} array
     * @param {Array<string>} props
     * @param {boolean}       [alsoCompareNonPrimitives]
     */
    function uniqueFromArray(array, props, alsoCompareNonPrimitives) {
        var i;
        var s;
        var propsLen = props.length;
        var val = alsoCompareNonPrimitives ? stringVal : identity;

        return _lodash2.default.uniqBy(array, function (item) {
            for (i = 0, s = ''; i < propsLen; i++) {
                s += val(item[props[i]]);
            }
            return s;
        });
    }

    /**
     * Calls Object.freeze in browsers that support freezing
     *
     * @function
     */
    var freeze = exports.freeze = Object.freeze || identity;

    /**
     * Recursively calls Object.freeze in browsers that support freezing
     *
     * @function
     * @param {*} o - the object to recursively freeze
     * @param {boolean} [refreezeFrozen=false] - When true, will recurse through the properties of any objects that are
     *                                           already frozen. When false, will stop at the frozen object. The former
     *                                           may hit a stack overflow if there are circular references, and the latter
     *                                           may leave sub-objects unfrozen.
     */
    var deepFreeze = exports.deepFreeze = !Object.freeze ? identity : function deepFreeze(o, refreezeFrozen) {
        if (o !== null && (typeof o === 'undefined' ? 'undefined' : babelHelpers.typeof(o)) === 'object') {
            var isFrozen = Object.isFrozen(o);
            if (!isFrozen) {
                Object.freeze(o);
            }
            if (!isFrozen || refreezeFrozen) {
                for (var k in o) {
                    if (has.call(o, k)) {
                        deepFreeze(o[k]);
                    }
                }
            }
        }
        return o;
    };

    /**
     * Inherit the prototype methods from a constructor in to another object. The prototype of constructor
     * will be set to a new object created from superConstructor.
     *
     * @param {Object} constructor - One Object with a prototype
     * @param {Object} superConstructor - Another Object with a prototype
     *
     * @example
     *     function AnotherThing() {}
     *     Anotherthing.prototype.foo = 'foo';
     *
     *     function Thing() {}
     *     obj.inherits(Thing, AnotherThing);
     *
     *     //Thing.prototype.foo === 'foo';
     */
    function inherits(constructor, superConstructor) {
        constructor.prototype = Object.create(superConstructor.prototype);
        Object.defineProperty(constructor.prototype, 'constructor', {
            value: constructor,
            configurable: true,
            writable: true,
            enumerable: false
        });
    }

    var shallowEqual = exports.shallowEqual = function shallowEqual(a, b) {
        if (a === b) {
            return true;
        }
        if ((typeof a === 'undefined' ? 'undefined' : babelHelpers.typeof(a)) !== 'object' || (typeof b === 'undefined' ? 'undefined' : babelHelpers.typeof(b)) !== 'object' || a === null || b === null) {
            return false;
        }
        var aKeys = Object.keys(a);
        var bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) {
            return false;
        }
        return aKeys.every(function (k) {
            return a[k] === b[k];
        });
    };

    exports.default = {
        uniqueFromArray: uniqueFromArray,
        freeze: freeze,
        deepFreeze: deepFreeze,
        inherits: inherits,
        shallowEqual: shallowEqual
    };
});