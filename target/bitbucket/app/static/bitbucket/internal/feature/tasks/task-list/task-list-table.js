define('bitbucket/internal/feature/tasks/task-list/task-list-table', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/tasks/model/task', 'bitbucket/internal/feature/tasks/model/task-state', 'bitbucket/internal/feature/tasks/task-list/task-list-row-view', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/widget/paged-table/paged-table'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _task, _taskState, _taskListRowView, _events, _function, _pagedTable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _task2 = babelHelpers.interopRequireDefault(_task);

    var _taskState2 = babelHelpers.interopRequireDefault(_taskState);

    var _taskListRowView2 = babelHelpers.interopRequireDefault(_taskListRowView);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _pagedTable2 = babelHelpers.interopRequireDefault(_pagedTable);

    /**
     * The table / list of tasks that is shown inside the Task List Dialog
     *
     * @augments PagedTable
     * @param {jQuery|HTMLElement} target - where this table should be rendered
     * @param {jQuery|HTMLElement} scrollable - the scrollable container
     * @param {Backbone.Collection} collection - tasks collection to use for known tasks
     * @param {object} context object - containing the context - project, repo & PR - to display tasks for
     * @param {string} context.projectKey - the project that the repo & PR belong to, to display tasks for
     * @param {object} context.repository - the repository that the PR belongs to, to display tasks for
     * @param {number} context.pullRequestId - the PR id to display tasks for
     * @constructor
     */
    function TaskListTable(target, scrollable, collection, context) {
        var self = this;

        this._scrollable = (0, _jquery2.default)(scrollable);
        this.$target = (0, _jquery2.default)(target);
        this.collection = collection;
        this.context = context;
        this._destroyables = [];

        this._resolvedHeaderOutput = false;

        _lodash2.default.bindAll(this, '_onTaskDestroy', '_handleEdit', '_handleMoveNext', '_handleMovePrevious', '_handleOpen', '_handleTransitionToNextState', '_handleDelete');

        this.collection.on('destroy', this._onTaskDestroy);

        this._taskRowViews = [];

        var options = {
            target: this.$target,
            noneFoundMessageHtml: bitbucket.internal.feature.tasks.taskList.dialogEmptyMessage,
            scrollPaneSelector: scrollable,
            rowSelector: '> li',
            taskContainerSelector: '.task-container',
            paginationContext: 'task-list',
            focusOptions: {
                rowSelector: '> li',
                focusedClass: 'focused'
            },
            statusCode: {
                '*': function _(jqXHR, textStatus, errorThrown, data, error) {
                    if (errorThrown === 'timeout' || jqXHR.status >= 500 && jqXHR.status <= 599) {
                        var message = bitbucket.internal.widget.paragraph({
                            text: error.message
                        });
                        self._addNoRowsMessage(error.message);
                        return false;
                    }
                    return true;
                }
            }
        };

        _pagedTable2.default.call(this, options);

        this.prNavBuilder = _navbuilder2.default.project(context.projectKey).repo(context.repository).pullRequest(context.pullRequestId);
        this.bindNavigationHandlers();
    }

    _lodash2.default.assign(TaskListTable.prototype, _pagedTable2.default.prototype);

    /**
     * Extend {TaskListTable} with event mixins
     */
    _events2.default.addLocalEventMixin(TaskListTable.prototype);

    TaskListTable.prototype._addNoRowsMessage = function (message) {
        this.$table.addClass('no-rows').after(this._new$Message(message || this.options.noneFoundMessageHtml()));
    };

    /**
     * Resets this task list to the initial state prior to loading data again
     *
     * @param {object} options new options to be optionally passed to PagedTable
     */
    TaskListTable.prototype.update = function (options) {
        this._resolvedHeaderOutput = false;

        _lodash2.default.invokeMap(this._taskRowViews, 'remove');
        this._taskRowViews = [];

        _pagedTable2.default.prototype.update.call(this, options).done(this.trigger.bind(this, 'dataLoaded'));
    };

    /**
     * Returns the URL used to retrieve tasks to fill the table based on the criteria supplied at construction
     * @param {number} start initial index to start the page of tasks at.
     * @param {number} limit number of tasks to retrieve in this page.
     */
    TaskListTable.prototype.buildUrl = function (start, limit) {
        var url = _navbuilder2.default.rest().project(this.context.projectKey).repo(this.context.repository).pullRequest(this.context.pullRequestId).addPathComponents('tasks').withParams({
            start: start,
            limit: limit,
            withComments: true
        }).build();
        return url;
    };

    TaskListTable.prototype.handleNewRows = function (data, attachmentMethod) {
        var self = this;

        /*
         * TODO: Currently the link to a comment in the activity stream is a full page refresh,
         * if on the Overivew tab already we could get clever and work out if the comment is already on the page,
         * and if so just highlight and scroll to it.
         */
        var rows = [];
        _lodash2.default.forEach(data.values, function (task) {
            var taskModel = self.collection.get(task.id);

            if (taskModel) {
                taskModel.set(task);
            } else {
                taskModel = new _task2.default(task);
                taskModel.setPullRequestId(self.context.pullRequestId);
                self.collection.add(taskModel);
            }

            var view = new _taskListRowView2.default({
                prNavBuilder: self.prNavBuilder,
                model: taskModel
            });

            self._taskRowViews.push(view);

            if (taskModel.getState() === _taskState2.default.RESOLVED && !self._resolvedHeaderOutput) {
                var sectionHeader = bitbucket.internal.feature.tasks.taskList.dialogContentSection({
                    title: _aui2.default.I18n.getText('bitbucket.web.tasks.dialog.resolved.subtitle')
                });
                rows.push(sectionHeader);
                self._resolvedHeaderOutput = true;
            }

            rows.push(view.render().$el);
        });

        self.$table.show()[attachmentMethod !== 'html' ? attachmentMethod : 'append'](rows);
    };

    TaskListTable.prototype.bindNavigationHandlers = function () {
        this._destroyables.push(_events2.default.chain().on('bitbucket.internal.feature.tasks.dialog.action.edit', this._handleEdit).on('bitbucket.internal.feature.tasks.dialog.action.moveNext', this._handleMoveNext).on('bitbucket.internal.feature.tasks.dialog.action.movePrevious', this._handleMovePrevious).on('bitbucket.internal.feature.tasks.dialog.action.open', this._handleOpen).on('bitbucket.internal.feature.tasks.dialog.action.transitionToNextState', this._handleTransitionToNextState).on('bitbucket.internal.feature.tasks.dialog.action.delete', this._handleDelete));
        this._destroyables.push(_pagedTable2.default.prototype.initShortcuts.call(this));
    };

    TaskListTable.prototype.destroy = function () {
        _pagedTable2.default.prototype.destroy.call(this);
        _lodash2.default.invokeMap(this._destroyables, 'destroy');
    };

    /**
     * Get the TaskListRowView for a given task. Will search the internal list of views for \
     * the one that belongs to the given task.
     *
     * @param {Task} task
     * @returns {TaskListRowView|undefined}
     */
    TaskListTable.prototype.getTaskListRowViewForTask = function (task) {
        var views = this._taskRowViews.filter(function (rowView) {
            return rowView.model.getId() === task.getId();
        });

        return views && views[0];
    };

    TaskListTable.prototype.focusInitialRow = function () {
        this._$focusedRow = this.$target.find(this.options.focusOptions.rowSelector + this.options.taskContainerSelector).first().addClass(this.options.focusOptions.focusedClass);
    };

    /**
     * Scroll a row to the focus top of the table. (Or as high as it can go)
     *
     * @param {jQuery}
     */
    TaskListTable.prototype.scrollToRow = function ($rowEl) {
        var containerTop = this._scrollable.offset().top;
        var containerScrollOffset = this._scrollable.scrollTop();
        var rowTop = $rowEl.offset().top;
        // get the offset of the row by getting the offset to the top of the container
        // then add the container scroll offset to get the position we need to scroll to.
        this._scrollable.scrollTop(rowTop - containerTop + containerScrollOffset);
    };

    /**
     * The method to use when finding the next task container to focus on when navigating through the task list.
     *
     * N.B. we use nextAll/prevAll because we want to be able to skip over the section headings
     *
     * @enum {string}
     */
    var FocusDirection = {
        UP: 'prevAll',
        DOWN: 'nextAll'
    };

    TaskListTable.prototype._handleMoveNext = function () {
        this._focusRow(FocusDirection.DOWN);
    };

    TaskListTable.prototype._handleMovePrevious = function () {
        this._focusRow(FocusDirection.UP);
    };

    /**
     * Focus the next row, depending on the direction we're going.
     *
     * @param {FocusDirection} directionMethod - the method to use to find the next/prev items
     * @param {boolean} dontScroll - whether the scrollable should be scrolled to the focused row
     * @private
     */
    TaskListTable.prototype._focusRow = function (directionMethod, dontScroll) {
        // If we can't find any prev/next rows return early.
        var $nextFocusRow = this._$focusedRow[directionMethod](this.options.taskContainerSelector);
        if (!$nextFocusRow.length) {
            return;
        }

        this._$focusedRow.removeClass(this.options.focusOptions.focusedClass);
        this._$focusedRow = $nextFocusRow.first().addClass(this.options.focusOptions.focusedClass);

        // In some situations it is undesirable to scroll to the next row,
        // for instance when the previously focused row has been deleted.
        if (!dontScroll) {
            this.scrollToRow(this._$focusedRow);
        }
    };

    TaskListTable.prototype._handleOpen = function () {
        // For now trigger a click on the anchor
        this._$focusedRow.find('.task-link-button').trigger('click');
        // TODO: ideally find the task-list-row-view for this Task and call an appropriate method on it?
        // TODO: This will need to be addressed once Anchors are a part of the Task model.
    };

    TaskListTable.prototype._handleEdit = function () {
        var view = this.getTaskListRowViewForTask(this.getTaskFromFocusedRow());
        view.setCollapsed(false);
        this._$focusedRow.find('.task-edit').trigger('click');
    };

    /**
     * Transition the focused task to the next state.
     *
     * @private
     */
    TaskListTable.prototype._handleTransitionToNextState = function () {
        var task = this.getTaskFromFocusedRow();

        if (task) {
            task.transitionToNextState();
        }
    };

    /**
     * Trigger a click on the delete button for the focused task to allow the TaskView to handle the deletion/confirmation
     *
     * @private
     */
    TaskListTable.prototype._handleDelete = function () {
        this._$focusedRow.find('.task-delete').trigger('click');
    };

    /**
     * Get the task from a focused row in the task dialog.
     *
     * @returns {Task|undefined}
     */
    TaskListTable.prototype.getTaskFromFocusedRow = function () {
        var taskId = this._$focusedRow.find('.task').data('task-id');
        return taskId && this.collection.get(taskId);
    };

    /**
     * Handler for when a task is removed from the collection of tasks that are being shown by this
     * dialog. This will remove the view, and take care of cleaning up if there are no more tasks remaining
     * or if there are no more resolved tasks remaining (remove the subheading).
     *
     * @param task
     */
    TaskListTable.prototype._onTaskDestroy = function (task) {
        var view = _lodash2.default.find(this._taskRowViews, _function2.default.dotEq('model', task));

        // the collection we're watching is the "all known tasks" collection which might not be the same
        // as the tasks being shown (although probably unlikely), so there might not be a view matching
        // the task we just removed, in which case we don't care.
        if (!view) {
            return;
        }

        var dir = this._$focusedRow.is(this.options.taskContainerSelector + ':last') ? FocusDirection.UP : FocusDirection.DOWN;
        this._focusRow(dir, true);

        view.remove();

        this._taskRowViews = _lodash2.default.without(this._taskRowViews, view);

        // we only need to check if there are no more resolved tasks if the task we're deleting
        // is resolved.  We use getLastState because the destroy handler on the task model will
        // have changed the state to DELETED.
        if (task.getLastState() === _taskState2.default.RESOLVED) {
            // the invoke and dothere can't be merged into one because otherwise the this context for getState is wrong and it fails
            var isModelResolved = _lodash2.default.flow(_function2.default.invoke('model.getState'), _function2.default.eq(_taskState2.default.RESOLVED));
            if (!this._taskRowViews.some(isModelResolved)) {
                this._resolvedHeaderOutput = false;
                this.$table.find('.section-heading').remove();
            }
        }

        if (this._taskRowViews.length === 0) {
            this._addNoRowsMessage();
        }
    };

    exports.default = TaskListTable;
    module.exports = exports['default'];
});