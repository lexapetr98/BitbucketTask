define('bitbucket/internal/feature/tasks/task-list/comment-task-list-view', ['module', 'exports', 'backbone', 'lodash', 'bitbucket/internal/feature/tasks/model/task', 'bitbucket/internal/feature/tasks/task-list/task-list-row-view', 'bitbucket/internal/feature/tasks/task-view/task-view', 'bitbucket/internal/util/events', 'bitbucket/internal/util/feature-detect', 'bitbucket/internal/util/function'], function (module, exports, _backbone, _lodash, _task, _taskListRowView, _taskView, _events, _featureDetect, _function) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backbone2 = babelHelpers.interopRequireDefault(_backbone);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _task2 = babelHelpers.interopRequireDefault(_task);

    var _taskListRowView2 = babelHelpers.interopRequireDefault(_taskListRowView);

    var _taskView2 = babelHelpers.interopRequireDefault(_taskView);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _featureDetect2 = babelHelpers.interopRequireDefault(_featureDetect);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    /**
     * Represents the task list for a single comment, the model should be a
     * {Backbone.Collection} of {Task} models.  This view handles rendering the
     * rows of tasks, with the task itself being rendered by a {TaskView}.
     */
    var CommentTaskListView = _backbone2.default.View.extend({
        defaults: {
            pullRequestId: null
        },

        /**
         * Initialises the view and setups up event listeners for the underlying collection
         *
         * @param {object} options
         * @param {object} options.defaultTaskAttrs default attributes to add to a task created by this view
         *
         */
        initialize: function initialize(options) {
            var self = this;
            this.comment = options.comment;
            // we only care about tasks being added and removed, changes will be
            // handled within the task views
            ['add', 'remove'].forEach(function (event) {
                self.listenTo(self.collection, event, self.render.bind(self, event));
            });

            this.options = _lodash2.default.assign({}, this.defaults, options);
            this.taskRowViews = [];
        },

        /**
         * Get the new task that is currently being added to this comment task list view
         *
         * @returns {Task}
         */
        getCurrentTask: function getCurrentTask() {
            return this.collection.find(_function2.default.invoke('isNew'));
        },

        /**
         * Get the text currently in the editor for the currently active task
         * @returns {string}
         */
        getCurrentTaskText: function getCurrentTaskText() {
            return this.getCurrentTaskRowView().getEditorText() || '';
        },

        /**
         * Get the current task row view based on the current task.
         *
         * @returns {TaskListRowView}
         */
        getCurrentTaskRowView: function getCurrentTaskRowView() {
            return this._findRowViewForTask(this.getCurrentTask());
        },

        /**
         * Creates a new task in this view, using the provided text as the initial
         * task text. If the text is provided then we auto-save the task to have
         * it appear in view mode straight away (rather than edit mode).
         *
         * @param [text] initial text to use for the task
         * @returns {?Task} the task that was created or null if there is already a task being created
         */
        createTask: function createTask(text) {
            // if there is already a task being created then focus on it and abort early
            var rowView = this.getCurrentTaskRowView();
            if (rowView) {
                rowView.focusEditor();
                return null;
            }

            var task = new _task2.default({
                anchor: {
                    id: this.comment.id,
                    type: _task2.default.Anchor.COMMENT
                },
                pullRequestId: this.options.pullRequestId,
                repositoryId: this.options.repositoryId,
                text: text
            });

            // new task should show at the top of the list of tasks
            this.collection.unshift(task);

            if (text) {
                // if this task was prefilled, add a transient property to the task
                // so various other places can use this if required.
                task.prefilled = true;
                // if the save failed remove from the collection to cause
                // it to be removed from the DOM (AJAX utils take care of
                // showing an error dialog)
                task.save().fail(this.collection.remove.bind(this.collection, task));
            }

            return task;
        },

        /**
         * Handle rendering the view, if there is no action supplied then the whole
         * view and all it's rows are re-rendered, this should only happen on initial
         * render to populate the initial tasks, otherwise an action should be supplied
         * in order to cause the correct manipulation to happen. We can't re-render the
         * full view each time because we need to be able to better handle animations.
         *
         * @param {string} [action] - action that resulted in this render, should be one of add, remove or change:id.
         * @param {Task} [task] - task model object that is being rendered if this is the result of a collection event
         *
         * @returns {CommentTaskListView} this view
         */
        render: function render(action, task) {
            var self = this;
            var view;

            // we remove the `.pending-delete` class so that the current height calculations includes it,
            // and the height transition to the new height is visible
            this.$('.pending-delete').removeClass('pending-delete');
            var currentHeight = this.$el.outerHeight(true);

            this.$el.css({ height: currentHeight });

            function taskRowViewForTask(task) {
                return new _taskListRowView2.default({
                    model: task,
                    initialTaskViewMode: task.isNew() && task.getText() === '' ? _taskView2.default.Mode.EDIT : _taskView2.default.Mode.VIEW,
                    isCollapsible: false,
                    showLink: false
                });
            }

            var animateTask = false;
            switch (action) {
                case 'remove':
                    view = this._findRowViewForTask(task);

                    if (view) {
                        view.$el.addClass('pending-delete').trigger('comment-child-removed');
                        view.remove();
                        this.taskRowViews = _lodash2.default.without(this.taskRowViews, view);
                    }

                    animateTask = true;
                    break;

                case 'add':
                    // for an `add` event the 4th argument is an object that
                    // includes information about the change, including the index
                    // in the collection that the change occurred at in an `at` property.
                    var index = arguments[3].at;
                    view = taskRowViewForTask(task);
                    this.taskRowViews.splice(index, 0, view);

                    var $view = view.render().$el;
                    var $context = this.$(this.$('li').get(index));

                    if ($context.length) {
                        $context.before($view);
                    } else {
                        this.$el.append($view);
                    }

                    // if this is a new task with pre-populated text then highlight now
                    if (task.isNew() && task.getText() !== '') {
                        view.highlight();
                    }

                    $view.trigger('comment-child-added');
                    animateTask = true;
                    break;

                default:
                    // re-render everything (should only be initial render)
                    _lodash2.default.invokeMap(this.taskRowViews, 'remove');
                    this.taskRowViews = this.collection.map(taskRowViewForTask);
                    this.$el.append(this.taskRowViews.map(function (taskRowView) {
                        return taskRowView.render().$el;
                    }));
                    break;
            }

            var taskListHeight = this.taskRowViews.reduce(function (total, taskView) {
                return total + taskView.$el.outerHeight(true);
            }, 0);

            function _resetTaskListHeight(fireEvent) {
                self.$el.removeClass('transition-height' // required for Safari - STASHDEV-7774
                ).css({ height: 'auto' });

                if (fireEvent) {
                    _events2.default.trigger('bitbucket.internal.webpanel.resize', null, {
                        location: 'bitbucket.comments.extra',
                        el: self.$el.get(0)
                    });
                }
            }

            if (_featureDetect2.default.cssTransition() && animateTask) {
                this.$el.addClass('transition-height' // required for Safari - STASHDEV-7774
                ).css({ height: taskListHeight }).one(_featureDetect2.default.transitionEndEventName(), _resetTaskListHeight.bind(self, true));
            } else {
                _resetTaskListHeight(false);
            }

            return this;
        },

        _findRowViewForTask: function _findRowViewForTask(task) {
            return _lodash2.default.find(this.taskRowViews, { model: task });
        }
    });

    exports.default = CommentTaskListView;
    module.exports = exports['default'];
});