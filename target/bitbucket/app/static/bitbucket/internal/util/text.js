define('bitbucket/internal/util/text', ['module', 'exports', 'lodash', 'bitbucket/internal/util/locale'], function (module, exports, _lodash, _locale) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var prettyNumberFormatter = new Intl.NumberFormat((0, _locale.getDocumentLocale)(), {
        maximumFractionDigits: 1
    });

    var numberFormatter = function numberFormatter(units, magnitude) {
        return function format(n) {
            n = typeof n === 'number' ? n : parseFloat(n, 10);

            if (isNaN(n)) {
                return '';
            }

            var unitIndex = 0;
            // round to 1 decimal only if needed (so `1.72` becomes `1.7`, but `1.02` becomes `1`)
            var minNumThatRoundsToMagnitude = magnitude - 0.05;
            while (Math.abs(n) >= minNumThatRoundsToMagnitude && unitIndex < units.length - 1) {
                n /= magnitude;
                unitIndex++;
            }
            return prettyNumberFormatter.format(n) + units[unitIndex];
        };
    };

    exports.default = {
        /**
         * Caps a number at a given maximum
         *
         * @param {String|Number} input The number to cap
         * @param {String|Number} cap The number that it should be caped out
         * @returns {String} The input number or "{cap}+" if the number is larger than cap
         */
        capInt: function capInt(input, cap) {
            //This should be kept in sync with the Java implementation in `CapIntFunction`
            return parseInt(input, 10) <= parseInt(cap, 10) ? String(input) : cap + '+';
        },
        // turn "hello world" into "Hello world"
        toSentenceCase: function toSentenceCase(str) {
            str += '';
            if (!str) {
                return '';
            }
            return str.charAt(0).toUpperCase() + str.substring(1);
        },
        camelCaseToHyphenated: function camelCaseToHyphenated(camelCaseString) {
            //Prefix any uppercase character that is preceded by a character that is not a hyphen, underscore or whitespace with a hyphen and lowercase the whole string
            //Replace any spaces with hyphens but really, this is intended to be used with well-formed camelcase,
            //if you pass in rubbish it will do it's best to LITFA but it will probably not be able to be reliably reversed.
            //This should be kept in sync with the Java implementation in `camelCaseToHyphenatedFunction`
            if (typeof camelCaseString !== 'string') {
                return undefined;
            }

            // No positive lookbehind in JS? Lets hack positive lookahead to do what we want.
            // Instead of looking for an uppercase character preceeded by a non-space/hyphen/underscore,
            // look for a non-space/hyphen/underscore followed by an uppercase character and add a hyphen after it.
            return camelCaseString.replace(/([^\s\-_])(?=[A-Z])/g, '$1-').replace(/\s/, '-').toLowerCase();
        },
        /**
         * Takes a string and runs it through {@linkcode util/text.camelCaseToHyphenated} to get a hyphenated string.
         * Then replaces any hyphens that occur between 2 "word" characters.
         *
         * @param {string} str
         * @returns {string}
         */
        camelCaseToDotCase: function camelCaseToDotCase(str) {
            var hyphenCased = this.camelCaseToHyphenated(str);
            return hyphenCased && hyphenCased.replace(/(\w)(-)(?=[\w])/gi, '$1.');
        },
        /**
         * Indent `text` by a given amount and an optional character
         * @param {string} text
         * @param {number} [amount=4]
         * @param {string} [indentChar=' ']
         * @returns {string|undefined}
         */
        indent: function indent(text, amount, indentChar) {
            amount = typeof amount === 'number' && isFinite(amount) ? amount : 4; //If amount is not valid default to 4
            indentChar = typeof indentChar === 'string' ? indentChar : ' ';

            if (typeof text !== 'string') {
                //trying to indent a non-string is undefined
                return undefined;
            }

            if (amount < 0) {
                //if amount is less than zero, return the original text
                return text;
            }

            return new Array(amount + 1).join(indentChar) + text;
        },
        /**
         * Inverse of indent - remove a given number of characters from the beginning of a string.
         * @param {string} text
         * @param {number} [amount=4]
         * @param {string} [indentChar=' ']
         * @returns {string|undefined}
         */
        unindent: function unindent(text, amount, indentChar) {
            amount = typeof amount === 'number' && isFinite(amount) ? amount : 4; //If amount is not valid default to 4
            indentChar = typeof indentChar === 'string' ? indentChar : ' ';

            if (typeof text !== 'string') {
                //trying to indent a non-string is undefined
                return undefined;
            }

            if (amount < 0) {
                //if amount is less than zero, return the original text
                return text;
            }

            while (text.charAt(0) === indentChar && amount) {
                text = text.substring(1);
                amount--;
            }

            return text;
        },
        /**
         * Pad a string with a given character to achieve a total string length
         * @param {string} text
         * @param {number} padding
         * @param {string} [indentChar]
         * @returns {string|undefined}
         */
        padLeft: function padLeft(text, padding, indentChar) {
            return this.indent(text, padding - text.length, indentChar);
        },
        formatSizeInBytes: numberFormatter([' bytes', 'KB', 'MB', 'GB', 'TB', 'PB'], 1024),
        formatNumberShorthand: numberFormatter(['', 'k', 'M', 'B', 'T'], 1000),
        /**
         * Abbreviate the text by removing characters from the middle and replacing them with a single instance of the replacement,
         * so that the total width of the new string is <= to `maxLength`
         *
         * @param {string} text
         * @param {number} maxLength
         * @param {string} [replacement='…']
         * @returns {*}
         */
        abbreviateText: function abbreviateText(text, maxLength, replacement) {
            if (typeof text !== 'string') {
                //trying to abbreviate a non-string is undefined
                return undefined;
            }
            if (isNaN(maxLength) || maxLength < 0 || text.length <= maxLength) {
                //if maxLength is not a number or less than zero, or if the text is shorter than the maxLength, return the original text
                return text;
            }

            replacement = typeof replacement === 'string' ? replacement : '…';
            var removedCharCount = text.length - maxLength + replacement.length;
            var textCenter = Math.round(text.length / 2);

            return text.substring(0, textCenter - Math.ceil(removedCharCount / 2)) + replacement + text.substring(textCenter + Math.floor(removedCharCount / 2), text.length);
        },
        convertBranchNameToSentence: function convertBranchNameToSentence(branchName) {
            //Replace hyphens and underscores with spaces, except when they are inside an issue key. Convert to sentence case
            if (!branchName || typeof branchName !== 'string') {
                return '';
            }

            var issueKeyRegex = /([A-Z]{1,10}-\d+)/;
            var parts = _lodash2.default.map(branchName.split(issueKeyRegex), function (value, index) {
                //Even indexed parts are non-issue-key strings, replace `-` and `_` with spaces
                return index % 2 === 0 ? value.replace(/[\-_]/g, ' ') : value;
            });

            return this.toSentenceCase(parts.join(''));
        },
        /**
         * Checks if an URI looks absolute (begins with a scheme, see RFC 3986). The URI is not checked for validity.
         * Note that a URI reference like "/foo/bar" is a relative URI with an absolute path; this function returns
         * false for it.
         *
         * @param {string} uri the URI to check
         * @returns {boolean} whether the URI is absolute
         */
        isUriAbsolute: function isUriAbsolute(uri) {
            return (/^[A-Za-z][A-Za-z0-9+\-.]*:/.test(uri)
            );
        }
    };
    module.exports = exports['default'];
});