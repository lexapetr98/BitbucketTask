define('bitbucket/internal/feature/commits/commit-message-enricher', ['module', 'exports', '../../util/string-replacer'], function (module, exports, _stringReplacer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _stringReplacer2 = babelHelpers.interopRequireDefault(_stringReplacer);

  var commitMessageEnricher = new _stringReplacer2.default();
  exports.default = commitMessageEnricher;
  module.exports = exports['default'];
});