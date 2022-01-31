define('bitbucket/internal/model/project', ['module', 'exports', 'backbone-brace', 'bitbucket/internal/model/stash-user'], function (module, exports, _backboneBrace, _stashUser) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _stashUser2 = babelHelpers.interopRequireDefault(_stashUser);

    var Project = _backboneBrace2.default.Model.extend({
        namedAttributes: {
            id: 'number',
            name: 'string',
            key: 'string',
            description: 'string',
            type: 'string',
            owner: _stashUser2.default,
            avatarUrl: 'string',
            link: Object,
            links: Object,
            public: 'boolean'
        },
        isEqual: function isEqual(project) {
            return !!(project && project instanceof Project && this.id === project.id);
        }
    }, {
        projectType: {
            NORMAL: 'NORMAL',
            PERSONAL: 'PERSONAL'
        }
    });

    exports.default = Project;
    module.exports = exports['default'];
});