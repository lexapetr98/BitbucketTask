define('bitbucket/internal/bbui/self-reviewer/self-reviewer', ['module', 'exports', '@atlassian/aui', 'classnames', 'lodash', 'prop-types', 'react', 'react-dom', 'bitbucket/internal/enums', 'bitbucket/internal/util/i18n-html', '../aui-react/inline-dialog', '../reviewer-avatar/reviewer-avatar', '../tipsy/tipsy'], function (module, exports, _aui, _classnames, _lodash, _propTypes, _react, _reactDom, _enums, _i18nHtml, _inlineDialog, _reviewerAvatar, _tipsy) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _i18nHtml2 = babelHelpers.interopRequireDefault(_i18nHtml);

    var _inlineDialog2 = babelHelpers.interopRequireDefault(_inlineDialog);

    var _reviewerAvatar2 = babelHelpers.interopRequireDefault(_reviewerAvatar);

    var _tipsy2 = babelHelpers.interopRequireDefault(_tipsy);

    var propTypes = {
        currentUserAsReviewer: _propTypes2.default.object,
        isWatching: _propTypes2.default.bool,
        onSelfClick: _propTypes2.default.func.isRequired,
        removeSelfModalId: _propTypes2.default.string.isRequired
    };

    var SELF_AVATAR_CLASSNAME = 'self-avatar';

    var SelfReviewer = function (_Component) {
        babelHelpers.inherits(SelfReviewer, _Component);

        function SelfReviewer() {
            babelHelpers.classCallCheck(this, SelfReviewer);

            var _this = babelHelpers.possibleConstructorReturn(this, (SelfReviewer.__proto__ || Object.getPrototypeOf(SelfReviewer)).call(this));

            _this.focusSelfButton = function () {
                // wait for the item to be in the DOM/visible before attempting to set focus
                (0, _lodash.defer)(function () {
                    (0, _reactDom.findDOMNode)(_this).querySelector('button').focus();
                });
            };

            // hover state is managed by js because chrome
            // does not fire mouse events on elements that
            // have a parent that is animating
            _this.state = { hovered: false };
            return _this;
        }

        babelHelpers.createClass(SelfReviewer, [{
            key: 'mouseEnter',
            value: function mouseEnter(e) {
                this.setState({ hovered: true });
            }
        }, {
            key: 'mouseLeave',
            value: function mouseLeave(e) {
                this.setState({ hovered: false });
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                var initTipsyDelay = 500; // delay 'remove yourself' tipsy so it doesn't appear during animation
                var currentUserAsReviewer = this.props.currentUserAsReviewer;
                var unWatchCheckbox = _react2.default.createElement(
                    'p',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'self-reviewer-unwatch' },
                        _react2.default.createElement('input', {
                            id: 'self-reviewer-unwatch',
                            className: 'checkbox',
                            type: 'checkbox',
                            ref: function ref(el) {
                                _this2._unwatchCheckbox = el;
                            }
                        }),
                        _react2.default.createElement(
                            _i18nHtml2.default,
                            { params: [] },
                            _aui2.default.I18n.getText('bitbucket.component.self.reviewer.unwatch.html')
                        )
                    )
                );

                if (!currentUserAsReviewer) {
                    return _react2.default.createElement(
                        'div',
                        { className: 'self-avatar' },
                        _react2.default.createElement(
                            _tipsy2.default,
                            {
                                key: 'add-self',
                                title: _aui2.default.I18n.getText('bitbucket.component.self.reviewer.add'),
                                className: 'add-self'
                            },
                            _react2.default.createElement(
                                'button',
                                {
                                    onClick: function onClick() {
                                        _this2.setState({ hovered: false });
                                        _this2.props.onSelfClick(_enums.SelfAction.ADD_SELF);
                                        _this2.focusSelfButton();
                                    },
                                    className: 'aui-button'
                                },
                                '+'
                            )
                        )
                    );
                }

                return _react2.default.createElement(
                    'div',
                    {
                        className: (0, _classnames2.default)(SELF_AVATAR_CLASSNAME, {
                            jsHover: this.state.hovered,
                            reviewing: this.props.currentUserAsReviewer
                        }),
                        onMouseEnter: function onMouseEnter() {
                            return _this2.mouseEnter();
                        },
                        onMouseLeave: function onMouseLeave() {
                            return _this2.mouseLeave();
                        },
                        role: 'presentation'
                    },
                    _react2.default.createElement(
                        _tipsy2.default,
                        {
                            key: 'remove-self',
                            title: _aui2.default.I18n.getText('bitbucket.component.self.reviewer.remove'),
                            className: 'remove-self',
                            delay: initTipsyDelay
                        },
                        _react2.default.createElement(
                            _inlineDialog.InlineDialogTrigger,
                            {
                                dialogId: this.props.removeSelfModalId,
                                className: 'aui-button',
                                onFocus: function onFocus() {
                                    return _this2.mouseEnter();
                                },
                                onBlur: function onBlur() {
                                    return _this2.mouseLeave();
                                }
                            },
                            '\u2013'
                        )
                    ),
                    _react2.default.createElement(
                        _inlineDialog2.default,
                        {
                            key: 'remove_self_dialog',
                            id: this.props.removeSelfModalId,
                            className: 'remove-self-dialog',
                            alignment: 'bottom right',
                            onShow: function onShow(e) {
                                // set focus to the first focusable item in the dialog
                                var focusEl = e.target.querySelectorAll('input, button, a').item(0);
                                // wait for the item to be in the DOM/visible before attempting to set focus
                                focusEl.focus();
                            },
                            onHide: this.focusSelfButton
                        },
                        _react2.default.createElement(
                            'h5',
                            null,
                            _aui2.default.I18n.getText('bitbucket.component.self.reviewer.remove.confirm.header')
                        ),
                        _react2.default.createElement(
                            'p',
                            null,
                            _aui2.default.I18n.getText('bitbucket.component.self.reviewer.remove.confirm')
                        ),
                        this.props.isWatching ? unWatchCheckbox : null,
                        _react2.default.createElement(
                            'p',
                            null,
                            _react2.default.createElement(
                                'button',
                                {
                                    className: 'aui-button',
                                    onClick: function onClick(e) {
                                        _this2.props.onSelfClick(_enums.SelfAction.REMOVE_SELF, _this2._unwatchCheckbox ? _this2._unwatchCheckbox.checked : null);
                                        // explicitly close the dialog so the hide callback is called
                                        document.getElementById(_this2.props.removeSelfModalId).open = false;
                                    }
                                },
                                _aui2.default.I18n.getText('bitbucket.component.self.reviewer.remove.confirm.button')
                            )
                        )
                    ),
                    _react2.default.createElement(_reviewerAvatar2.default, { reviewer: currentUserAsReviewer, tooltip: false })
                );
            }
        }]);
        return SelfReviewer;
    }(_react.Component);

    SelfReviewer.propTypes = propTypes;

    exports.default = SelfReviewer;
    module.exports = exports['default'];
});