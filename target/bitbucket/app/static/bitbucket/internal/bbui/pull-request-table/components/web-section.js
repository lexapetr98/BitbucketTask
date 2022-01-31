define('bitbucket/internal/bbui/pull-request-table/components/web-section', ['exports', 'lodash', 'prop-types', 'react', 'bitbucket/internal/impl/web-fragments', '../../utils/pull-request-unique-id'], function (exports, _lodash, _propTypes, _react, _webFragments, _pullRequestUniqueId) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.WebSectionCell = exports.WebSectionHeader = exports.getAfterSections = exports.getBeforeSections = undefined;

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _webFragments2 = babelHelpers.interopRequireDefault(_webFragments);

    var _pullRequestUniqueId2 = babelHelpers.interopRequireDefault(_pullRequestUniqueId);

    var getBeforeSections = exports.getBeforeSections = (0, _lodash.once)(function () {
        return _webFragments2.default.getWebSections('bitbucket.pull-request.table-column.before');
    });
    var getAfterSections = exports.getAfterSections = (0, _lodash.once)(function () {
        return _webFragments2.default.getWebSections('bitbucket.pull-request.table-column.after');
    });

    var WebSectionHeader = exports.WebSectionHeader = function WebSectionHeader(props) {
        var webSection = props.webSection;
        return _react2.default.createElement(
            'th',
            { className: webSection.key + ' web-section-column', title: webSection.text, scope: 'col' },
            webSection.text
        );
    };

    WebSectionHeader.propTypes = {
        webSection: _propTypes2.default.object.isRequired
    };

    var WebSectionCell = exports.WebSectionCell = function (_Component) {
        babelHelpers.inherits(WebSectionCell, _Component);

        function WebSectionCell() {
            babelHelpers.classCallCheck(this, WebSectionCell);
            return babelHelpers.possibleConstructorReturn(this, (WebSectionCell.__proto__ || Object.getPrototypeOf(WebSectionCell)).apply(this, arguments));
        }

        babelHelpers.createClass(WebSectionCell, [{
            key: 'shouldComponentUpdate',

            // We don't want to regrab the web panels for existing rows every time the table rerenders as this would cause them to needlessly
            // redo their work. So we only regrab them when the props actually change. This component is used with a React key={} prop,
            // and in theory each row should only render once ever.
            value: function shouldComponentUpdate(newProps) {
                return (0, _pullRequestUniqueId2.default)(newProps.pullRequest) !== (0, _pullRequestUniqueId2.default)(this.props.pullRequest) || newProps.webSection.key !== this.props.webSection.key || newProps.where !== this.props.where;
            }
        }, {
            key: 'render',
            value: function render() {
                var webSection = this.props.webSection;
                var pullRequest = this.props.pullRequest;
                var location = 'bitbucket.pull-request.table-column.' + this.props.where + '/' + webSection.key;
                return _react2.default.createElement('td', {
                    className: webSection.key + '-value web-section-column',
                    dangerouslySetInnerHTML: {
                        __html: _webFragments2.default.getWebPanels(location, { pullRequest: pullRequest }).map(function (p) {
                            return p.html;
                        }).join('')
                    }
                });
            }
        }]);
        return WebSectionCell;
    }(_react.Component);

    WebSectionCell.propTypes = {
        pullRequest: _propTypes2.default.object.isRequired,
        webSection: _propTypes2.default.object.isRequired,
        where: _propTypes2.default.string.isRequired
    };

    exports.default = {
        getAfterSections: getAfterSections,
        getBeforeSections: getBeforeSections,
        WebSectionHeader: WebSectionHeader,
        WebSectionCell: WebSectionCell
    };
});