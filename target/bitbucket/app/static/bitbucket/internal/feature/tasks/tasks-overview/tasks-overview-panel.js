define('bitbucket/internal/feature/tasks/tasks-overview/tasks-overview-panel', ['module', 'exports', 'lodash', 'bitbucket/internal/widget/updating-section/updating-section'], function (module, exports, _lodash, _updatingSection) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _updatingSection2 = babelHelpers.interopRequireDefault(_updatingSection);

    /**
     * Manages the dynamic updating of the "Open Tasks" count on the PR Overview page
     * as tasks are updated in the various tabs of the PR page.
     *
     * @param {jQuery|HTMLElement} el element containing the open task count panel to be updated
     * @param {BaconProperty} taskCountProperty a Bacon property which tracks the open task count
     * @constructor
     */
    function TasksOverviewPanel(el, taskCountProperty) {
        this.init.apply(this, arguments);
    }

    /**
     * Manages the dynamic updating of the "Open Tasks" count on the PR Overview page
     * as tasks are updated in the various tabs of the PR page.
     *
     * @param {jQuery|HTMLElement} el element containing the open task count panel to be updated
     * @param {Property} taskCountProperty a Bacon property which tracks the open task count
     */
    TasksOverviewPanel.prototype.init = function (el, taskCountProperty) {
        var taskEvents = taskCountProperty.toEventStream();

        var isVisibleProperty = taskCountProperty.map(function (val) {
            /*
            * Tasks Count is visible if:
            * - there are any open tasks (n open tasks)
            * - there are no open tasks but resolved tasks (All tasks resolved)
            * - there are removed tasks (either No open tasks or open task count)
            */
            return val.resolvedTaskCount > 0 || val.openTaskCount > 0;
        }).toProperty();

        var options = {
            isVisibleProperty: isVisibleProperty
        };

        this._destroyCallbacks = [new _updatingSection2.default(el, taskEvents, bitbucket.internal.feature.tasks.tasksOverview.taskCount, options)];
    };

    /**
     * Stop updating this Overview Panel by destroying the underlying UpdatingSection object
     */
    TasksOverviewPanel.prototype.destroy = function () {
        _lodash2.default.invokeMap(this._destroyCallbacks, 'destroy');
    };

    exports.default = TasksOverviewPanel;
    module.exports = exports['default'];
});