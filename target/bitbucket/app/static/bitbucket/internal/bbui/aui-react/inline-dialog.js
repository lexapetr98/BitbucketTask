define('bitbucket/internal/bbui/aui-react/inline-dialog', ['exports', 'classnames', 'lodash', 'prop-types', 'react', 'react-dom', './component'], function (exports, _classnames, _lodash, _propTypes, _react, _reactDom, _component) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.InlineDialogTrigger = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _component2 = babelHelpers.interopRequireDefault(_component);

    var InlineDialogTrigger = exports.InlineDialogTrigger = function (_Component) {
        babelHelpers.inherits(InlineDialogTrigger, _Component);

        function InlineDialogTrigger(props) {
            babelHelpers.classCallCheck(this, InlineDialogTrigger);

            var _this = babelHelpers.possibleConstructorReturn(this, (InlineDialogTrigger.__proto__ || Object.getPrototypeOf(InlineDialogTrigger)).call(this, props));

            _this.elementType = 'button';

            _this.triggerProps = {
                'aria-controls': props.dialogId,
                'aria-haspopup': true,
                className: (0, _classnames2.default)('aui-button', props.className),
                'data-aui-trigger': true,
                role: 'button',
                title: props.title,
                onFocus: props.onFocus,
                onBlur: props.onBlur
            };

            if (props.href) {
                _this.triggerProps = babelHelpers.extends({}, _this.triggerProps, {
                    className: props.className,
                    href: props.href,
                    tabIndex: '0'
                });
                _this.elementType = 'a';
            }
            return _this;
        }

        babelHelpers.createClass(InlineDialogTrigger, [{
            key: 'render',
            value: function render() {
                return _react2.default.createElement(this.elementType, this.triggerProps, this.props.children);
            }
        }]);
        return InlineDialogTrigger;
    }(_react.Component);

    InlineDialogTrigger.propTypes = {
        children: _propTypes2.default.node,
        className: _propTypes2.default.string,
        dialogId: _propTypes2.default.string.isRequired,
        href: _propTypes2.default.string,
        title: _propTypes2.default.string,
        onFocus: _propTypes2.default.func,
        onBlur: _propTypes2.default.func
    };
    InlineDialogTrigger.defaultProps = {
        className: '',
        href: '',
        title: ''
    };

    var InlineDialog = function (_Component2) {
        babelHelpers.inherits(InlineDialog, _Component2);

        function InlineDialog() {
            var _ref;

            var _temp, _this2, _ret;

            babelHelpers.classCallCheck(this, InlineDialog);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this2 = babelHelpers.possibleConstructorReturn(this, (_ref = InlineDialog.__proto__ || Object.getPrototypeOf(InlineDialog)).call.apply(_ref, [this].concat(args))), _this2), _this2.onHide = function (e) {
                if ((0, _lodash.isFunction)(_this2.props.onHide)) {
                    (0, _lodash.defer)(function () {
                        return _this2.props.onHide(e);
                    });
                }
            }, _this2.onShow = function (e) {
                if ((0, _lodash.isFunction)(_this2.props.onShow)) {
                    (0, _lodash.defer)(function () {
                        return _this2.props.onShow(e);
                    });
                }
            }, _temp), babelHelpers.possibleConstructorReturn(_this2, _ret);
        }

        babelHelpers.createClass(InlineDialog, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                // scope the event listeners to the current inline dialog only
                this._el = (0, _reactDom.findDOMNode)(this).querySelector('aui-inline-dialog');
                this._el.addEventListener('aui-hide', this.onHide);
                this._el.addEventListener('aui-show', this.onShow);
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                this._el.removeEventListener('aui-hide', this.onHide);
                this._el.removeEventListener('aui-show', this.onShow);
            }
        }, {
            key: 'render',
            value: function render() {
                var _props = this.props,
                    alignment = _props.alignment,
                    children = _props.children,
                    className = _props.className,
                    id = _props.id,
                    respondsTo = _props.respondsTo;

                return _react2.default.createElement(
                    _component2.default,
                    {
                        id: id,
                        markup: '<aui-inline-dialog\n                            id="' + id + '"\n                            class="' + className + '"\n                            alignment="' + alignment + '"\n                            responds-to="' + respondsTo + '"\n                         ></aui-inline-dialog>',
                        containerSelector: '#' + id + ' .aui-inline-dialog-contents'
                    },
                    children
                );
            }
        }]);
        return InlineDialog;
    }(_react.Component);

    InlineDialog.propTypes = {
        alignment: _propTypes2.default.string,
        children: _propTypes2.default.node,
        className: _propTypes2.default.string,
        id: _propTypes2.default.string.isRequired,
        onHide: _propTypes2.default.func,
        onShow: _propTypes2.default.func,
        respondsTo: _propTypes2.default.oneOf(['toggle', 'hover'])
    };
    InlineDialog.defaultProps = {
        alignment: 'right middle',
        className: '',
        respondsTo: 'toggle'
    };
    exports.default = InlineDialog;
});