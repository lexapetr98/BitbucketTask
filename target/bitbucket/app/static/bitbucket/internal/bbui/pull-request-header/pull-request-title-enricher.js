define('bitbucket/internal/bbui/pull-request-header/pull-request-title-enricher', ['module', 'exports', '../../util/string-replacer'], function (module, exports, _stringReplacer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _stringReplacer2 = babelHelpers.interopRequireDefault(_stringReplacer);

  var prTitleEnricher = new _stringReplacer2.default();
  exports.default = prTitleEnricher;
  module.exports = exports['default'];
});