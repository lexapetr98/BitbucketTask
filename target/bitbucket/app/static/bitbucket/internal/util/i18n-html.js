define('bitbucket/internal/util/i18n-html', ['module', 'exports', '@atlassian/aui', 'prop-types', 'react'], function (module, exports, _aui, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var formatEscaped = function formatEscaped(text, params) {
        return params.length ? _aui.format.apply(undefined, [text].concat(babelHelpers.toConsumableArray(params.map(String).map(_aui.escapeHtml)))) : text;
    };

    /**
     * Escapes parameters to an I18n string that contains HTML.
     *
     * NOTE: This component should be replaced at some point. Ideally we'd have I18n.getTextAsHtml() and a transformer for
     * it. The result would be something like { __escaped:true. toString() { return 'localized'; } }, and the React component
     * could check for this. Then we wouldn't need `params` at all.
     *
     *
     * @param {string} [tag=span] - The optional tag name to render as the container
     * @param {string} children - the I18n markup to render
     * @param {array} params - params used to format the child text - they will be escaped.
     *         This is required to ensure you've considered which params need escaping.
     *         Use an empty array if no params should be escaped.
     * @param {Object} [attributes] - any further attributes to add to the container element,
     *                                must use React style attribute names (e.g. `className` rather than `class`)
     * @returns {React.Component}
     * @constructor
     * @example
     * <I18nHTML className="my-thing">
     *     {'<em>foo bar</em>'}
     * </I18nHTML>
     *
     * <I18nHTML id="my-id" params={[param1]}>
     *     {I18n.getText('i18n.prop.with.html')}
     * </I18nHTML>
     */
    var I18nHTML = function I18nHTML(_ref) {
        var Tag = _ref.tag,
            children = _ref.children,
            params = _ref.params,
            attributes = babelHelpers.objectWithoutProperties(_ref, ['tag', 'children', 'params']);
        return _react2.default.createElement(Tag, babelHelpers.extends({ dangerouslySetInnerHTML: { __html: formatEscaped(children, params) } }, attributes));
    };

    I18nHTML.defaultProps = {
        tag: 'span'
    };

    I18nHTML.propTypes = {
        attributes: _propTypes2.default.any,
        // Note that we expect children to be a string in this instance
        // because it should be the contents of an I18n HTML string, not a React element.
        children: _propTypes2.default.string.isRequired,
        tag: _propTypes2.default.string,
        params: _propTypes2.default.array.isRequired
    };

    /**
     * Creates a pure component with a given tag applied by default for namespaced shorthands
     * @param {string} tag
     * @returns {Function<React.Component>}
     */
    var tagify = function tagify(tag) {
        return function (props) {
            return _react2.default.createElement(I18nHTML, babelHelpers.extends({}, props, { tag: tag }));
        };
    };

    I18nHTML.p = tagify('p');
    I18nHTML.span = tagify('span');
    I18nHTML.div = tagify('div');
    I18nHTML.a = tagify('a');

    exports.default = I18nHTML;
    module.exports = exports['default'];
});