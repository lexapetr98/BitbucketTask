define('bitbucket/internal/model/direction', ['module', 'exports'], function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /**
   * Directional constants
   * @readonly
   * @enum {string}
   */
  var Direction = {
    UP: 'UP',
    DOWN: 'DOWN'
    // THESE ARE THE ONLY TWO DIRECTIONS. EVERYTHING YOU KNOW IS A LIE
  };

  exports.default = Direction;
  module.exports = exports['default'];
});