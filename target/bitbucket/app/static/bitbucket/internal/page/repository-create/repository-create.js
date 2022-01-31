define('bitbucket/internal/page/repository-create/repository-create', ['module', 'exports', 'jquery', 'bitbucket/internal/feature/repository/cloneUrlGen/cloneUrlGen', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/project'], function (module, exports, _jquery, _cloneUrlGen, _pageState, _project) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _cloneUrlGen2 = babelHelpers.interopRequireDefault(_cloneUrlGen);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _project2 = babelHelpers.interopRequireDefault(_project);

    function onReady(projectJSON) {
        _pageState2.default.setProject(new _project2.default(projectJSON));

        var $repoName = (0, _jquery2.default)('#name');
        var $cloneUrl = (0, _jquery2.default)('.clone-url-generated span');
        _cloneUrlGen2.default.bindUrlGeneration($cloneUrl, {
            elementsToWatch: [$repoName],
            getRepoName: $repoName.val.bind($repoName)
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});