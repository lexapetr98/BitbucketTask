define('bitbucket/internal/feature/dashboard/components/pull-request-suggestion-web-section', ['exports', 'classnames', 'lodash', 'prop-types', 'react', 'bitbucket/internal/impl/web-fragments'], function (exports, _classnames, _lodash, _propTypes, _react, _webFragments) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.WebSectionCell = exports.getWebSections = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _webFragments2 = babelHelpers.interopRequireDefault(_webFragments);

    var getWebSections = exports.getWebSections = (0, _lodash.once)(function () {
        return _webFragments2.default.getWebSections('bitbucket.internal.dashboard.pull-request-suggestion.table-column.before');
    });

    var WebSectionCell = exports.WebSectionCell = function WebSectionCell(_ref) {
        var webSection = _ref.webSection,
            suggestion = _ref.suggestion;

        return _react2.default.createElement('td', {
            className: (0, _classnames2.default)(webSection.key + '-value', webSection.params.tdCssClass, 'web-section-column'),
            dangerouslySetInnerHTML: {
                __html: _webFragments2.default.getWebPanels(webSection.location + '/' + webSection.key, {
                    suggestion: suggestion
                }).map(function (p) {
                    return p.html;
                }).join('')
            }
        });
    };

    WebSectionCell.propTypes = {
        suggestion: _propTypes2.default.object.isRequired,
        webSection: _propTypes2.default.object.isRequired
    };

    exports.default = {
        getWebSections: getWebSections,
        WebSectionCell: WebSectionCell
    };
});