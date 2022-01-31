define('bitbucket/internal/util/cache', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var Persist = exports.Persist = {
        ONCE: 'ONCE',
        FOREVER: 'FOREVER'
    };

    /**
     * Implements a simple cache based on an object with the ability to configure
     * how long a cache value should persist
     */

    var Cache = function () {
        function Cache() {
            babelHelpers.classCallCheck(this, Cache);
            this.entries = {};
        }

        babelHelpers.createClass(Cache, [{
            key: 'set',
            value: function set(key, value) {
                var persistence = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Persist.FOREVER;

                this.entries[key] = {
                    value: value,
                    persistence: persistence
                };
            }
        }, {
            key: 'get',
            value: function get(key) {
                if (this.has(key)) {
                    var entry = this.entries[key];
                    if (entry.persistence === Persist.ONCE) {
                        delete this.entries[key];
                    }
                    return entry.value;
                }
            }
        }, {
            key: 'has',
            value: function has(key) {
                return this.entries.hasOwnProperty(key);
            }
        }, {
            key: 'clear',
            value: function clear(key) {
                if (!arguments.length) {
                    this.entries = {};
                    return true;
                } else if (this.has(key)) {
                    delete this.entries[key];
                    return true;
                }
                return false;
            }
        }]);
        return Cache;
    }();

    exports.default = Cache;
});