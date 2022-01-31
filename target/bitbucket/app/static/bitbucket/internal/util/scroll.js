define('bitbucket/internal/util/scroll', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/feature-detect'], function (module, exports, _jquery, _lodash, _featureDetect) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _featureDetect2 = babelHelpers.interopRequireDefault(_featureDetect);

    var defaults = {
        waitForImages: false, // Good for scrolling on page load
        cancelIfScrolled: false,
        duration: 400,
        getScrollPadding: function getScrollPadding() {
            return document.documentElement.clientHeight / 4;
        }
    };

    function scroll(destination, padding, duration) {
        (0, _jquery2.default)('html, body').animate({
            scrollTop: Math.max(0, destination - padding)
        }, duration);
    }

    function scrollTo($el, options) {
        var opts = _jquery2.default.extend({}, defaults, options);

        var cancelScroll = false;
        if (opts.cancelIfScrolled) {
            (0, _jquery2.default)(document).one('scroll', function () {
                cancelScroll = true;
            });
        }

        function scrollIfNotCancelled() {
            if (!cancelScroll) {
                var offset = $el.offset();
                if (offset) {
                    // $el is still in DOM and visible
                    scroll(offset.top, opts.getScrollPadding(), opts.duration);
                }
            }
        }

        if (opts.waitForImages) {
            (0, _jquery2.default)(document).imagesLoaded(scrollIfNotCancelled);
        } else {
            scrollIfNotCancelled();
        }
    }

    /**
     * Given a fixed or absolute-ly positioned "content" element, return a function to scroll it
     * in a "fake" way using transform: translate() or top: and left: depending on the browser.
     *
     * This simulates a container element being scrolled.
     *
     * @param {HTMLElement} el - the element representing "contents"
     * @param {object} [options]
     * @param {boolean} options.withDocument - should element scroll in the same direction as the document?
     *                                         i.e. you scroll down, the element moves down.
     * @returns {Function} a function that takes in a scrollLeft and scrollTop for the contents
     */
    function fakeScroll(el, options) {
        var transformProp = _featureDetect2.default.cssTransform();
        var cachedPos = { left: 0, top: 0 };
        var multiplier = -1;

        if (options && options.withDocument === true) {
            multiplier = 1;
        }
        /**
         * Cache the scroll position
         * @param {?number} left
         * @param {?number} top
         * @returns {{left: ?number, top: ?number}}
         */
        function cachedScrollPosition(left, top) {
            cachedPos.left = left == null ? cachedPos.left : left;
            cachedPos.top = top == null ? cachedPos.top : top;
            return cachedPos.left === 0 && cachedPos.top === 0 ? null : cachedPos;
        }

        var transformer;
        switch (transformProp) {
            case 'msTransform':
                transformer = function transformer(scrollPos) {
                    el.style[transformProp] = scrollPos === null ? '' : 'translate(' + Math.round(scrollPos.left) * multiplier + 'px, ' + Math.round(scrollPos.top) * multiplier + 'px)';
                };
                break;
            case undefined:
                transformer = function transformer(scrollPos) {
                    el.style.left = scrollPos === null ? '' : Math.round(scrollPos.left) * multiplier;
                    el.style.top = scrollPos === null ? '' : Math.round(scrollPos.top) * multiplier;
                };
                break;
            default:
                transformer = function transformer(scrollPos) {
                    el.style[transformProp] = scrollPos === null ? '' : 'translate3d(' + Math.round(scrollPos.left) * multiplier + 'px, ' + Math.round(scrollPos.top) * multiplier + 'px, 0)';
                };
        }

        return (0, _lodash.flow)(cachedScrollPosition, transformer);
    }

    function getScrollContainerOffsetTop(el, scrollContainer) {
        var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        if (!el) {
            return offset;
        }

        var offsetParent = el.offsetParent;

        if (offsetParent === scrollContainer || offsetParent === document.body || offsetParent === document.documentElement) {
            return offset + el.offsetTop;
        }

        return getScrollContainerOffsetTop(offsetParent, scrollContainer, offset + el.offsetTop);
    }

    function centerElementInScrollContainer(el) {
        var scrollContainer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window;

        var scrollTop = getScrollContainerOffsetTop(el, scrollContainer) - ((scrollContainer.clientHeight || scrollContainer.innerHeight) - el.getBoundingClientRect().height) / 2;

        scrollContainer.scrollTo ? scrollContainer.scrollTo(0, scrollTop) : scrollContainer.scrollTop = scrollTop;
    }

    var repaintEl = function repaintEl(el) {
        if (el) {
            var oldDisplay = el.style.display;

            el.style.display = 'none';
            el.offsetHeight; //Triggers repaint
            el.style.display = oldDisplay;
        }
    };

    //If there is no currently hovered child, no repaint is forced.
    var repaintHoveredChild = function repaintHoveredChild(parent) {
        return repaintEl((0, _lodash.last)(parent.querySelectorAll(':hover')));
    };

    function disableHoverUntilMouseMove(el) {
        if (el.style.pointerEvents !== 'none') {
            var oldPointerEvents = el.style.pointerEvents;
            el.style.pointerEvents = 'none';

            // If you are already hovering an element with the mouse when you trigger `disableHoverUntilMouseMove`,
            // the existing hover effect will remain until the next paint of that element.
            // `repaintHoveredChild` makes sure the repaint happens as soon as pointer events are disabled.
            // It only happens the first time pointer events are disabled, until the next mouse move.
            // (i.e. multiple calls to `disableHoverUntilMouseMove` without a `mousemove` will only force 1 repaint)
            repaintHoveredChild(el);

            (0, _jquery2.default)(window).one('mousemove', function () {
                el.style.pointerEvents = oldPointerEvents;
            });
        }
    }

    exports.default = {
        centerElementInScrollContainer: centerElementInScrollContainer,
        disableHoverUntilMouseMove: disableHoverUntilMouseMove,
        scrollTo: scrollTo,
        fakeScroll: fakeScroll
    };
    module.exports = exports['default'];
});