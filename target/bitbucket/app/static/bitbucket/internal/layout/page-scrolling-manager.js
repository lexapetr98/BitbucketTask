define('bitbucket/internal/layout/page-scrolling-manager', ['module', 'exports', '@atlassian/aui', 'baconjs', 'jquery', 'lodash', 'bitbucket/internal/util/bacon', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/util/region-scroll-forwarder', 'bitbucket/internal/util/scroll'], function (module, exports, _aui, _baconjs, _jquery, _lodash, _bacon, _events, _function, _regionScrollForwarder, _scroll) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _baconjs2 = babelHelpers.interopRequireDefault(_baconjs);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _bacon2 = babelHelpers.interopRequireDefault(_bacon);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _regionScrollForwarder2 = babelHelpers.interopRequireDefault(_regionScrollForwarder);

    var _scroll2 = babelHelpers.interopRequireDefault(_scroll);

    var $window = (0, _jquery2.default)(window); /**
                                                  * Utilities for working with layouts in Stash.
                                                  *
                                                  * @namespace layout/page-scrolling-manager
                                                  */


    function getPageOffset($page) {
        var pageOffset = $page.offset().top;

        // add in any banners between $body and $page that could cause page to not be at the top of the document.
        var bannersHeight = 0;
        $page.prevAll('.aui-message').each(function (i, el) {
            bannersHeight += el.offsetHeight;
        });

        return pageOffset - bannersHeight;
    }

    /**
     * @typedef {Object} layout/page-scrolling-manager.Target
     *
     * @property {function(number, number)} scroll - scroll the target to (scrollLeftPx, scrollTopPx)
     * @property {function(number, number)} resize - resize the target to (widthPx, heightPx)
     * @property {function() : {top:number, left:number}} offset - get the target's offsetTop and offsetLeft in px.
     * @property {function() : {height:number, clientHeight:number}} scrollSizing - get the target's scrollHeight and clientHeight in px.
     */

    /**
     * For any layout that adheres to the AUI markup pattern, and whose markup
     * can be rendered in a position:fixed element, this util allows a subelement to 'hi-jack'
     * page scrolling such that the window's native browser scrollbar scrolls the subelement as part of
     * scrolling the page.
     *
     * That is, the scrollbar will be resized such that it scrolls the distance of (pageHeight + targetScrollHeight).
     * In the region assigned to the target, scroll commands will be forwarded to the target.
     *
     * @returns {{ destroy : Function, scrollTo : Function }}
     */
    function enableScrollForwarding() {
        var $window = (0, _jquery2.default)(window);
        var bodyEl = document.body;
        var $body = (0, _jquery2.default)(bodyEl);
        var $page = (0, _jquery2.default)('#page');
        var pageEl = $page[0];
        var $sidebar = (0, _jquery2.default)('.aui-sidebar');
        var sidebar = _aui2.default.sidebar($sidebar);

        var oldBodyHeight = bodyEl.style.height;

        $body.addClass('scrolling-forwarded');

        // destroy all our stuff
        var destroyRequestBus = new _baconjs2.default.Bus();

        // refresh values from target
        var refreshRequestBus = new _baconjs2.default.Bus();

        // the target is requesting a programmatic scroll
        var magicScrollBus = new _baconjs2.default.Bus();

        // target - when target changes, there's an event fired.
        var targetBus = new _baconjs2.default.Bus();

        // When the target is changed, a refresh is requested, the window size changes, or just on a poll, update the offset.
        // Poll for offset changes because we never know when a plugin will change height above us (STASHDEV-6168)
        var targetOffsetProperty = targetBus.sampledBy(_baconjs2.default.mergeAll(targetBus, refreshRequestBus, _baconjs2.default.interval(1000).takeUntil(destroyRequestBus), _bacon2.default.getWindowSizeProperty().changes())).filter(function (target) {
            return !!target;
        }).takeUntil(destroyRequestBus).map('.offset').map(function (rawOffset) {
            // target offsets are off by the page's offset, since the target is always inside the #page element.
            var pageOffset = getPageOffset($page);
            return {
                top: Math.round(rawOffset.top - pageOffset)
            };
        }).skipDuplicates(function (a, b) {
            return a.top === b.top;
        }).toProperty();

        // When the target is changed or a refresh is requested, update the size.
        var targetScrollSizeProperty = targetBus.sampledBy(_baconjs2.default.mergeAll(targetBus, refreshRequestBus)).filter(function (target) {
            return !!target;
        }).takeUntil(destroyRequestBus).map('.scrollSizing').skipDuplicates(function (a, b) {
            return a.height === b.height && a.clientHeight === b.clientHeight;
        }).toProperty();

        // On any resizes, recalculate the body height to ensure our scrollHeight is correct
        _baconjs2.default.combineWith(function (targetOffset, targetScrollSize, windowSize) {
            // targetOffset is a kludge replacement for pageSize - targetClientSize. Since the target contributes to the pageSize,
            // and since it does so in a way that is unmeasurable from here (e.g. file comments of a diff view is not included
            // in clientHeight, and we can't know that), we make an assumption that there is no page content below the target, and use the offset
            // to determine the space above the target. Perhaps in the future targetOffset can be required to include a 'bottom' we can use.
            return targetOffset.top + Math.max(targetScrollSize.height, targetScrollSize.clientHeight) + (windowSize.height - targetScrollSize.clientHeight);
        }, targetOffsetProperty, targetScrollSizeProperty, _bacon2.default.getWindowSizeProperty()).takeUntil(destroyRequestBus).onValue(function (bodyHeight) {
            $body.height(bodyHeight);
            _events2.default.trigger('bitbucket.internal.layout.body.resize');
        });

        var scrollPage = _scroll2.default.fakeScroll(pageEl);

        // Handle horizontal scrolls.
        _bacon2.default.getWindowScrollProperty().takeUntil(destroyRequestBus).onValue(function (scroll) {
            scrollPage(scroll.left, null);
        });

        // request comes in to scroll the target. We convert that to values for which to instead scroll the whole window.
        _baconjs2.default.combineAsArray(magicScrollBus, targetOffsetProperty.sampledBy(magicScrollBus), targetScrollSizeProperty.sampledBy(magicScrollBus)).map(_function2.default.spread(function (scrollRequest, targetOffset, targetScrollSize) {
            return {
                scrollTop: scrollRequest.scrollTop != null ? targetOffset.top + Math.max(0, Math.min(scrollRequest.scrollTop, targetScrollSize.height - targetScrollSize.clientHeight)) : null
            };
        })).onValue(function (scrollRequest) {
            if (scrollRequest.scrollTop != null) {
                $window.scrollTop(scrollRequest.scrollTop);
            }
        });

        // Handle regions
        function createRegionForwarder(initialTarget) {
            var headerHeight = null;

            // Hack so I can get the latest value.
            var target = initialTarget;
            targetBus.takeUntil(destroyRequestBus).onValue(function (f) {
                target = f;
            });

            var regionForwarder = new _regionScrollForwarder2.default(_bacon2.default.getWindowScrollProperty(), [{
                id: 'pre',
                groupId: 'outside',
                setScrollTop: function setScrollTop(y) {
                    if (headerHeight === null) {
                        headerHeight = $sidebar.offset().top;
                    }
                    scrollPage(null, y);

                    // Set the position of the sidebar manually because we override the position:fixed with
                    // position:absolute.
                    sidebar.$wrapper.css('top', Math.max(0, y - headerHeight));
                    if (!sidebar.$wrapper.hasClass('aui-is-docked') || y === 0) {
                        sidebar.reflow();
                    }
                },
                getHeight: function getHeight() {
                    var targetTop = target.offset().top;
                    var pageTop = getPageOffset($page, $body);
                    return targetTop - pageTop;
                }
            }, {
                id: 'in',
                groupId: 'inside',
                setScrollTop: function setScrollTop(y) {
                    target.scroll(null, y);
                },
                getHeight: function getHeight() {
                    //HACK
                    //TODO: figure out why my heights are off by 3-4px.
                    return Infinity;

                    //var scrollSizing = target.scrollSizing();
                    //return Math.max(0, scrollSizing.height - scrollSizing.clientHeight);
                } /* bring back when the above hack is fixed.
                  , {
                    id : 'post',
                    groupId : 'outside',
                    setScrollTop : function(y) { scrollPage(null, y + (target.offset().top - $page.offset().top)); },
                    getHeight : function() { return Infinity; }
                  }*/
            }]);

            targetOffsetProperty.takeUntil(destroyRequestBus).onValue(regionForwarder, 'heightsChanged');

            return regionForwarder;
        }

        var unsub = targetBus.onValue(function (target) {
            destroyRequestBus.onValue(createRegionForwarder(target), 'destroy');
            unsub();
        });

        return {
            /**
             * Set the target element - the thing that will receive scroll events
             * @param {layout/page-scrolling-manager.Target} target
             */
            setTarget: function setTarget(target) {
                targetBus.push(target);
            },
            /**
             * Inform the layout that the target has scrolled to the given position.
             * The layout will move the window scrollbar to the appropriate place.
             *
             * @param {number} scrollLeft
             * @param {number} scrollTop
             */
            scroll: function scroll(scrollLeft, scrollTop) {
                magicScrollBus.push({
                    scrollTop: scrollTop
                });
            },
            /**
             * Call this when the target has changed size, offset, or content size.
             */
            refresh: function refresh() {
                refreshRequestBus.push(true);
            },
            destroyables: [],
            /**
             * Stop receiving scroll events and revert to a normal page layout.
             */
            destroy: function destroy() {
                _lodash2.default.invokeMap(this.destroyables, 'destroy');
                this.destroyables = [];
                $body.removeClass('scrolling-forwarded');
                scrollPage(0, 0);
                sidebar.$wrapper.css('top', '');
                bodyEl.style.height = oldBodyHeight || null;
                magicScrollBus.end();
                destroyRequestBus.push(true);
                destroyRequestBus.end();
                refreshRequestBus.end();
                targetBus.end();
            }
        };
    }

    var accepting = false;
    var preservedScrollTop;
    var scrollControl;

    /**
     * A page should call this when it wants to allow scroll forwarding requests by elements on the page.
     * When a request is accepted, the element on the page will be seamlessly scrolled as part of the window scroll.
     *
     * That is, the window will be scrolled until the element reaches the top of the page, then the element will be scrolled
     * to the end, then the window will continue scrolling.
     *
     * @private - NOT FOR EXTERNAL USE. Only pages should call this to opt-in to page-level scrolling. Only some pages can handle this.
     * @returns {Function} - function to stop accepting requests.
     */
    function acceptScrollForwardingRequests() {
        if (accepting) {
            throw new Error('acceptScrollForwardingRequests has already been called. It must be unregistered before it can be called again.');
        }

        accepting = true;
        preservedScrollTop = null;

        return function () {
            if (scrollControl) {
                _aui2.default.log('Scroll control is not yet destroyed. Ongoing scroll requests will be ignored.');
                scrollControl.scrollTo = _jquery2.default.noop;
                scrollControl.destroy();
            }
            accepting = false;
        };
    }

    /**
     * Internal method. Use `util/request-page-scrolling` instead.
     * @private
     * @returns {Promise} - resolves to a scrollControl, or rejects to an object with a reason.
     */
    function requestScrollControl() {
        var target;

        if (!accepting) {
            return _jquery2.default.Deferred().reject({ reason: 'NOT_ACCEPTING' });
        }
        if (scrollControl) {
            return _jquery2.default.Deferred().reject({ reason: 'CONTROL_TAKEN' });
        }

        (0, _jquery2.default)('#footer').hide();
        scrollControl = enableScrollForwarding();

        function restoreWindowScroll() {
            $window.scrollTop(Math.min(preservedScrollTop, target.offset().top - (0, _jquery2.default)('#page').offset().top));
        }

        /**
         * This is a little added hack to avoid flicker between scrollControl hand-offs.
         * When a new target is set for scroll forwarding after scrollControl was destroyed, we force a scroll to where the window last was.
         * This usually means the user never sees a scroll between the last target and this one.
         */
        scrollControl.setTarget = function (oldSetTarget) {
            return function setTarget(t) {
                var ret = oldSetTarget.apply(this, arguments);

                // preserve for use in destroy
                target = t;

                var destroyed = !scrollControl; // hey, it could happen...

                // the initial window scroll position will revert to 0, even though the page is 'scrolled'
                // to the top of the target. So we force a scroll to the top of the target again,
                // which is a noop except that the window scrollbar moves to the correct position.
                if (preservedScrollTop != null && !destroyed) {
                    restoreWindowScroll();
                    preservedScrollTop = null;
                }

                return ret;
            };
        }(scrollControl.setTarget);

        scrollControl.destroy = function (oldDestroy) {
            return function destroy() {
                if (target) {
                    preservedScrollTop = $window.scrollTop();
                    // if we've scrolled into the target, reset back to the top of it
                    restoreWindowScroll();
                }
                (0, _jquery2.default)('#footer').show();
                scrollControl = null;
                return oldDestroy.apply(this, arguments);
            };
        }(scrollControl.destroy);

        return _jquery2.default.Deferred().resolve(scrollControl);
    }

    exports.default = {
        _requestScrollControl: requestScrollControl,
        acceptScrollForwardingRequests: acceptScrollForwardingRequests
    };
    module.exports = exports['default'];
});