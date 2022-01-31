define('bitbucket/internal/bbui/aui-react/dialog', ['exports', '@atlassian/aui', 'classnames', 'lodash', 'prop-types', 'react', 'react-dom', 'bitbucket/internal/util/components/react-functional', 'bitbucket/internal/widget/icons/icons'], function (exports, _aui, _classnames, _lodash, _propTypes, _react, _reactDom, _reactFunctional, _icons) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getDialogContent = exports.DialogWithRef = exports.DialogSize = exports.DialogContent = exports.DialogFooter = exports.DialogHeader = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var AUIDialogZIndex = 3000;
    var AUIBlanketZIndex = 2980;

    // Each Dialog is rendered into it's own div container, and all of those div containers
    // are children of this one parent container.
    var getDialogContainer = (0, _lodash.once)(function () {
        var container = document.createElement('div');
        container.className = 'react-dialog-container'; // for developer sanity only
        document.body.appendChild(container);
        return container;
    });

    var DialogHeader = exports.DialogHeader = function DialogHeader(_ref) {
        var headerActionContent = _ref.headerActionContent,
            headerSecondaryContent = _ref.headerSecondaryContent,
            modal = _ref.modal,
            onClose = _ref.onClose,
            showCloseButton = _ref.showCloseButton,
            titleContent = _ref.titleContent;
        return _react2.default.createElement(
            'header',
            { className: 'aui-dialog2-header' },
            _react2.default.createElement(
                'h2',
                { className: 'aui-dialog2-header-main' },
                titleContent
            ),
            headerSecondaryContent ? _react2.default.createElement(
                'div',
                { className: 'aui-dialog2-header-secondary' },
                headerSecondaryContent
            ) : null,
            headerActionContent ? _react2.default.createElement(
                'div',
                { className: 'aui-dialog2-header-actions' },
                headerActionContent
            ) : null,
            !modal && onClose && showCloseButton ?
            /* eslint-disable jsx-a11y/anchor-is-valid */
            /* This HTML matches AUI's. We prioritised staying compliant with AUI over the a11y rules to make future upgrades easier. */
            _react2.default.createElement(
                'a',
                { className: 'aui-dialog2-header-close', href: '#', onClick: onClose },
                _react2.default.createElement(
                    _icons.CrossIcon,
                    null,
                    _aui.I18n.getText('bitbucket.web.dialog.button.close')
                )
            ) : /*eslint-enable jsx-a11y/anchor-is-valid*/
            null
        );
    };

    DialogHeader.propTypes = {
        headerSecondaryContent: _propTypes2.default.node,
        headerActionContent: _propTypes2.default.node,
        modal: _propTypes2.default.bool,
        onClose: _propTypes2.default.func,
        showCloseButton: _propTypes2.default.bool,
        titleContent: _propTypes2.default.node
    };

    var DialogFooter = exports.DialogFooter = function DialogFooter(_ref2) {
        var footerActionContent = _ref2.footerActionContent,
            footerHintContent = _ref2.footerHintContent;
        return _react2.default.createElement(
            'footer',
            { className: 'aui-dialog2-footer' },
            footerActionContent ? _react2.default.createElement(
                'div',
                { className: 'aui-dialog2-footer-actions' },
                footerActionContent
            ) : null,
            footerHintContent ? _react2.default.createElement(
                'div',
                { className: 'aui-dialog2-footer-hint' },
                footerHintContent
            ) : null
        );
    };

    DialogFooter.propTypes = {
        footerActionContent: _propTypes2.default.node,
        footerHintContent: _propTypes2.default.node
    };

    var DialogContent = exports.DialogContent = function DialogContent(_ref3) {
        var children = _ref3.children;
        return _react2.default.createElement(
            'div',
            { className: 'aui-dialog2-content' },
            children
        );
    };

    DialogContent.propTypes = {
        children: _propTypes2.default.node
    };

    var DialogSize = exports.DialogSize = {
        SMALL: 'small',
        MEDIUM: 'medium',
        LARGE: 'large',
        XLARGE: 'xlarge'
    };

    var requiredIf = function requiredIf(type, predicate) {
        return function (props) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return (predicate(props) ? type.isRequired : type).apply(undefined, [props].concat(args));
        };
    };

    // The name of a React prop we will use for forwarding the reference
    var forwarderRefProp = 'dialogRef';

    var Dialog = function (_PureComponent) {
        babelHelpers.inherits(Dialog, _PureComponent);

        function Dialog() {
            var _ref4;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, Dialog);

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref4 = Dialog.__proto__ || Object.getPrototypeOf(Dialog)).call.apply(_ref4, [this].concat(args))), _this), _this.container = document.createElement('div'), _this.onKeyDownEsc = function (_ref5) {
                var key = _ref5.key,
                    keyCode = _ref5.keyCode;
                var _this$props = _this.props,
                    modal = _this$props.modal,
                    onClose = _this$props.onClose;


                if ((key === 'Escape' || keyCode === _aui.keyCode.ESCAPE) && !modal && onClose) {
                    onClose();
                }
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(Dialog, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _document = document,
                    style = _document.body.style;


                this.allowBodyScroll = function (oldOverflow) {
                    return function () {
                        style.overflow = oldOverflow;
                    };
                }(style.overflow);
                style.overflow = 'hidden';
                addEventListener('keydown', this.onKeyDownEsc);

                getDialogContainer().appendChild(this.container);
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                this.allowBodyScroll();
                removeEventListener('keydown', this.onKeyDownEsc);
                getDialogContainer().removeChild(this.container);
            }
        }, {
            key: 'render',
            value: function render() {
                var _props = this.props,
                    children = _props.children,
                    className = _props.className,
                    headerSecondaryContent = _props.headerSecondaryContent,
                    headerActionContent = _props.headerActionContent,
                    footerActionContent = _props.footerActionContent,
                    footerHintContent = _props.footerHintContent,
                    id = _props.id,
                    modal = _props.modal,
                    onClose = _props.onClose,
                    showCloseButton = _props.showCloseButton,
                    size = _props.size,
                    titleContent = _props.titleContent,
                    warning = _props.warning;


                var dialogRef = this.props[forwarderRefProp];

                return (0, _reactDom.createPortal)(_react2.default.createElement(
                    'div',
                    { ref: dialogRef },
                    _react2.default.createElement(
                        'section',
                        {
                            role: 'dialog',
                            id: id,
                            className: (0, _classnames2.default)('aui-layer', 'aui-dialog2', 'aui-dialog2-' + size, { 'aui-dialog2-warning': warning }, className),
                            style: { zIndex: AUIDialogZIndex }
                        },
                        _react2.default.createElement(DialogHeader, {
                            headerActionContent: headerActionContent,
                            headerSecondaryContent: headerSecondaryContent,
                            modal: modal,
                            onClose: onClose,
                            showCloseButton: showCloseButton,
                            titleContent: titleContent
                        }),
                        _react2.default.createElement(
                            DialogContent,
                            null,
                            children
                        ),
                        footerActionContent || footerHintContent ? _react2.default.createElement(DialogFooter, { footerActionContent: footerActionContent, footerHintContent: footerHintContent }) : null
                    ),
                    _react2.default.createElement('div', {
                        className: 'aui-blanket',
                        style: { zIndex: AUIBlanketZIndex },
                        'aria-hidden': false,
                        onClick: modal ? null : onClose
                    })
                ), this.container);
            }
        }]);
        return Dialog;
    }(_react.PureComponent);

    Dialog.propTypes = {
        children: _propTypes2.default.node,
        className: _propTypes2.default.string,
        headerSecondaryContent: _propTypes2.default.node,
        headerActionContent: _propTypes2.default.node,
        footerActionContent: _propTypes2.default.node,
        footerHintContent: _propTypes2.default.node,
        id: _propTypes2.default.string,
        modal: _propTypes2.default.bool,
        onClose: requiredIf(_propTypes2.default.func, function (props) {
            return !props.modal;
        }), //Must specify an onClose if the dialog is not modal
        showCloseButton: _propTypes2.default.bool,
        size: _propTypes2.default.oneOf((0, _lodash.values)(DialogSize)),
        titleContent: _propTypes2.default.node,
        warning: _propTypes2.default.bool
    };
    Dialog.defaultProps = {
        modal: false,
        size: DialogSize.MEDIUM,
        showCloseButton: true,
        warning: false
    };
    exports.default = Dialog;
    var DialogWithRef = exports.DialogWithRef = (0, _reactFunctional.withForwardedRef)(forwarderRefProp)(Dialog);

    var getDialogContent = exports.getDialogContent = function getDialogContent(dialogEl) {
        return dialogEl.querySelector('.aui-dialog2-content');
    };
});