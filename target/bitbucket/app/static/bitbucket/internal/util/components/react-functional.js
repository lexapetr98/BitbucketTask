define('bitbucket/internal/util/components/react-functional', ['exports', 'lodash', 'create-react-class', 'react'], function (exports, _lodash, _createReactClass, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.withForwardedRef = exports.pure = exports.withLifecycle = exports.withPropsMapper = exports.getDisplayName = exports.compose = undefined;
    Object.defineProperty(exports, 'compose', {
        enumerable: true,
        get: function () {
            return _lodash.flowRight;
        }
    });

    var _createReactClass2 = babelHelpers.interopRequireDefault(_createReactClass);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    /**
     * Get the display name of a given React component. Falls back to 'Component' when cannot discover the component name.
     *
     * @param Component - A Component used to find a name
     * @returns {string} - Component name
     */
    var getDisplayName = exports.getDisplayName = function getDisplayName(Component) {
        if (typeof Component === 'string') {
            return Component;
        }

        return Component.displayName || Component.name || 'Component';
    };

    /**
     * HoC that takes a function and maps passed props into a new collection of props that are passed down to the
     * BaseComponent.
     *
     * For example:
     *
     * ```
     * withPropsMapper(({ myProp, ...props }) => {
     *  return {
     *     ...props,
     *     myProp: doSomething(myProp)
     *  };
     * )(MyComponent)
     * ```
     *
     * @param {function} propsMapper - A props mapper function that returns a collection of props
     * @returns {function} - React Component
     */
    var withPropsMapper = exports.withPropsMapper = function withPropsMapper(propsMapper) {
        return function (BaseComponent) {
            var Component = function Component(props) {
                return _react2.default.createElement(BaseComponent, propsMapper(props));
            };

            Component.displayName = 'PropsMapper(' + getDisplayName(BaseComponent) + ')';

            return Component;
        };
    };

    /**
     * HoC that takes a collection of React lifecycle functions and creates ad-hoc instance of React.Component class.
     * Any changes of state object made in a lifecycle method, by using setState, will be propagated down to the wrapped
     * BaseComponent as props.
     *
     * For example:
     *
     * ```
     * withLifecycle({
     *  componentDifMount() {
     *     doSomething(this.props.myProp).then(result => this.setState({ result }))
     *  }
     * })(MyComponent)
     * ```
     *
     * @param {Object.<string, function>} lifecycleMethods - A collection of React lifecycle functions
     * @returns {function} - React Component
     */
    var withLifecycle = exports.withLifecycle = function withLifecycle(lifecycleMethods) {
        return function (BaseComponent) {
            var Component = (0, _createReactClass2.default)(babelHelpers.extends({}, lifecycleMethods, {
                render: function render() {
                    return _react2.default.createElement(BaseComponent, this.props);
                }
            }));

            Component.displayName = 'Lifecycle(' + getDisplayName(BaseComponent) + ')';

            return Component;
        };
    };

    /**
     * Wraps a functional version of React component with an instance React.PureComponent class.
     *
     * @param {function} fnComponent - A functional version of React component
     * @returns {Pure} -  A wrapped Pure Component
     */
    var pure = exports.pure = function pure(fnComponent) {
        var Pure = function (_PureComponent) {
            babelHelpers.inherits(Pure, _PureComponent);

            function Pure() {
                babelHelpers.classCallCheck(this, Pure);
                return babelHelpers.possibleConstructorReturn(this, (Pure.__proto__ || Object.getPrototypeOf(Pure)).apply(this, arguments));
            }

            babelHelpers.createClass(Pure, [{
                key: 'render',
                value: function render() {
                    return fnComponent(this.props);
                }
            }]);
            return Pure;
        }(_react.PureComponent);

        Pure.displayName = 'Pure(' + getDisplayName(fnComponent) + ')';

        return Pure;
    };

    /**
     * HoC that creates a Component with a ref forwarding from an inner DOM element. More info about ref forwarding can be
     * found here https://reactjs.org/docs/forwarding-refs.html
     *
     * For example:
     *
     * ```
     * class MyComponent extends Component {
     *     render() {
     *         return (
     *              <div ref={this.props.myForwardRefProp}>
     *                  You can get assess to the inner div outside the MyComponent!
     *              </div>
     *         );
     *     }
     * }
     *
     * const MyComponentWithRef = withForwardedRef('myForwardRefProp')(MyComponent);
     *
     * // Usage
     * class WrapperComponent extends Components {
     *     myRef = React.createRef();
     *
     *     componentDidMount() {
     *         console.log(this.myRef.current) // A div DOM element
     *     }
     *
     *     render() {
     *         <MyComponentWithRef ref={this.myRef} />
     *     }
     * }
     * ```
     *
     * @param {string} forwardedRefProp - A name of the forwarded property that will proxy reference to the Component
     * @returns {function} - Wraped React Component
     */
    var withForwardedRef = exports.withForwardedRef = function withForwardedRef() {
        var forwardedRefProp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'forwardedRef';
        return function (Component) {
            var forwardRefComponent = function forwardRefComponent(props, ref) {
                var forwardedRefProps = babelHelpers.defineProperty({}, forwardedRefProp, ref);

                return _react2.default.createElement(Component, babelHelpers.extends({}, props, forwardedRefProps));
            };

            return (0, _react.forwardRef)(forwardRefComponent);
        };
    };
});