define('bitbucket/internal/model/participant', ['module', 'exports', 'backbone-brace', 'bitbucket/internal/model/stash-user'], function (module, exports, _backboneBrace, _stashUser) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _stashUser2 = babelHelpers.interopRequireDefault(_stashUser);

    exports.default = _backboneBrace2.default.Model.extend({
        namedAttributes: {
            approved: 'boolean',
            lastReviewedCommit: 'string',
            role: 'string',
            user: _stashUser2.default,
            status: 'string'
        }
    });
    module.exports = exports['default'];
});