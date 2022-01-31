define('bitbucket/internal/feature/commit/request-commit', ['module', 'exports', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/util/state', 'bitbucket/internal/util/ajax'], function (module, exports, _lodash, _navbuilder, _state, _ajax) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = requestCommit;

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var cache = {};

    /**
     * Return a promise containing the commit JSON object
     */
    function requestCommit(_ref) {
        var commitId = _ref.commitId,
            project = _ref.project,
            repo = _ref.repo,
            _ref$statusCode = _ref.statusCode,
            statusCode = _ref$statusCode === undefined ? {} : _ref$statusCode;

        if (cache.hasOwnProperty(commitId)) {
            return cache[commitId];
        }

        var url = void 0;
        if (project && repo) {
            url = _navbuilder2.default.rest().project(project).repo(repo).commit(commitId).build();
        } else if (_state2.default.getRepository()) {
            //fallback to using the currentRepo
            url = _navbuilder2.default.rest().currentRepo().commit(commitId).build();
        } else {
            return Promise.reject(new Error('Repository required'));
        }

        cache[commitId] = new Promise(function (resolve, reject) {
            _ajax2.default.rest({
                url: url,
                statusCode: babelHelpers.extends({}, _ajax2.default.ignore404WithinRepository(), statusCode)
            }).done(resolve).fail(function (xhr, textStatus, errorThrown, data) {
                delete cache[commitId];
                reject((0, _lodash.get)(data, 'errors.length') ? new Error(data.errors[0].message) : new Error('Commit request failed'));
            });
        });

        return cache[commitId];
    }
    module.exports = exports['default'];
});