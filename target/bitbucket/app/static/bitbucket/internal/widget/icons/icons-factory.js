define('bitbucket/internal/widget/icons/icons-factory', ['exports', 'classnames', 'lodash', 'prop-types', 'react', 'bitbucket/internal/bbui/tipsy/tipsy', 'bitbucket/internal/util/components/react-functional'], function (exports, _classnames, _lodash, _propTypes, _react, _tipsy, _reactFunctional) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.svgIconFactory = exports.iconfontIconFactory = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _tipsy2 = babelHelpers.interopRequireDefault(_tipsy);

    var getIconDisplayName = function getIconDisplayName(iconName) {
        return 'Icon' + (0, _lodash.upperFirst)((0, _lodash.camelCase)(iconName)) + '\'';
    };

    var propTypes = {
        className: _propTypes2.default.string,
        children: _propTypes2.default.node,
        size: _propTypes2.default.oneOf(['small', 'large']),
        tooltip: _propTypes2.default.bool
    };

    var defaultProps = {
        className: null,
        children: null,
        size: 'small',
        tooltip: false
    };

    var sizeClassMap = {
        small: 'aui-icon-small',
        large: 'aui-icon-large'
    };

    var getSizeClassName = function getSizeClassName(size) {
        return sizeClassMap[size] || sizeClassMap[defaultProps.size];
    };

    var iconfontIconFactory = function iconfontIconFactory(iconName) {
        var Icon = function Icon(_ref) {
            var className = _ref.className,
                children = _ref.children,
                size = _ref.size,
                tooltip = _ref.tooltip,
                props = babelHelpers.objectWithoutProperties(_ref, ['className', 'children', 'size', 'tooltip']);

            var iconClassName = (0, _classnames2.default)('aui-icon', getSizeClassName(size), 'aui-iconfont-' + iconName, className);

            return tooltip ? _react2.default.createElement(
                _tipsy2.default,
                babelHelpers.extends({ className: iconClassName }, props),
                children
            ) : _react2.default.createElement(
                'span',
                babelHelpers.extends({ className: iconClassName }, props),
                children
            );
        };

        Icon.propTypes = propTypes;
        Icon.defaultProps = defaultProps;
        Icon.displayName = getIconDisplayName(iconName);

        return (0, _reactFunctional.pure)(Icon);
    };

    exports.iconfontIconFactory = iconfontIconFactory;
    var svgIconFactory = function svgIconFactory(iconName) {
        var svgIconClassName = 'icon-' + iconName;

        var Icon = function Icon(_ref2) {
            var className = _ref2.className,
                children = _ref2.children,
                size = _ref2.size,
                tooltip = _ref2.tooltip,
                props = babelHelpers.objectWithoutProperties(_ref2, ['className', 'children', 'size', 'tooltip']);

            var iconClassName = (0, _classnames2.default)('aui-icon', getSizeClassName(size), svgIconClassName, className);

            return tooltip ? _react2.default.createElement(
                _tipsy2.default,
                babelHelpers.extends({ className: iconClassName }, props),
                children
            ) : _react2.default.createElement(
                'span',
                babelHelpers.extends({ className: iconClassName }, props),
                children
            );
        };

        Icon.propTypes = propTypes;
        Icon.defaultProps = defaultProps;
        Icon.displayName = getIconDisplayName(iconName);

        return (0, _reactFunctional.pure)(Icon);
    };
    exports.svgIconFactory = svgIconFactory;
});