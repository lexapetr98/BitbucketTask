define("bitbucket/internal/util/is-in-viewport", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /**
   * Helper that checks if the element is in the viewport
   * @param element - the element to be checked against the viewport
   * @return {boolean}
   */

  var isInViewport = exports.isInViewport = function isInViewport(element) {
    var windowHeight = document.documentElement.clientHeight;
    var elementBottomToViewportTop = element.getBoundingClientRect().bottom;

    return windowHeight >= elementBottomToViewportTop;
  };
});