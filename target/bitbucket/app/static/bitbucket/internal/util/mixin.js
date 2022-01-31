define('bitbucket/internal/util/mixin', ['module', 'exports', 'lodash'], function (module, exports, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    function mix() /* ...mixins */{
        var mixins = [].slice.call(arguments);
        return {
            into: function into(target) {
                return _lodash2.default.assign.apply(_lodash2.default, [target].concat(mixins));
            }
        };
    }

    exports.default = mix;
    module.exports = exports['default'];
});