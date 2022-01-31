define('bitbucket/internal/util/array', ['module', 'exports', 'lodash', 'bitbucket/internal/util/function'], function (module, exports, _lodash, _function) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    /**
     * Find an index for the first item in the array where a given predicate returns truthy, or -1 if no item returns truthy
     * @param {function(*, number, Array):boolean} fn - predicate
     * @returns {function(Array):number} index where the predicate first returned truthy
     */
    function findIndex(fn) {
        return function (array) {
            for (var i = 0; i < array.length; i++) {
                if (fn(array[i], i, array)) {
                    return i;
                }
            }
            return -1;
        };
    }

    /**
     * Slice an array starting at (inclusive) the point where a predicate first returns truthy
     * @param {function(*, number, Array):boolean} fn - predicate
     * @returns {function(Array) : Array}
     */
    function skipUntil(fn) {
        return function (array) {
            var i = findIndex(fn)(array);
            return i === -1 ? [] : array.slice(i);
        };
    }

    /**
     * Slice an array until (exclusive) the point where a predicate first returns truthy
     * @param {function(*, number, Array):boolean} fn - predicate
     * @returns {function(Array) : Array}
     */
    function takeUntil(fn) {
        return function (array) {
            var i = findIndex(fn)(array);
            return i === -1 ? array : array.slice(0, i);
        };
    }

    /**
     * Slice an array starting at (inclusive) the point where a predicate first returns falsy
     * @function
     * @param {function(*, number, Array):boolean} fn - predicate
     * @returns {function(Array) : Array}
     */
    var skipWhile = _lodash2.default.flow(_function2.default.not, skipUntil);

    /**
     * Slice an array until (exclusive) the point where a predicate first returns falsy
     * @param {function(*, number, Array):boolean} fn - predicate
     * @returns {function(Array) : Array}
     */
    var takeWhile = _lodash2.default.flow(_function2.default.not, takeUntil);

    exports.default = {
        skipWhile: skipWhile,
        takeWhile: takeWhile,
        findIndex: findIndex,
        skipUntil: skipUntil,
        takeUntil: takeUntil
    };
    module.exports = exports['default'];
});