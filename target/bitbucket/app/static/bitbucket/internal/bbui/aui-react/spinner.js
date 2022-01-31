define('bitbucket/internal/bbui/aui-react/spinner', ['exports', 'jquery', 'prop-types', 'react', 'react-dom'], function (exports, _jquery, _propTypes, _react, _reactDom) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SpinnerSize = undefined;

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var SpinnerSize = exports.SpinnerSize = {
        SMALL: 'small',
        MEDIUM: 'medium',
        LARGE: 'large'
    };

    var Spinner = function (_Component) {
        babelHelpers.inherits(Spinner, _Component);

        function Spinner() {
            babelHelpers.classCallCheck(this, Spinner);
            return babelHelpers.possibleConstructorReturn(this, (Spinner.__proto__ || Object.getPrototypeOf(Spinner)).apply(this, arguments));
        }

        babelHelpers.createClass(Spinner, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                this.spin();
            }
        }, {
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(nextProps) {
                return this.props.size !== nextProps.size;
            }
        }, {
            key: 'componentDidUpdate',
            value: function componentDidUpdate() {
                this.spinStop();
                this.spin();
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                this.spinStop();
            }
        }, {
            key: 'spin',
            value: function spin() {
                (0, _jquery2.default)(_reactDom2.default.findDOMNode(this)).spin(this.props.size || SpinnerSize.SMALL, {
                    zIndex: 'inherit'
                });
            }
        }, {
            key: 'spinStop',
            value: function spinStop() {
                (0, _jquery2.default)(_reactDom2.default.findDOMNode(this)).spinStop();
            }
        }, {
            key: 'render',
            value: function render() {
                return _react2.default.createElement('div', { className: 'bb-spinner' });
            }
        }]);
        return Spinner;
    }(_react.Component);

    Spinner.propTypes = {
        size: _propTypes2.default.oneOf([SpinnerSize.SMALL, SpinnerSize.MEDIUM, SpinnerSize.LARGE])
    };
    exports.default = Spinner;
});