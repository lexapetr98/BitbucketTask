define('bitbucket/internal/bbui/tipsy/tipsy', ['module', 'exports', 'jquery', 'prop-types', 'react'], function (module, exports, _jquery, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var Tipsy = function (_Component) {
        babelHelpers.inherits(Tipsy, _Component);

        function Tipsy() {
            babelHelpers.classCallCheck(this, Tipsy);
            return babelHelpers.possibleConstructorReturn(this, (Tipsy.__proto__ || Object.getPrototypeOf(Tipsy)).apply(this, arguments));
        }

        babelHelpers.createClass(Tipsy, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                var _props = this.props,
                    gravity = _props.gravity,
                    offset = _props.offset,
                    hoverable = _props.hoverable,
                    tooltipClassName = _props.tooltipClassName,
                    delay = _props.delay;


                (0, _jquery2.default)(this.el).tooltip({
                    gravity: gravity,
                    offset: offset,
                    hoverable: hoverable,
                    className: tooltipClassName,
                    delayIn: delay,
                    title: function title() {
                        // reference the condition and title straight from props to avoid closing
                        // over the values; this allows them to be updated and passed through to this component.
                        if (_this2.props.condition) {
                            // The condition needs to be done at runtime to account for any layout changes
                            // that may happen between the rendering and when the tipsy needs to be displayed.
                            if (_this2.props.condition(_this2.el)) {
                                return _this2.props.title;
                            }
                            return '';
                        }
                        return _this2.props.title;
                    }
                });
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                (0, _jquery2.default)(this.el).tipsy('hide');
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                var _props2 = this.props,
                    children = _props2.children,
                    className = _props2.className,
                    title = _props2.title;


                return _react2.default.createElement(
                    'span',
                    {
                        ref: function ref(el) {
                            _this3.el = el;
                        },
                        className: className,
                        title: title
                    },
                    children
                );
            }
        }], [{
            key: 'isTruncatedCondition',
            value: function isTruncatedCondition(el) {
                return el.offsetWidth < el.scrollWidth;
            }
        }]);
        return Tipsy;
    }(_react.Component);

    Tipsy.propTypes = {
        children: _propTypes2.default.node,
        className: _propTypes2.default.string,
        delay: _propTypes2.default.number,
        gravity: _propTypes2.default.string,
        hoverable: _propTypes2.default.bool,
        offset: _propTypes2.default.number,
        title: _propTypes2.default.string,
        tooltipClassName: _propTypes2.default.string,
        condition: _propTypes2.default.func
    };
    Tipsy.defaultProps = {
        delay: 0,
        hoverable: true
    };
    exports.default = Tipsy;
    module.exports = exports['default'];
});