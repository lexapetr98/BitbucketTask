define('bitbucket/internal/page/repository-fork/repository-fork', ['module', 'exports', 'jquery', 'bitbucket/internal/feature/project/project-selector/project-selector', 'bitbucket/internal/feature/repository/cloneUrlGen/cloneUrlGen', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/repository', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _projectSelector, _cloneUrlGen, _pageState, _repository, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _projectSelector2 = babelHelpers.interopRequireDefault(_projectSelector);

    var _cloneUrlGen2 = babelHelpers.interopRequireDefault(_cloneUrlGen);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _repository2 = babelHelpers.interopRequireDefault(_repository);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    function initRepositoryPageState(repositoryJson) {
        var repo = new _repository2.default(repositoryJson);
        _pageState2.default.setRepository(repo);
        _pageState2.default.setProject(repo.getProject());
    }

    function initProjectSelector(projectSelectorSelector, personalProjectJson) {
        var $projectTrigger = (0, _jquery2.default)(projectSelectorSelector);
        var $projectInput = $projectTrigger.next('input');
        var $preloadData = personalProjectJson ? [personalProjectJson] : null;
        if (!personalProjectJson) {
            // There is no pre-selected value so disable the submit button until one is selected
            var submit = document.getElementById('fork-repo-submit');
            submit.disabled = true;

            _events2.default.on('bitbucket.internal.feature.project.projectSelector.projectChanged', function () {
                submit.disabled = false;
            });
        }
        return new _projectSelector2.default($projectTrigger, {
            field: $projectInput,
            preloadData: _projectSelector2.default.constructDataPageFromPreloadArray($preloadData)
        });
    }

    function onReady(repositoryJson, projectSelectorSelector, personalProjectJson) {
        initRepositoryPageState(repositoryJson);
        var projectSelector = initProjectSelector(projectSelectorSelector, personalProjectJson);

        var $repoName = (0, _jquery2.default)('#name');
        var $cloneUrl = (0, _jquery2.default)('.clone-url-generated span');

        _cloneUrlGen2.default.bindUrlGeneration($cloneUrl, {
            elementsToWatch: [$repoName, projectSelectorSelector],
            getProject: projectSelector.getSelectedItem.bind(projectSelector),
            getRepoName: $repoName.val.bind($repoName)
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});