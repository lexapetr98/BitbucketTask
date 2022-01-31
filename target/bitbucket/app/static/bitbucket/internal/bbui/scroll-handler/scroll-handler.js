define('bitbucket/internal/bbui/scroll-handler/scroll-handler', ['module', 'exports', 'jquery', 'prop-types', 'react'], function (module, exports, _jquery, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var docEl = window.document.documentElement;

    var ScrollHandler = function (_React$Component) {
        babelHelpers.inherits(ScrollHandler, _React$Component);

        function ScrollHandler() {
            babelHelpers.classCallCheck(this, ScrollHandler);
            return babelHelpers.possibleConstructorReturn(this, (ScrollHandler.__proto__ || Object.getPrototypeOf(ScrollHandler)).apply(this, arguments));
        }

        babelHelpers.createClass(ScrollHandler, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var scrollElement = this.props.scrollElement;


                this.updateListeners(null, scrollElement);

                //trigger an initial callback in case the current content is shorter than the window.
                if (this._scrollCallback) {
                    this._scrollCallback(scrollElement);
                }
            }
        }, {
            key: 'componentDidUpdate',
            value: function componentDidUpdate(previousProps) {
                var scrollElement = this.props.scrollElement;


                this.updateListeners(previousProps.scrollElement, scrollElement);

                //Trigger a followup callback in case the current content is still shorter than the window after updating.
                if (this._scrollCallback) {
                    this._scrollCallback(scrollElement);
                }
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                this.updateListeners(this.props.scrollElement, null);
            }
        }, {
            key: 'scrollCallback',
            value: function scrollCallback(scrollElement) {
                if (this.props.suspend) {
                    return;
                }

                var $scrollElement = (0, _jquery2.default)(scrollElement);

                if (!this._scrollingWindow && $scrollElement.is(':hidden')) {
                    return;
                }

                var scrollTop = $scrollElement.scrollTop();
                var paneHeight = this._getPaneHeight();
                var contentHeight = this._getContentHeight();
                var scrollBottom = paneHeight + scrollTop;

                // In Chrome (not checked since like v12) on Windows at some font sizes (Ctrl +), the scrollPaneHeight is rounded down, but contentHeight is
                // rounded up (I think). This means there is a 1px difference between them and the event won't fire.
                var chromeWindowsFontChangeBuffer = 1;

                var scrolledToBottom = scrollBottom + chromeWindowsFontChangeBuffer >= contentHeight - (this.props.bufferPx | 0);

                if (scrolledToBottom) {
                    this.props.onScrollToBottom();
                }
            }
        }, {
            key: 'updateListeners',
            value: function updateListeners(previousScrollElement, currentScrollElement) {
                previousScrollElement = (0, _jquery2.default)(previousScrollElement)[0];
                currentScrollElement = (0, _jquery2.default)(currentScrollElement)[0];

                if (previousScrollElement === currentScrollElement) {
                    return;
                }

                if (previousScrollElement) {
                    (0, _jquery2.default)(previousScrollElement).off('scroll', this._scrollCallback);
                    (0, _jquery2.default)(window).off('resize', this._scrollCallback);
                }

                if (currentScrollElement) {
                    this._scrollCallback = this.scrollCallback.bind(this, currentScrollElement);
                    this._scrollingWindow = _jquery2.default.isWindow(currentScrollElement);
                    this._getPaneHeight = this._scrollingWindow ? function () {
                        return docEl.clientHeight;
                    } : function () {
                        return currentScrollElement.clientHeight;
                    };
                    this._getContentHeight = this._scrollingWindow ? function () {
                        return docEl.scrollHeight;
                    } : function () {
                        return currentScrollElement.scrollHeight;
                    };
                    (0, _jquery2.default)(currentScrollElement).on('scroll', this._scrollCallback);
                    (0, _jquery2.default)(window).on('resize', this._scrollCallback);
                }
            }
        }, {
            key: 'render',
            value: function render() {
                return this.props.children;
            }
        }]);
        return ScrollHandler;
    }(_react2.default.Component);

    ScrollHandler.propTypes = {
        bufferPx: _propTypes2.default.number,
        children: _propTypes2.default.element.isRequired,
        onScrollToBottom: _propTypes2.default.func.isRequired,
        scrollElement: _propTypes2.default.oneOfType([_propTypes2.default.node, _propTypes2.default.oneOf([window])]),
        suspend: _propTypes2.default.bool
    };
    ScrollHandler.defaultProps = {
        scrollElement: window
    };
    exports.default = ScrollHandler;
    module.exports = exports['default'];
});