define('bitbucket/internal/util/components/with-keyboard-list-selector', ['module', 'exports', 'prop-types', 'react', 'bitbucket/internal/util/components/react-functional', 'bitbucket/internal/util/shortcuts'], function (module, exports, _propTypes, _react, _reactFunctional, _shortcuts) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = withKeyboardListSelector;

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    var defaultArguments = {
        prevKeyName: 'k',
        nextKeyName: 'j'
    };

    function withKeyboardListSelector(args) {
        var _defaultArguments$arg = babelHelpers.extends({}, defaultArguments, args),
            prevKeyName = _defaultArguments$arg.prevKeyName,
            nextKeyName = _defaultArguments$arg.nextKeyName;

        return function (WrappedComponent) {
            var KeyboardListSelector = function (_Component) {
                babelHelpers.inherits(KeyboardListSelector, _Component);

                function KeyboardListSelector() {
                    var _ref, _shortcuts$createKeyb;

                    var _temp, _this, _ret;

                    babelHelpers.classCallCheck(this, KeyboardListSelector);

                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = KeyboardListSelector.__proto__ || Object.getPrototypeOf(KeyboardListSelector)).call.apply(_ref, [this].concat(args))), _this), _this.shortcutsListener = _shortcuts2.default.createKeyboardShortcutsHandler((_shortcuts$createKeyb = {}, babelHelpers.defineProperty(_shortcuts$createKeyb, prevKeyName, function () {
                        return _this.goToPrevItem();
                    }), babelHelpers.defineProperty(_shortcuts$createKeyb, nextKeyName, function () {
                        return _this.goToNextItem();
                    }), _shortcuts$createKeyb)), _this.goToPrevItem = function () {
                        _this.props.selectNextItem();
                    }, _this.goToNextItem = function () {
                        _this.props.selectPrevItem();
                    }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
                }

                babelHelpers.createClass(KeyboardListSelector, [{
                    key: 'componentDidMount',
                    value: function componentDidMount() {
                        window.addEventListener('keypress', this.shortcutsListener, true);
                    }
                }, {
                    key: 'componentWillUnmount',
                    value: function componentWillUnmount() {
                        window.removeEventListener('keypress', this.shortcutsListener, true);
                    }
                }, {
                    key: 'render',
                    value: function render() {
                        return _react2.default.createElement(WrappedComponent, this.props);
                    }
                }]);
                return KeyboardListSelector;
            }(_react.Component);

            KeyboardListSelector.propTypes = {
                selectNextItem: _propTypes2.default.func.isRequired,
                selectPrevItem: _propTypes2.default.func.isRequired
            };


            KeyboardListSelector.displayName = 'KeyboardListSelector(' + (0, _reactFunctional.getDisplayName)(WrappedComponent) + ')';

            return KeyboardListSelector;
        };
    }
    module.exports = exports['default'];
});