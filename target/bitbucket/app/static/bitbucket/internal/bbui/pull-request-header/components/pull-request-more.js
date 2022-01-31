define('bitbucket/internal/bbui/pull-request-header/components/pull-request-more', ['module', 'exports', 'classnames', 'jquery', 'lodash', 'prop-types', 'react', 'bitbucket/internal/enums', 'bitbucket/internal/impl/web-fragments', '../../aui-react/component'], function (module, exports, _classnames, _jquery, _lodash, _propTypes, _react, _enums, _webFragments, _component) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _webFragments2 = babelHelpers.interopRequireDefault(_webFragments);

    var _component2 = babelHelpers.interopRequireDefault(_component);

    var propTypes = {
        onMoreAction: _propTypes2.default.func.isRequired,
        isWatching: _propTypes2.default.bool.isRequired,
        conditions: _propTypes2.default.objectOf(_propTypes2.default.bool).isRequired,
        pullRequest: _propTypes2.default.object.isRequired
    };

    var PullRequestMore = function (_Component) {
        babelHelpers.inherits(PullRequestMore, _Component);

        function PullRequestMore() {
            babelHelpers.classCallCheck(this, PullRequestMore);

            var _this = babelHelpers.possibleConstructorReturn(this, (PullRequestMore.__proto__ || Object.getPrototypeOf(PullRequestMore)).call(this));

            _this.dropdownIsVisible = false;

            var reasonableDelay = 50;
            _this.throttledTriggerHideOnScroll = _lodash2.default.throttle(function () {
                if (this.dropdownIsVisible) {
                    (0, _jquery2.default)('.pull-request-more-trigger').trigger('aui-button-invoke');
                }
            }.bind(_this), reasonableDelay);
            return _this;
        }

        babelHelpers.createClass(PullRequestMore, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                // hide the more menu when it's supposed to be closed
                // For whatever reason (probably a react / non-react conflict) the more menu doesn't hide itself properly
                // and instead hangs around too long. We force it to hide here.
                (0, _jquery2.default)('#pull-request-header-more').on({
                    'aui-dropdown2-show': function auiDropdown2Show() {
                        _this2.dropdownIsVisible = true;
                    },
                    'aui-dropdown2-hide': function auiDropdown2Hide(event) {
                        (0, _jquery2.default)(event.target).hide();
                        _this2.dropdownIsVisible = false;
                    }
                });

                (0, _jquery2.default)(document).on('scroll', this.throttledTriggerHideOnScroll);
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                (0, _jquery2.default)('#pull-request-header-more').off('aui-dropdown2-hide');
                (0, _jquery2.default)(document).off('scroll', this.throttledTriggerHideOnScroll);
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                var editMenuItem = void 0;
                var declineMenuItem = void 0;
                var deleteMenuItem = void 0;
                var pullRequestIsOpen = this.props.pullRequest.state === _enums.PullRequestState.OPEN;
                var pullRequestIsMerged = this.props.pullRequest.state === _enums.PullRequestState.MERGED;

                var addonActions = _webFragments2.default.getWebItems('bitbucket.pullrequest.action', {
                    pullRequest: this.props.pullRequest,
                    conditions: this.props.conditions
                });
                var deprecatedActions = _lodash2.default.flatten(_webFragments2.default.getWebSections('bitbucket.internal.pullrequest.toolbar.deprecated').map(function (section) {
                    return _webFragments2.default.getWebItems('bitbucket.internal.pullrequest.toolbar.deprecated/' + section.key);
                }));

                if (this.props.conditions.canEdit && !pullRequestIsMerged) {
                    // disallow editing merged pull requests.
                    editMenuItem = _react2.default.createElement(
                        'li',
                        null,
                        _react2.default.createElement(
                            'button',
                            {
                                className: 'aui-button aui-button-link',
                                role: 'menuitem',
                                'data-action': 'edit'
                            },
                            AJS.I18n.getText('bitbucket.component.pull.request.edit')
                        )
                    );
                }
                if (this.props.conditions.canDecline && pullRequestIsOpen) {
                    declineMenuItem = _react2.default.createElement(
                        'li',
                        null,
                        _react2.default.createElement(
                            'button',
                            {
                                className: 'aui-button aui-button-link',
                                role: 'menuitem',
                                'data-action': 'decline'
                            },
                            AJS.I18n.getText('bitbucket.component.pull.request.decline')
                        )
                    );
                }
                if (this.props.conditions.canDelete && !pullRequestIsMerged) {
                    deleteMenuItem = _react2.default.createElement(
                        'li',
                        null,
                        _react2.default.createElement(
                            'button',
                            {
                                className: 'aui-button aui-button-link',
                                role: 'menuitem',
                                'data-action': 'delete'
                            },
                            AJS.I18n.getText('bitbucket.component.pull.request.delete')
                        )
                    );
                }
                return _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'button',
                        {
                            className: 'pull-request-more-trigger aui-button aui-button-subtle aui-dropdown2-trigger aui-dropdown2-trigger-arrowless',
                            'aria-haspopup': 'true',
                            'aria-owns': 'pull-request-header-more'
                        },
                        _react2.default.createElement(
                            'span',
                            { className: 'aui-icon aui-icon-small aui-iconfont-more' },
                            AJS.I18n.getText('bitbucket.component.pull.request.more')
                        )
                    ),
                    _react2.default.createElement(
                        _component2.default,
                        {
                            id: 'pull-request-header-more',
                            markup: '<div class="aui-style-default aui-dropdown2"></div>',
                            wrapperClass: 'aui-dropdown2-section'
                        },
                        _react2.default.createElement(
                            'ul',
                            {
                                className: 'aui-list-truncate',
                                onClick: function onClick(e) {
                                    return _this3.props.onMoreAction(e.target.dataset.action);
                                },
                                role: 'presentation'
                            },
                            editMenuItem,
                            declineMenuItem,
                            deleteMenuItem,
                            _react2.default.createElement(
                                'li',
                                null,
                                _react2.default.createElement(
                                    'button',
                                    {
                                        className: 'aui-button aui-button-link',
                                        role: 'menuitem',
                                        'data-action': 'watch'
                                    },
                                    this.props.isWatching ? AJS.I18n.getText('bitbucket.component.pull.request.unwatch') : AJS.I18n.getText('bitbucket.component.pull.request.watch')
                                )
                            ),
                            addonActions.concat(deprecatedActions).map(function (webItem) {
                                return _react2.default.createElement(
                                    'li',
                                    { key: webItem.completeModuleKey || webItem.key },
                                    webItem.url ? _react2.default.createElement(
                                        'a',
                                        {
                                            href: webItem.url,
                                            className: webItem.cssClass,
                                            id: webItem.id,
                                            title: webItem.tooltip
                                        },
                                        webItem.text
                                    ) : _react2.default.createElement(
                                        'button',
                                        {
                                            className: (0, _classnames2.default)('aui-button aui-button-link', webItem.cssClass),
                                            role: 'menuitem',
                                            id: webItem.id,
                                            title: webItem.tooltip
                                        },
                                        webItem.text
                                    )
                                );
                            })
                        )
                    )
                );
            }
        }]);
        return PullRequestMore;
    }(_react.Component);

    PullRequestMore.propTypes = propTypes;

    exports.default = PullRequestMore;
    module.exports = exports['default'];
});