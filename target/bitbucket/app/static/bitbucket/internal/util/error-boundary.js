define('bitbucket/internal/util/error-boundary', ['module', 'exports', '@atlassian/aui', 'prop-types', 'react'], function (module, exports, _aui, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var ErrorBoundary = function (_Component) {
        babelHelpers.inherits(ErrorBoundary, _Component);

        function ErrorBoundary() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, ErrorBoundary);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = ErrorBoundary.__proto__ || Object.getPrototypeOf(ErrorBoundary)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(ErrorBoundary, [{
            key: 'componentDidCatch',
            value: function componentDidCatch(error) {
                this.setState({ error: error });
            }
        }, {
            key: 'render',
            value: function render() {
                var _props = this.props,
                    renderFallback = _props.renderFallback,
                    children = _props.children;
                var error = this.state.error;


                if (error) {
                    return renderFallback ? renderFallback(error, children) : _react2.default.createElement(
                        'h2',
                        null,
                        _aui.I18n.getText('bitbucket.web.we.screwed.up')
                    );
                }
                return children;
            }
        }]);
        return ErrorBoundary;
    }(_react.Component);

    ErrorBoundary.propTypes = {
        renderFallback: _propTypes2.default.func
    };
    exports.default = ErrorBoundary;
    module.exports = exports['default'];
});