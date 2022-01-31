define('bitbucket/internal/feature/tasks/tasks-overview/tasks-overview', ['module', 'exports', 'baconjs', 'jquery', 'lodash', 'bitbucket/util/events', 'bitbucket/util/state', 'bitbucket/internal/feature/tasks/tasks-overview/tasks-counter', 'bitbucket/internal/feature/tasks/tasks-overview/tasks-overview-panel'], function (module, exports, _baconjs, _jquery, _lodash, _events, _state, _tasksCounter, _tasksOverviewPanel) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _baconjs2 = babelHelpers.interopRequireDefault(_baconjs);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _tasksCounter2 = babelHelpers.interopRequireDefault(_tasksCounter);

    var _tasksOverviewPanel2 = babelHelpers.interopRequireDefault(_tasksOverviewPanel);

    var taskCountProperty; // Bacon property that tracks the open task count
    var tasksCounter;
    var overviewPanels = []; // Array of instanciated TaskOverviewPanels for later destruction

    /**
     * Adds dynamic behaviour to any open task count panels that are found in the DOM
     */
    function createTaskCountPanels() {
        var pullRequestId = _state2.default.getPullRequest().id;
        var repositoryId = _state2.default.getRepository().id;
        var initialValueProperty = _baconjs2.default.fromPromise(_PageDataPlugin.ready('com.atlassian.bitbucket.server.bitbucket-web:pull-request-tasks-page-provider', 'bitbucket.layout.pullRequest')).map(function (value) {
            return _lodash2.default.assign(value.hasOwnProperty('openTaskCount') ? value : tasksCounter.emptyCounter(), {
                pullRequestId: pullRequestId,
                repositoryId: repositoryId
            });
        });

        if (!taskCountProperty) {
            taskCountProperty = tasksCounter.countPropertyForPullRequest({
                pullRequestId: pullRequestId,
                repositoryId: repositoryId
            }, initialValueProperty);
        }

        (0, _jquery2.default)('.plugin-item-task-count').each(function () {
            overviewPanels.push(new _tasksOverviewPanel2.default(this, taskCountProperty));
        });
    }

    /**
     * Handler for contextLoaded events to trigger a call to createTaskCountPanels
     * when we are on the Overview PR tab
     *
     * @param {object} info about context that is being loaded
     */
    function contextLoadedHandler(context) {
        if (context.name === 'bitbucket.pull-request.nav.overview') {
            createTaskCountPanels();
        }
    }

    /**
     * Handler for contextUnloaded events to destroy any open task count panels
     * when leave the Overview PR tab
     *
     * @param {object} info about context that is being unloaded
     */
    function contextUnloadedHandler(context) {
        if (context.name === 'bitbucket.pull-request.nav.overview') {
            _lodash2.default.invokeMap(overviewPanels, 'destroy');
            overviewPanels = [];
        }
    }

    /**
     * Context provider for the PR Overview task count panel
     *
     * @param {Object} context
     * @returns {{openTaskCount: number}}
     */
    function openTaskCountContext(context) {
        // the task count is loaded asynchronously when the page data becomes available (see countTasks())
        return _tasksCounter2.default.prototype.emptyCounter({
            pullRequestId: context.pullRequest.id,
            repositoryId: context.pullRequest.fromRef.repository.id
        });
    }

    function onReady() {
        tasksCounter = new _tasksCounter2.default();

        _events2.default.on('bitbucket.internal.page.pull-request.view.contextLoaded', contextLoadedHandler);
        _events2.default.on('bitbucket.internal.page.pull-request.view.contextUnloaded', contextUnloadedHandler);

        createTaskCountPanels();
    }

    exports.default = {
        openTaskCountContext: openTaskCountContext,
        onReady: onReady
    };
    module.exports = exports['default'];
});