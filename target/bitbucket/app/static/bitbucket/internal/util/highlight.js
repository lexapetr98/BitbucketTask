define('bitbucket/internal/util/highlight', ['module', 'exports', 'lodash', 'prop-types', 'react'], function (module, exports, _lodash, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var WORD_BOUNDARY_RE = /(\W)/g;

    /**
     * Highlight a given query in a block of text by wrapping the occurrences with a tag
     * This uses word boundaries to separate search terms and the text phrase.
     * @param {string} text
     * @param {string} query - the phrase to look for in `text`
     * @param {string} [tag] - the tag to use for wrapping
     * @param {boolean} [caseSensitive] - should the search be caseSensitive
     * @param {boolean} [leadingOnly] - only highlight items at the start of a word boundary
     * @returns {string|React.Children}
     */
    function highlight(_ref) {
        var text = _ref.text,
            query = _ref.query,
            _ref$tag = _ref.tag,
            Tag = _ref$tag === undefined ? 'mark' : _ref$tag,
            _ref$caseSensitive = _ref.caseSensitive,
            caseSensitive = _ref$caseSensitive === undefined ? false : _ref$caseSensitive,
            _ref$leadingOnly = _ref.leadingOnly,
            leadingOnly = _ref$leadingOnly === undefined ? false : _ref$leadingOnly;

        var casedStr = function casedStr(str) {
            return caseSensitive && str ? str : str.toLowerCase();
        };
        var multiTerms = (0, _lodash.compact)(casedStr(query).split(WORD_BOUNDARY_RE).map(function (str) {
            return str.trim();
        }));
        var anyTermsMatched = multiTerms.some(function (term) {
            return text.match(new RegExp(RegExp.escape(term), caseSensitive ? '' : 'i'));
        });
        if (!anyTermsMatched) {
            return text;
        }
        var out = text.split(WORD_BOUNDARY_RE).map(function (part, index) {
            var firstMatch = '';
            var matchIndex = 0;
            var matched = multiTerms.some(function (term) {
                var textPart = casedStr(part);
                var found = (leadingOnly ? _lodash.startsWith : _lodash.includes)(textPart, term);
                if (found) {
                    firstMatch = term;
                    matchIndex = textPart.indexOf(term);
                }
                return found;
            });

            if (!matched) {
                return part;
            }

            var marked =
            // eslint-disable-next-line react/no-array-index-key
            _react2.default.createElement(
                Tag,
                { key: index, className: 'term-highlight' },
                part.substr(matchIndex, firstMatch.length)
            );

            // if the term matches the whole part then return just that to avoid
            // an unnecessary wrapping tag
            if (part === firstMatch) {
                return marked;
            }

            /* eslint-disable react/no-array-index-key */
            return _react2.default.createElement(
                'span',
                { key: index },
                part.substr(0, matchIndex),
                marked,
                part.substr(matchIndex + firstMatch.length)
            );
            /* eslint-enable react/no-array-index-key */
        });

        return out;
    }

    var Highlight = function Highlight(_ref2) {
        var props = babelHelpers.objectWithoutProperties(_ref2, []);
        return _react2.default.createElement(
            'span',
            null,
            highlight(babelHelpers.extends({}, props))
        );
    };

    Highlight.defaultProps = {
        tag: 'mark',
        caseSensitive: false
    };

    Highlight.propTypes = {
        text: _propTypes2.default.string.isRequired,
        query: _propTypes2.default.string.isRequired,
        tag: _propTypes2.default.string,
        caseSensitive: _propTypes2.default.bool
    };

    exports.default = Highlight;
    module.exports = exports['default'];
});