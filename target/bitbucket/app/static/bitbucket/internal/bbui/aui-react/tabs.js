define('bitbucket/internal/bbui/aui-react/tabs', ['exports', 'classnames', 'prop-types', 'react'], function (exports, _classnames, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Tabs = exports.Tab = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var Tab = exports.Tab = function Tab(_ref) {
        var children = _ref.children;

        return _react2.default.createElement(
            'div',
            { className: 'tabs-pane active-pane' },
            children
        );
    };

    Tab.propTypes = {
        title: _propTypes2.default.string.isRequired,
        children: _propTypes2.default.node.isRequired
    };

    var Tabs = exports.Tabs = function (_React$Component) {
        babelHelpers.inherits(Tabs, _React$Component);

        function Tabs(props) {
            babelHelpers.classCallCheck(this, Tabs);

            var _this = babelHelpers.possibleConstructorReturn(this, (Tabs.__proto__ || Object.getPrototypeOf(Tabs)).call(this, props));

            _this.onChange = function (index) {
                _this.setState(function () {
                    return {
                        selectedIndex: index
                    };
                });
            };

            _this.state = {
                selectedIndex: props.startingIndex || 0
            };
            return _this;
        }

        babelHelpers.createClass(Tabs, [{
            key: 'render',
            value: function render() {
                var _this2 = this;

                var _props = this.props,
                    children = _props.children,
                    className = _props.className;
                var selectedIndex = this.state.selectedIndex;


                var activeTab = _react2.default.Children.toArray(children)[selectedIndex];

                return _react2.default.createElement(
                    'div',
                    { className: 'aui-tabs horizontal-tabs ' + (className || '') },
                    _react2.default.createElement(
                        'ul',
                        { className: 'tabs-menu' },
                        _react2.default.Children.map(children, function (x, index) {
                            return _react2.default.createElement(
                                'li',
                                {
                                    className: (0, _classnames2.default)('menu-item', {
                                        'active-tab': index === selectedIndex
                                    })
                                },
                                _react2.default.createElement(
                                    'a',
                                    { onClick: function onClick() {
                                            return _this2.onChange(index);
                                        }, role: 'button', tabIndex: 0 },
                                    x.props.title
                                )
                            );
                        })
                    ),
                    activeTab
                );
            }
        }]);
        return Tabs;
    }(_react2.default.Component);

    Tabs.propTypes = {
        children: _propTypes2.default.node.isRequired,
        onChange: _propTypes2.default.func,
        startingIndex: _propTypes2.default.number,
        className: _propTypes2.default.string
    };
});