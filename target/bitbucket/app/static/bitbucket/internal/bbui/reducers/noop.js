define("bitbucket/internal/bbui/reducers/noop", ["module", "exports"], function (module, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var action = arguments[1];
    return state;
  };

  module.exports = exports["default"];
});