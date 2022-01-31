define('bitbucket/internal/bbui/aui-react/avatar', ['exports', '@atlassian/aui', 'classnames', 'lodash', 'prop-types', 'react', 'bitbucket/internal/impl/urls'], function (exports, _aui, _classnames, _lodash, _propTypes, _react, _urls) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Avatar = exports.ProjectAvatar = exports.UserAvatar = exports.AvatarTShirtSize = exports.AvatarSize = undefined;

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _urls2 = babelHelpers.interopRequireDefault(_urls);

    /*
     * This file exposes a default UserAvatar, and a named ProjectAvatar.
     */

    // TODO should be refactored into multiple components
    // prop-types rule currently barfs on use of the spread operator
    /*eslint react/prop-types:0 */
    var commonPropTypes = {
        avatarAttrs: _propTypes2.default.object,
        avatarClassName: _propTypes2.default.string,
        // A list of possible badges to show for this avatar.
        // These will always be present in the DOM, for animation purposes
        badges: _propTypes2.default.arrayOf(_propTypes2.default.shape({
            className: _propTypes2.default.string,
            // for accessibility
            text: _propTypes2.default.string
        })),
        // Will be set on the outer-most element
        className: _propTypes2.default.string,
        // T-shirt sizing
        size: _propTypes2.default.string,
        // Set to false when `withName` is true
        tooltip: _propTypes2.default.bool,
        tooltipText: _propTypes2.default.string,
        // The single (if any) badge class name to be shown
        visibleBadge: _propTypes2.default.string,
        withLink: _propTypes2.default.bool,
        withName: _propTypes2.default.bool,
        withEmail: _propTypes2.default.bool
    };

    var commonDefaultProps = {
        badges: [],
        size: 'small',
        tooltip: true,
        tooltipText: '',
        withName: false,
        withEmail: false
    };

    /*eslint-disable no-magic-numbers*/
    /**
     * AUI/ADG Avatar Sizes
     * We fetch @2x size images for HiDPI displays
     * @readonly
     * @enum number
     */
    var AvatarSize = exports.AvatarSize = {
        XSMALL: 16 * 2,
        SMALL: 24 * 2,
        MEDIUM: 32 * 2,
        LARGE: 48 * 2,
        XLARGE: 64 * 2,
        XXLARGE: 96 * 2,
        XXXLARGE: 128 * 2
    };
    /*eslint-enable no-magic-numbers*/

    /**
     * AUI/ADG Avatar t-shirt Sizes
     * @readonly
     * @enum string
     */
    var AvatarTShirtSize = exports.AvatarTShirtSize = (0, _lodash.mapValues)(AvatarSize, function (val, key) {
        return key.toLowerCase();
    });

    var UserAvatar = exports.UserAvatar = function UserAvatar(props) {
        var user = props.person.user || props.person;
        var displayableName = user.displayName || user.name;
        var fallbackTooltip = displayableName;

        var display = [];
        if (props.withName) {
            display.push(displayableName);
        }
        if (props.withEmail && user.emailAddress) {
            fallbackTooltip += ' (' + user.emailAddress + ')';
            display.push(_react2.default.createElement(
                'span',
                { key: 'email', className: 'email-address' },
                user.emailAddress
            ));
        }
        var avatarProps = {
            alt: displayableName,
            avatarAttrs: { 'data-username': user.name },
            avatarSrc: _urls2.default.avatarUrl(user, AvatarSize[props.size.toUpperCase()]),
            badges: props.badges,
            className: (0, _classnames2.default)('user-avatar', props.avatarClassName, { 'badge-hidden': props.hideBadge }, props.withName || props.withEmail ? null : props.className),
            display: display,
            displayLink: props.withLink ? _urls2.default.user(user) : undefined,
            size: props.size,
            title: props.tooltip && (props.tooltipText || fallbackTooltip),
            tooltip: props.tooltip,
            visibleBadge: props.visibleBadge
        };
        return _react2.default.createElement(AvatarWrapper, babelHelpers.extends({}, props, { avatarProps: avatarProps }));
    };
    UserAvatar.defaultProps = babelHelpers.extends({}, commonDefaultProps);
    UserAvatar.propTypes = babelHelpers.extends({}, commonPropTypes, {
        person: _propTypes2.default.object.isRequired
    });

    var ProjectAvatar = exports.ProjectAvatar = function ProjectAvatar(props) {
        var avatarProps = {
            alt: props.project.name,
            avatarSrc: props.project.avatarUrl || function () {
                throw new Error('No avatar URL provided: ' + JSON.stringify(props));
            }(),
            badges: props.badges,
            isProject: true,
            display: props.project.name,
            displayLink: 'XXX TODO TEST',
            size: props.size,
            title: props.project.name,
            tooltip: props.tooltip,
            visibleBadge: props.visibleBadge
        };
        return _react2.default.createElement(AvatarWrapper, babelHelpers.extends({}, props, { avatarProps: avatarProps }));
    };
    ProjectAvatar.defaultProps = babelHelpers.extends({}, commonDefaultProps, {
        avatarAttrs: {}
    });
    ProjectAvatar.propTypes = babelHelpers.extends({}, commonPropTypes, {
        project: _propTypes2.default.object.isRequired
    });

    /**
     * An AUI avatar.
     *
     * @param {Object} props - The component properties
     * @param {string} props.alt - The text equivalent of the avatar
     * @param {string} props.avatarSrc - The URL to the avatar image
     * @param {Object} [props.avatarAttrs] - Attributes to be added to the top level avatar element
     * @param {string} [props.size=small] - The avatar size (using t-shirt sizes)
     * @param {string} [props.className] - Classes to be added to the top level avatar element
     * @param {Array} [props.badges] - Array of badges containing a `className` and optional `text`
     * @param {boolean} [props.isProject] - Renders avatar with project shape (square)
     * @param {string} props.title - Tooltip text for the avatar
     * @param {boolean} [props.tooltip=true] - Whether to show a tooltip for the avatar
     * @param {string} [props.visibleBadge] - Badges are visible
     * @returns {ReactElement} The rendered component
     */
    var Avatar = exports.Avatar = function Avatar(_ref) {
        var alt = _ref.alt,
            avatarAttrs = _ref.avatarAttrs,
            avatarSrc = _ref.avatarSrc,
            _ref$badges = _ref.badges,
            badges = _ref$badges === undefined ? [] : _ref$badges,
            isProject = _ref.isProject,
            className = _ref.className,
            size = _ref.size,
            title = _ref.title,
            tooltip = _ref.tooltip,
            visibleBadge = _ref.visibleBadge;

        var avatarClassNames = (0, _classnames2.default)(className, 'aui-avatar', 'aui-avatar-' + size, {
            'aui-avatar-badged': badges.length,
            'aui-avatar-project': isProject
        });

        var imgAttrs = {
            alt: alt,
            ref: tooltip ? function (el) {
                return _aui2.default.$(el).tooltip();
            } : null,
            src: avatarSrc,
            title: tooltip ? title : undefined
        };

        return _react2.default.createElement(
            'span',
            babelHelpers.extends({ className: avatarClassNames }, avatarAttrs),
            _react2.default.createElement(
                'span',
                { className: 'aui-avatar-inner' },
                _react2.default.createElement('img', babelHelpers.extends({ alt: imgAttrs.alt }, imgAttrs))
            ),
            badges.map(function (badge) {
                return _react2.default.createElement(
                    'span',
                    {
                        key: badge.className,
                        className: (0, _classnames2.default)('badge', badge.className, {
                            'badge-hidden': visibleBadge !== badge.className
                        }),
                        'aria-hidden': !visibleBadge
                    },
                    badge.text
                );
            })
        );
    };

    Avatar.propTypes = {
        alt: _propTypes2.default.string,
        avatarAttrs: _propTypes2.default.object,
        avatarSrc: _propTypes2.default.string.isRequired,
        badges: _propTypes2.default.array,
        isProject: _propTypes2.default.bool,
        className: _propTypes2.default.string,
        size: _propTypes2.default.string,
        title: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.string]),
        tooltip: _propTypes2.default.bool,
        visibleBadge: _propTypes2.default.string
    };

    Avatar.defaultProps = {
        alt: null,
        avatarAttrs: {},
        badges: [],
        isProject: false,
        className: null,
        size: 'small',
        title: null,
        tooltip: false,
        visibleBadge: null
    };

    /**
     * A wrapper to determine whether to show the avatar's display name or not.
     * @param {Object} props - The component props
     * @returns {ReactElement}
     */
    var AvatarWrapper = function AvatarWrapper(props) {
        var avatarProps = props.avatarProps;


        if (!props.withName) {
            return _react2.default.createElement(Avatar, babelHelpers.extends({}, avatarProps, {
                className: (0, _classnames2.default)(avatarProps.className, props.className)
            }));
        }

        return _react2.default.createElement(
            'div',
            {
                className: (0, _classnames2.default)(props.className, 'avatar-with-name'),
                title: avatarProps.tooltip ? avatarProps.title : undefined
            },
            _react2.default.createElement(Avatar, babelHelpers.extends({}, avatarProps, { tooltip: false })),
            _react2.default.createElement(AvatarDisplay, {
                display: avatarProps.display,
                href: props.withLink ? avatarProps.displayLink : null
            })
        );
    };

    /**
     * The display name for an avatar, which may or may not be linked.
     * @param {Object} props - Component props
     * @returns {ReactElement}
     */
    var AvatarDisplay = function AvatarDisplay(props) {
        var display = props.display,
            href = props.href;


        if (href) {
            return _react2.default.createElement(
                'a',
                { className: 'name', href: href },
                display
            );
        }

        return _react2.default.createElement(
            'span',
            { className: 'name' },
            display
        );
    };
});