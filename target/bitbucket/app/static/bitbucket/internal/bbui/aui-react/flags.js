define('bitbucket/internal/bbui/aui-react/flags', ['exports', 'classnames', 'lodash', 'prop-types', 'react'], function (exports, _classnames, _lodash, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Flag = exports.flagType = exports.closeType = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var AUTO_CLOSE_TIME = 5000;

    var closeType = exports.closeType = {
        AUTO: 'auto',
        MANUAL: 'manual',
        NEVER: 'never'
    };

    var flagType = exports.flagType = {
        ERROR: 'error',
        INFO: 'info',
        SUCCESS: 'success',
        WARNING: 'warning'
    };

    var Flag = exports.Flag = function (_Component) {
        babelHelpers.inherits(Flag, _Component);

        function Flag() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, Flag);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = Flag.__proto__ || Object.getPrototypeOf(Flag)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
                hidden: undefined
            }, _this.onTransitionEnd = (0, _lodash.debounce)(function () {
                var _this$props = _this.props,
                    id = _this$props.id,
                    onClose = _this$props.onClose;


                if (_this.state.hidden && onClose) {
                    onClose(id);
                }
            }, 250), _this.close = function () {
                return _this.setState({ hidden: true });
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(Flag, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                //sets the initial value of `aria-hidden` after the element is in the DOM in order to trigger the CSS transition
                (0, _lodash.defer)(function () {
                    return _this2.setState({ hidden: false });
                });

                if (this.props.close === closeType.AUTO) {
                    this.autoCloseTimeout = setTimeout(this.close, AUTO_CLOSE_TIME);
                }
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                if (this.autoCloseTimeout) {
                    //prevent the auto close timeout from triggering a state change after the component has unmounted
                    clearTimeout(this.autoCloseTimeout);
                }
            }

            //There are 3 transitions that apply to a closing flag, with different timings (0.8s, 1s, 1s). Wait for the last one.
            //eslint-disable-line no-magic-numbers

        }, {
            key: 'render',
            value: function render() {
                var _props = this.props,
                    body = _props.body,
                    close = _props.close,
                    title = _props.title,
                    type = _props.type;
                var hidden = this.state.hidden;


                return _react2.default.createElement(
                    'div',
                    {
                        className: 'aui-flag',
                        'aria-hidden': (0, _lodash.isBoolean)(hidden) ? '' + hidden : hidden,
                        onTransitionEnd: this.onTransitionEnd
                    },
                    _react2.default.createElement(
                        'div',
                        {
                            className: (0, _classnames2.default)('aui-message', 'aui-message-' + type, 'shadowed', type, {
                                closeable: close !== closeType.NEVER,
                                'aui-will-close': close === closeType.AUTO
                            })
                        },
                        _react2.default.createElement(
                            'p',
                            { className: 'title' },
                            _react2.default.createElement(
                                'strong',
                                null,
                                title
                            )
                        ),
                        body,
                        close === closeType.AUTO || close === closeType.MANUAL ? _react2.default.createElement('span', {
                            className: 'aui-icon icon-close',
                            role: 'button',
                            tabIndex: '0',
                            onClick: this.close
                        }) : null
                    )
                );
            }
        }]);
        return Flag;
    }(_react.Component);

    Flag.propTypes = {
        body: _propTypes2.default.node,
        close: _propTypes2.default.oneOf((0, _lodash.values)(closeType)),
        id: _propTypes2.default.string.isRequired,
        onClose: _propTypes2.default.func,
        title: _propTypes2.default.string,
        type: _propTypes2.default.oneOf((0, _lodash.values)(flagType))
    };
    Flag.defaultProps = {
        close: closeType.MANUAL,
        type: flagType.INFO
    };


    /*
     * NOTE: Never add flags before document ready, or else the `makeCloseable` function in the AUI Messages setup will attach it's own close behaviour
     * and fuck things up
     */
    var Flags = function Flags(_ref2) {
        var flags = _ref2.flags,
            onClose = _ref2.onClose;
        return _react2.default.createElement(
            'div',
            { id: 'aui-flag-container' },
            flags && flags.map(function (flag) {
                return _react2.default.createElement(Flag, babelHelpers.extends({ key: flag.id }, flag, { onClose: onClose }));
            })
        );
    };

    Flags.propTypes = {
        flags: _propTypes2.default.array,
        onClose: _propTypes2.default.func
    };

    exports.default = Flags;
});