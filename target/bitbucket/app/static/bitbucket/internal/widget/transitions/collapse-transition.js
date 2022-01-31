define('bitbucket/internal/widget/transitions/collapse-transition', ['module', 'exports', 'prop-types', 'react', 'react-transition-group'], function (module, exports, _propTypes, _react, _reactTransitionGroup) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var CollapseTransition = function (_PureComponent) {
        babelHelpers.inherits(CollapseTransition, _PureComponent);

        function CollapseTransition() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, CollapseTransition);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = CollapseTransition.__proto__ || Object.getPrototypeOf(CollapseTransition)).call.apply(_ref, [this].concat(args))), _this), _this.onEnter = function (el) {
                el.style.height = el.clientHeight + 'px';
            }, _this.onEntering = function (el) {
                setTimeout(function () {
                    el.style.height = 0;
                });
            }, _this.onEntered = function (el) {
                el.style.height = 0;
                el.style.display = 'none';
            }, _this.onExit = function (el) {
                el.style.height = 0;
                el.style.display = '';
            }, _this.onExiting = function (el) {
                setTimeout(function () {
                    el.style.height = el.scrollHeight + 'px';
                });
            }, _this.onExited = function (el) {
                el.style.height = 'auto';
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(CollapseTransition, [{
            key: 'render',
            value: function render() {
                var _props = this.props,
                    isCollapsed = _props.isCollapsed,
                    children = _props.children;

                var duration = CollapseTransition.DURATION;

                var styles = {
                    transition: 'height ' + duration + 'ms ease-in-out',
                    overflow: 'hidden'
                };

                if (!this.wasRendered) {
                    styles.height = isCollapsed ? '0' : 'auto';
                    styles.display = isCollapsed ? 'none' : null;

                    this.wasRendered = true;
                }

                return _react2.default.createElement(
                    _reactTransitionGroup.Transition,
                    {
                        timeout: duration,
                        'in': isCollapsed,
                        unmountOnExit: false,
                        onEnter: this.onEnter,
                        onEntering: this.onEntering,
                        onEntered: this.onEntered,
                        onExit: this.onExit,
                        onExiting: this.onExiting,
                        onExited: this.onExited
                    },
                    children(styles)
                );
            }
        }]);
        return CollapseTransition;
    }(_react.PureComponent);

    CollapseTransition.DURATION = 250;
    CollapseTransition.propTypes = {
        children: _propTypes2.default.node.isRequired,
        isCollapsed: _propTypes2.default.bool
    };
    CollapseTransition.defaultProps = {
        isCollapsed: false
    };
    exports.default = CollapseTransition;
    module.exports = exports['default'];
});