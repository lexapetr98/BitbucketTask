define("bitbucket/internal/feature/dashboard/util/suggestion-unique-id", ["module", "exports"], function (module, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (_ref) {
    var repository = _ref.repository,
        refChange = _ref.refChange;

    return repository.id + "_" + refChange.refId + "_" + refChange.toHash;
  };

  module.exports = exports["default"];
});