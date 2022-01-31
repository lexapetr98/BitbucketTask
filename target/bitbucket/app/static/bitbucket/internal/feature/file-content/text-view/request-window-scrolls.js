define('bitbucket/internal/feature/file-content/text-view/request-window-scrolls', ['module', 'exports', 'baconjs', 'jquery', 'lodash', 'bitbucket/internal/util/bacon', 'bitbucket/internal/util/performance', 'bitbucket/internal/util/region-scroll-forwarder', 'bitbucket/internal/util/request-page-scrolling', 'bitbucket/internal/util/scroll'], function (module, exports, _baconjs, _jquery, _lodash, _bacon, _performance, _regionScrollForwarder, _requestPageScrolling, _scroll) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _baconjs2 = babelHelpers.interopRequireDefault(_baconjs);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _bacon2 = babelHelpers.interopRequireDefault(_bacon);

    var _performance2 = babelHelpers.interopRequireDefault(_performance);

    var _regionScrollForwarder2 = babelHelpers.interopRequireDefault(_regionScrollForwarder);

    var _requestPageScrolling2 = babelHelpers.interopRequireDefault(_requestPageScrolling);

    var _scroll2 = babelHelpers.interopRequireDefault(_scroll);

    /**
     * Request scrolling from the page level be forwarded down to the diff view.
     * Scrolling of the file comments will be handled here. The subclass must handle any
     * forwarded scrolling through the editorScrolling object.
     *
     * @param {TextView} textView
     * @param {{ onInternalScroll : function, resize : function, scroll : function, scrollSizing : function}} editorScrolling - an interface for accepting scroll events and propagating them within CodeMirror.
     * @private
     */
    function requestWindowScrolls(textView, editorScrolling) {
        return (0, _requestPageScrolling2.default)().done(function (scrollControl) {
            var scrollBus = new _baconjs2.default.Bus();

            var $container = textView._$container.addClass('full-window-scrolling');
            var $fileContent = $container.closest('.file-content');

            // clientHeight as seen by layout - includes file header and editor height (but not file comment height)
            var clientHeight;

            // a function to translate the container to mimic scrolling when scroll events are forwarded.
            var scrollContainer = _scroll2.default.fakeScroll($container[0]);

            // Set up events that cause a resize of the diff area as bacon events and merge them in to a single Bacon.EventStream
            var resizeEvents = ['bitbucket.internal.feature.sidebar.expandEnd', 'bitbucket.internal.feature.sidebar.collapseEnd', 'bitbucket.internal.feature.commit.difftree.collapseAnimationFinished', 'bitbucket.internal.layout.body.resize'];

            var resizeStream = _baconjs2.default.mergeAll(resizeEvents.map(_bacon2.default.events).concat(_bacon2.default.getWindowSizeProperty().toEventStream()));

            // set up a combined size property we can watch that is a merged stream of the
            // window size property and a resize event stream that will receive values when we want to
            // trigger a resize of the diff based on current window size.
            // Notably this is triggered when the sidebar/difftree is expanded/collapsed as this may
            // affect vertical height of items above the diff view.
            var sizeProp = resizeStream.toProperty();

            /**
             * Check if an object is a size object - we just check that the shape contains a width and height
             * @param {*} obj
             * @returns {boolean}
             */
            function isSizeObject(obj) {
                return obj && obj.hasOwnProperty('width') && obj.hasOwnProperty('height');
            }

            textView._addDestroyable(scrollControl);
            textView._addDestroyable(sizeProp.scan(0, function (cachedSize, size) {
                // make sure the size passed in to the stream is a size
                // and has a value otherwise fall back to the cached size
                return isSizeObject(size) && size || cachedSize;
            }).filter(_lodash2.default.identity).onValue(function (size) {
                // we leave file comments out of the height - we'll translate it up ourselves
                // and then the editor should be full screen once we reach the bottom of it.
                clientHeight = size.height - textView._$fileToolbar.outerHeight();
                editorScrolling.resize(textView._$container.width(), clientHeight);
            }));

            // ensure that refresh is only called once per operation. Shouldn't be necessary as the scrollControl
            // should generally avoid processing duplicate states, but it does have to do some DOM reads to determine
            // whether the state is duplicated, so there _might_ be a case that causes problems.
            var refresh = _performance2.default.enqueueCapped(textView._whenOpDone.bind(textView), function () {
                if (!textView._$container) {
                    return; //destroyed
                }
                scrollControl.refresh();
            });

            editorScrolling.onSizeChange(refresh);
            textView.on('widgetAdded', refresh);
            textView.on('widgetChanged', refresh);
            textView.on('widgetCleared', refresh);
            textView.on('internal-change', refresh);
            if (textView._options.commentContext) {
                textView._options.commentContext.on('fileCommentsResized', refresh);
            }

            // split any incoming scrolls from the window - scroll either the file comments or the editors.
            // first scroll the file comments, then pass it off to the SBS or unified editors.
            var scrollForwarder = new _regionScrollForwarder2.default(scrollBus, [{
                id: 'file-comments-and-messages',
                getHeight: function getHeight() {
                    return textView._editorInnerOffset() || 0;
                },
                setScrollTop: function setScrollTop(y) {
                    scrollContainer(0, y);
                }
            }, {
                id: 'editors',
                getHeight: function getHeight() {
                    // the layout will only send relevant scrolls to us,
                    // so the last item can be Infinity with no consequences.
                    // In actuality, the height is editorScrollHeight - editorClientHeight
                    return Infinity;
                },
                setScrollTop: function setScrollTop(y) {
                    editorScrolling.scroll(null, y);
                }
            }]);

            textView._addDestroyable(scrollForwarder);

            if (textView._options.commentContext) {
                textView._options.commentContext.on('fileCommentsResized', scrollForwarder.heightsChanged.bind(scrollForwarder));
            }

            scrollControl.setTarget({
                scrollSizing: function scrollSizing() {
                    var editorScrollInfo = editorScrolling.scrollSizing();
                    return {
                        height: editorScrollInfo.height + textView._editorInnerOffset(),
                        clientHeight: editorScrollInfo.clientHeight
                    };
                },
                offset: function offset() {
                    return $fileContent.offset();
                },
                scroll: function scroll(x, y) {
                    if (y != null) {
                        // ignore horizontal changes
                        scrollBus.push({
                            top: y
                        });
                    }
                }
            });

            // This section of code is dealing with issues where diagonal scrolling by chrome and safari
            // cause codemirror to scroll itself without scrolling the page.
            // By intercepting diagonal scrolls during the capture phase we can prevent these from reaching
            // code mirror and manually handle the scroll action in the correct way.
            //
            // The values for wheelPixelsPerUnit (-0.7, -1/3) are taken from codemirror to match the behaviour
            // for when there is a single directional scroll.

            // These detections are taken from codemirror so they are in effect at the same time as the codemirror
            // detections for the code we want to avoid.
            var isChrome = /Chrome\//.test(window.navigator.userAgent);
            var isSafari = /Apple Computer/.test(window.navigator.vendor);
            var container = textView._$container[0];
            var $window = (0, _jquery2.default)(window);

            var wheelPixelsPerUnit = 1;
            if (isChrome) {
                wheelPixelsPerUnit = -0.7;
            } else if (isSafari) {
                wheelPixelsPerUnit = -1 / 3;
            }

            function mouseWheelHandler(e) {
                if (e.wheelDeltaX && e.wheelDeltaY) {
                    // do the biggest action X or Y only not both.
                    if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY)) {
                        // scroll the editor horizontal
                        var scrollInfo = editorScrolling.scrollSizing();
                        editorScrolling.scroll(scrollInfo.left - e.wheelDeltaX * wheelPixelsPerUnit, null);
                    } else {
                        // scroll the page vertical
                        $window.scrollTop($window.scrollTop() + e.wheelDeltaY * wheelPixelsPerUnit);
                    }
                    // prevent the events from reaching codemirror
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            }

            if (isChrome || isSafari) {
                container.addEventListener('mousewheel', mouseWheelHandler, true);
                scrollControl.destroyables.push({
                    destroy: function destroy() {
                        container.removeEventListener('mousewheel', mouseWheelHandler, true);
                    }
                });
            }
        });
    }

    exports.default = requestWindowScrolls;
    module.exports = exports['default'];
});