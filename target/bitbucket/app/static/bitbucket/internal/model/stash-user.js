define('bitbucket/internal/model/stash-user', ['module', 'exports', 'bitbucket/internal/model/person'], function (module, exports, _person) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _person2 = babelHelpers.interopRequireDefault(_person);

    var StashUser = _person2.default.extend({
        namedAttributes: {
            active: 'boolean',
            avatarUrl: 'string',
            displayName: 'string',
            id: 'number',
            isAdmin: 'boolean',
            link: Object,
            links: Object,
            type: 'string',
            slug: 'string'
        }
    });

    exports.default = StashUser;
    module.exports = exports['default'];
});