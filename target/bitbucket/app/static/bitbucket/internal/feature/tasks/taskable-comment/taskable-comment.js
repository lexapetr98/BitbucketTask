define('bitbucket/internal/feature/tasks/taskable-comment/taskable-comment', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/events', 'bitbucket/util/state', 'bitbucket/internal/feature/comments/comment-async-web-panel', 'bitbucket/internal/feature/comments/utils', 'bitbucket/internal/feature/tasks/model/task', 'bitbucket/internal/feature/tasks/model/task-collection', 'bitbucket/internal/feature/tasks/task-list/comment-task-list-view'], function (module, exports, _jquery, _lodash, _events, _state, _commentAsyncWebPanel, _utils, _task, _taskCollection, _commentTaskListView) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _commentAsyncWebPanel2 = babelHelpers.interopRequireDefault(_commentAsyncWebPanel);

    var _task2 = babelHelpers.interopRequireDefault(_task);

    var _taskCollection2 = babelHelpers.interopRequireDefault(_taskCollection);

    var _commentTaskListView2 = babelHelpers.interopRequireDefault(_commentTaskListView);

    var taskCollection = _taskCollection2.default.getCollection();

    var commentTaskListViews = {};

    _events2.default.on('bitbucket.internal.feature.tasks.createTask', createTaskHandler);

    /**
     * Handles a "Create task" click on a comment - Grabs any selected text from the current comment to use
     * as the initial text for the task and delegates to the {CommentTaskListView} to get the task
     * created and added to the view.
     *
     * @param {jQuery|HTMLElement} comment comment element to create task for
     */
    function createTaskHandler(comment) {
        var commentId = (0, _jquery2.default)(comment).data('id');
        var text = (0, _utils.getCommentSelection)(comment.length ? comment.get(0) : comment);

        // create the new task in the comment list and add it to the shared
        // task collection, if it didn't already exist
        var listView = commentTaskListViews[commentId];
        var newTask = listView.createTask(text);
        if (newTask) {
            taskCollection.add(newTask);
        } else if (text) {
            // only proceed if we're augmenting the task with text from a selection
            newTask = listView.getCurrentTask();
            var currentTaskText = listView.getCurrentTaskText();
            currentTaskText = currentTaskText ? currentTaskText.trim() + ' ' : '';
            newTask.setText(currentTaskText + text);
        }
    }

    _events2.default.on('bitbucket.internal.feature.comments.commentDeleted', commentDeletedHandler);

    /**
     * If a comment with a task is deleted, remove that task from the collection
     *
     * @param {Object} comment
     */
    function commentDeletedHandler(comment) {
        // grab the first task we can find attached to this comment
        var task = taskCollection.find(function (task) {
            return task.getAnchor().id === comment.id;
        });
        if (task) {
            taskCollection.remove(task);
        }
    }

    _events2.default.on('bitbucket.internal.comment.commentContainerDestroyed', commentContainerDestroyHandler);

    /**
     * If a comment container with new tasks in progress is destroyed then destroy the associated task
     * models to ensure that the count is correctly updated.
     * @param $container
     */
    function commentContainerDestroyHandler($container) {
        var commentIds = $container.find('.task').map(function (idx, task) {
            return +task.dataset.commentId;
        });
        taskCollection.filter(function (task) {
            return _lodash2.default.includes(commentIds, task.getAnchor().id) && task.isNew();
        }).forEach(function (task) {
            return task.destroy();
        });
    }

    /**
     * A taskable comment view.
     *
     * Set up a new Model and View for this comment.
     *
     * @param context
     * @returns {*}
     */
    function newTaskableCommentView(context) {
        var comment = context.comment;

        // commentTaskCollection is a collection of tasks for the current comment, which should be a subset of
        // tasks that are present in the shared taskCollection - this means interactions between the activity stream
        // and dialog should work correctly as they will be sharing task model objects
        var commentTaskCollection = new _taskCollection2.default();
        _lodash2.default.forEach(comment.tasks, function (taskJSON) {
            var task = taskCollection.get(taskJSON.id);
            if (!task) {
                task = new _task2.default(taskJSON);
                task.setPullRequestId(_state2.default.getPullRequest().id);
                task.setRepositoryId(_state2.default.getRepository().id);
                taskCollection.add(task);
            }
            commentTaskCollection.add(task);
        });

        var renderContext = {
            comment: comment,
            collection: commentTaskCollection
        };

        // We wait for the task list element to be added to the DOM, then attach to
        // Backbone task views
        return _commentAsyncWebPanel2.default.getWebPanelEl(function ($placeholder) {
            var $ul = (0, _jquery2.default)(bitbucket.internal.feature.tasks.taskableComment.taskListPlaceholder());
            $placeholder.replaceWith($ul);
            renderTaskListPlaceholder($ul, renderContext);
        });
    }

    /**
     * Create and render a TaskListView with a Task List placeholder for a given element
     * @param {HTMLElement} el
     * @param {object} context - the render context
     * @param {TaskCollection} context.collection
     * @param {Comment} context.comment
     */
    function renderTaskListPlaceholder(el, context) {
        var $el = (0, _jquery2.default)(el);
        var taskListView = new _commentTaskListView2.default({
            collection: context.collection,
            el: $el,
            comment: context.comment,
            pullRequestId: _state2.default.getPullRequest().id,
            repositoryId: _state2.default.getRepository().id
        });
        taskListView.render();
        commentTaskListViews[context.comment.id] = taskListView;
    }

    /**
     * If we are currently in a Pull Request context
     * @param {object} context
     * @returns {boolean}
     */
    function isPullRequest(context) {
        return !!context.pullRequest;
    }

    exports.default = {
        // exposed for testing
        _commentTaskListViews: commentTaskListViews,
        newTaskableCommentView: newTaskableCommentView,
        isPullRequest: isPullRequest
    };
    module.exports = exports['default'];
});