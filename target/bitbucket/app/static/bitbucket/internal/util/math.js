define('bitbucket/internal/util/math', ['module', 'exports', 'lodash'], function (module, exports, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    function multiply(a, b) {
        return a * b;
    }

    function add(a, b) {
        return a + b;
    }

    function lessThan(a, b) {
        return a < b;
    }

    function greaterThan(a, b) {
        return a > b;
    }

    function isPositive(a) {
        return a > 0;
    }

    function isNegative(a) {
        return a < 0;
    }

    /**
     * Normalise a number to no higher than the `cutoff`
     *
     * @example
     * [-2, -1, 0, 1, 2].map(math.lowPass(0)) // => [-2, -1, 0, 0, 0]
     */
    function lowPass(cutoff) {
        return function (a) {
            return Math.min(cutoff, a);
        };
    }

    /**
     * Normalise a number to no lower than the `cutoff`
     *
     * @example
     * [-2, -1, 0, 1, 2].map(math.highPass(0)) // => [0, 0, 0, 1, 2]
     */
    function highPass(cutoff) {
        return function (a) {
            return Math.max(cutoff, a);
        };
    }

    /**
     * Normalise a number to no lower than the `min` and no higher than `max`
     *
     * @example
     * [-2, -1, 0, 1, 2].map(math.clamp(-1, 1)) //=> [-1, -1, 0, 1, 1]
     */
    function clamp(min, max) {
        return _lodash2.default.flow(lowPass(max), highPass(min));
    }

    /**
     * Create a Point object that can be used to indicate coordinates/position
     * @returns {Point}
     * @constructor
     */
    function Point(x, y) {
        if (!(this instanceof Point)) {
            return new Point(x, y);
        }

        this.x = x;
        this.y = y;
    }

    /**
     * Create a Size object that can be used to indicate a 2D measurement of a thing
     * @returns {Size}
     * @constructor
     */
    function Size(width, height) {
        if (!(this instanceof Size)) {
            return new Size(width, height);
        }

        this.width = width;
        this.height = height;
    }

    exports.default = {
        add: add,
        clamp: clamp,
        greaterThan: greaterThan,
        highPass: highPass,
        isNegative: isNegative,
        isPositive: isPositive,
        lowPass: lowPass,
        lessThan: lessThan,
        multiply: multiply,
        Point: Point,
        Size: Size
    };
    module.exports = exports['default'];
});