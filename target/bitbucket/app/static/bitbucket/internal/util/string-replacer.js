define('bitbucket/internal/util/string-replacer', ['module', 'exports', 'lodash'], function (module, exports, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var DEFAULT_REPLACER_WEIGHT = 1000;

    /**
     * For usages see string-replacer-test.js
     */

    var StringReplacer = function () {
        function StringReplacer() {
            babelHelpers.classCallCheck(this, StringReplacer);

            this.replacers = [];
        }

        /**
         * @param {Function} replacer - a function to that returns a Promise resolving with an array of objects used to
         * replace part(s)/all of a string.
         * @param {Number} [weight=1000] - used to rank in ascending order the sequence the replacer functions are called on the string
         * @returns {Array} An array of sorted replacer functions.
         */


        babelHelpers.createClass(StringReplacer, [{
            key: 'registerReplacer',
            value: function registerReplacer(replacer) {
                var weight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_REPLACER_WEIGHT;

                this.replacers.push({ replacer: replacer, weight: weight });
                return this.replacers.sort(function (next, prev) {
                    return next.weight - prev.weight;
                });
            }
        }, {
            key: 'occurrenceIndexes',
            value: function occurrenceIndexes(str, replacement) {
                var stringToFind = replacement.find;
                var matchMultiple = replacement.multiple !== false;
                var foundIndexes = [];
                var index = -1;
                while ((index === -1 || matchMultiple) && // this is the first attempt, or we support multiple matches
                (index = str.indexOf(stringToFind, index + 1)) !== -1 // we found something
                ) {
                    foundIndexes.push(index);
                }
                return foundIndexes;
            }
        }, {
            key: 'addIndexes',
            value: function addIndexes(str, arrayOfReplacementArrays) {
                var _this = this;

                return _lodash2.default.flattenDeep(arrayOfReplacementArrays.map(function (_ref) {
                    var _ref2 = babelHelpers.slicedToArray(_ref, 2),
                        replacer = _ref2[0],
                        replacementArray = _ref2[1];

                    return replacementArray.map(function (replacement) {
                        return _this.occurrenceIndexes(str, replacement).map(function (index) {
                            return {
                                weight: replacer.weight,
                                start: index,
                                end: index + replacement.find.length,
                                replacement: replacement
                            };
                        });
                    });
                }));
            }
        }, {
            key: 'sortByWeightOrPosition',
            value: function sortByWeightOrPosition(replacementArray) {
                return replacementArray.sort(function (a, b) {
                    return a.weight - b.weight || a.start - b.start;
                });
            }
        }, {
            key: 'sortByPosition',
            value: function sortByPosition(replacementArray) {
                return replacementArray.sort(function (a, b) {
                    return a.start - b.start;
                });
            }
        }, {
            key: 'dedupe',
            value: function dedupe(str, foundReplacementsArray) {
                return foundReplacementsArray.reduce(function (deduped, replacement) {
                    var overlapped = deduped.some(function (other) {
                        return other.start <= replacement.start && other.end > replacement.start || replacement.start <= other.start && replacement.end > other.start;
                    });
                    return overlapped ? deduped : deduped.concat(replacement);
                }, []);
            }
        }, {
            key: 'replace',
            value: function replace(str, replacements, noMatchCallback) {
                if (typeof noMatchCallback === 'undefined') {
                    noMatchCallback = function noMatchCallback(str) {
                        return str;
                    };
                }

                if (!replacements.length) {
                    return noMatchCallback(str);
                }

                var results = replacements.reduce(function (memo, replacement) {
                    if (memo.pointer < replacement.start) {
                        memo.replacements.push(noMatchCallback(str.substring(memo.pointer, replacement.start)));
                    }

                    memo.replacements.push(replacement.replacement.replace);

                    return {
                        pointer: replacement.end,
                        replacements: memo.replacements
                    };
                }, { pointer: 0, replacements: [] });

                if (results.pointer < str.length) {
                    results.replacements.push(noMatchCallback(str.substring(results.pointer, str.length)));
                }

                return results.replacements.join('');
            }
        }, {
            key: 'process',
            value: function process(str, metadata, noMatchCallback) {
                var _this2 = this;

                var promises = this.replacers.map(function (_ref3) {
                    var replacer = _ref3.replacer;

                    return replacer(str, metadata).catch(function (err) {
                        // on rejection, log the error & return empty array so the resolved replacers still apply
                        console.error(err, replacer, ' failed');
                        return [];
                    });
                });

                return Promise.all(promises).then(function (arrayOfReplacementArrays) {
                    return _this2.addIndexes(str, _lodash2.default.zip(_this2.replacers, arrayOfReplacementArrays));
                }).then(this.sortByWeightOrPosition).then(function (foundReplacementsArray) {
                    return _this2.dedupe(str, foundReplacementsArray);
                }).then(this.sortByPosition).then(function (dedupedArray) {
                    return _this2.replace(str, dedupedArray, noMatchCallback);
                });
            }
        }]);
        return StringReplacer;
    }();

    exports.default = StringReplacer;
    module.exports = exports['default'];
});