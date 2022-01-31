define('bitbucket/internal/feature/tasks/task-list/task-list-dialog', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/feature/tasks/model/task-state', 'bitbucket/internal/feature/tasks/task-list/task-list-table'], function (module, exports, _aui, _jquery, _lodash, _events, _navbuilder, _server, _taskState, _taskListTable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _taskState2 = babelHelpers.interopRequireDefault(_taskState);

    var _taskListTable2 = babelHelpers.interopRequireDefault(_taskListTable);

    var TASKS_LIST_DIALOG_ID = '#task-list-dialog';
    var TASK_LIST_LIST_ID = '#task-list-dialog-list';
    var countUrl = _navbuilder2.default.rest().currentPullRequest().addPathComponents('tasks', 'count').build();

    /**
     * Manages the Tasks List Dialog
     *
     * @param {Backbone.Collection} taskCollection collection of known Tasks
     * @constructor
     */
    function TaskListDialog(taskCollection) {
        this.init.apply(this, arguments);
    }

    /**
     * Manages the Tasks List Dialog
     *
     * @param {Backbone.Collection} taskCollection collection of known Tasks
     */
    TaskListDialog.prototype.init = function (taskCollection) {
        _lodash2.default.bindAll(this, 'openDialog', 'updateDialog', 'closeDialog', '_updateTaskCounts');

        var dialogTemplate = bitbucket.internal.feature.tasks.taskList.dialog();
        var $existingDialog = (0, _jquery2.default)(TASKS_LIST_DIALOG_ID);

        if ($existingDialog.length > 0) {
            $existingDialog.remove();
        }

        (0, _jquery2.default)(document.body).append(dialogTemplate);

        this._dialog = _aui2.default.dialog2(TASKS_LIST_DIALOG_ID);
        this._table = null;
        this._taskCollection = taskCollection;

        (0, _jquery2.default)('#dialog-close-button').click(this.closeDialog);

        _events2.default.on('bitbucket.internal.feature.tasks.visit-task', this.closeDialog);

        // When the dialog is shown, enable relevant keyboard shortcuts
        this._dialog.on('show', function () {
            (0, _jquery2.default)(document).on('keydown', handleKeyBoardNavigation);
        });

        // When the dialog is hidden, disable relevant keyboard shortcuts
        this._dialog.on('hide', function () {
            (0, _jquery2.default)(document).off('keydown', handleKeyBoardNavigation);
        });
    };

    /**
     * Map relevant shortcut keys to events that can be used to navigate the task list.
     *
     * @param {Event} e
     */
    function handleKeyBoardNavigation(e) {
        var keys = {
            69: 'E',
            74: 'J',
            75: 'K',
            79: 'O',
            32: 'SPACE',
            46: 'DELETE'
        };
        var events = {
            E: 'bitbucket.internal.feature.tasks.dialog.action.edit',
            J: 'bitbucket.internal.feature.tasks.dialog.action.moveNext',
            K: 'bitbucket.internal.feature.tasks.dialog.action.movePrevious',
            O: 'bitbucket.internal.feature.tasks.dialog.action.open',
            SPACE: 'bitbucket.internal.feature.tasks.dialog.action.transitionToNextState',
            DELETE: 'bitbucket.internal.feature.tasks.dialog.action.delete'
        };
        var key = keys[e.keyCode];
        var inFormElement = e.target.nodeName === 'TEXTAREA';
        if (!inFormElement) {
            if (key) {
                _events2.default.trigger(events[key]);
                e.preventDefault();
            }
        }
    }

    /**
     * Forces a reload of the contents of the dialog
     */
    TaskListDialog.prototype.updateDialog = function () {
        if (this._table) {
            this._table.update();
        }
    };

    /**
     * Initialise (if required) the Task List table, and open the task list dialog
     *
     * @param {object} context object containing the context - project, repo & PR - to display tasks for
     * @param {string} context.projectKey the project that the repo & PR belong to, to display tasks for
     * @param {object} context.repository the object representing the repository within which the pull request is contained
     * @param {number} context.pullRequestId the object representing the pull request, or the pull request id, that we want to display tasks for
     */
    TaskListDialog.prototype.openDialog = function (context) {
        this._dialog.show();

        if (!this._table) {
            var $scrollable = this._dialog.$el.find('.aui-dialog2-content');
            var $table = this._dialog.$el.find(TASK_LIST_LIST_ID);
            this._table = new _taskListTable2.default($table, $scrollable, this._taskCollection, context);
            this._table.on('dataLoaded', this._updateTaskCounts.bind(this, context));
        }

        /*
         * Always force a refresh when opening the dialog to take care of any
         * new tasks, and make sure tasks that have since become "resolved"
         * move to the bottom of the list.
         */
        this._table.update();
    };

    /**
     * Update the task counts. First figure out if a REST call is needed to fetch the counts. If not use the
     * tasks we have in the local collection to get the count.
     *
     * When counts are available, trigger an event with the updated counts.
     *
     * @param {Object} context - {@see TaskListDialog.openDialog}
     * @param {Object} data
     * @private
     */
    TaskListDialog.prototype._updateTaskCounts = function (context, data) {
        var groupedTasks;
        var promise = new _jquery2.default.Deferred();

        if (!data.isLastPage) {
            // If all tasks are not in the dialog right now, fetch the counts from the server
            promise = _server2.default.rest({ url: countUrl });
        } else {
            groupedTasks = this._taskCollection.groupBy('state');
            var openTasks = groupedTasks[_taskState2.default.OPEN];
            var resolvedTasks = groupedTasks[_taskState2.default.RESOLVED];
            // use 'open' and 'resolved' to match the REST output
            promise.resolve({
                open: openTasks ? openTasks.length : 0,
                resolved: resolvedTasks ? resolvedTasks.length : 0
            });
        }

        promise.done(function (counts) {
            _events2.default.trigger('bitbucket.internal.feature.pull-request-tasks.set-counts', null, {
                openTaskCount: counts.open,
                resolvedTaskCount: counts.resolved,
                pullRequestId: context.pullRequestId,
                repositoryId: context.repository.id,
                isReset: true
            });
        });
    };

    TaskListDialog.prototype.closeDialog = function () {
        this._dialog.hide();
    };

    exports.default = TaskListDialog;
    module.exports = exports['default'];
});