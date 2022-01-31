define('bitbucket/internal/widget/conditional-link', ['module', 'exports', 'prop-types', 'react'], function (module, exports, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    /**
     * Render a link or a span depending on whether the `href` attribute is present.
     * @param {Object} props
     * @param {Node} props.children - the child nodes
     * @param {Object} [props.attrs] - any addition attributes to add to the rendered node
     * @returns {*}
     * @constructor
     */
    var ConditionalLink = function ConditionalLink(_ref) {
        var children = _ref.children,
            attrs = babelHelpers.objectWithoutProperties(_ref, ['children']);

        if (attrs.href) {
            return _react2.default.createElement(
                'a',
                attrs,
                children
            );
        }

        return _react2.default.createElement(
            'span',
            attrs,
            children
        );
    };

    ConditionalLink.propTypes = {
        /* Other props that can be used here are any valid JSX/DOM attributes for inline elements */
        href: _propTypes2.default.string,
        children: _propTypes2.default.node
    };

    exports.default = ConditionalLink;
    module.exports = exports['default'];
});