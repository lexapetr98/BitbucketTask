define('bitbucket/internal/feature/dashboard/components/pull-request-table-web-section', ['exports', 'classnames', 'lodash', 'prop-types', 'react', 'bitbucket/internal/impl/web-fragments'], function (exports, _classnames, _lodash, _propTypes, _react, _webFragments) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.WebSectionCell = exports.WebSectionHeader = exports.getWebSections = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _webFragments2 = babelHelpers.interopRequireDefault(_webFragments);

    var getWebSections = exports.getWebSections = (0, _lodash.once)(function () {
        return _webFragments2.default.getWebSections('bitbucket.internal.dashboard.pull-request.table-column.after');
    });

    var WebSectionHeader = exports.WebSectionHeader = function WebSectionHeader(props) {
        var webSection = props.webSection;
        return _react2.default.createElement(
            'th',
            {
                className: (0, _classnames2.default)(webSection.key, webSection.params.thCssClass, 'web-section-column'),
                title: webSection.text,
                scope: 'col'
            },
            webSection.text
        );
    };

    WebSectionHeader.propTypes = {
        webSection: _propTypes2.default.object.isRequired
    };

    var WebSectionCell = exports.WebSectionCell = function WebSectionCell(_ref) {
        var webSection = _ref.webSection,
            pullRequest = _ref.pullRequest;

        var location = webSection.location + '/' + webSection.key;
        return _react2.default.createElement('td', {
            className: (0, _classnames2.default)(webSection.key + '-value', webSection.params.tdCssClass, 'web-section-column'),
            dangerouslySetInnerHTML: {
                __html: _webFragments2.default.getWebPanels(location, { pullRequest: pullRequest }).map(function (p) {
                    return p.html;
                }).join('')
            }
        });
    };

    WebSectionCell.propTypes = {
        pullRequest: _propTypes2.default.object.isRequired,
        webSection: _propTypes2.default.object.isRequired
    };

    exports.default = {
        getWebSections: getWebSections,
        WebSectionHeader: WebSectionHeader,
        WebSectionCell: WebSectionCell
    };
});