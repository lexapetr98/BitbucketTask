define('bitbucket/internal/model/repository', ['module', 'exports', 'backbone-brace', 'bitbucket/internal/model/project'], function (module, exports, _backboneBrace, _project) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _project2 = babelHelpers.interopRequireDefault(_project);

    var Repository = _backboneBrace2.default.Model.extend({
        namedAttributes: {
            id: 'number',
            name: 'string',
            slug: 'string',
            project: _project2.default,
            public: 'boolean',
            scmId: 'string',
            state: 'string',
            statusMessage: 'string',
            forkable: 'boolean',
            cloneUrl: 'string',
            link: Object,
            links: Object,
            origin: null
        },
        isEqual: function isEqual(repo) {
            //TODO: Needs test
            return !!(repo && repo instanceof Repository && this.id === repo.id);
        }
    });

    // Need a reference to Repository so must add type checks for origin after creation.
    _backboneBrace2.default.Mixins.applyMixin(Repository, {
        namedAttributes: {
            origin: Repository
        }
    });

    exports.default = Repository;
    module.exports = exports['default'];
});