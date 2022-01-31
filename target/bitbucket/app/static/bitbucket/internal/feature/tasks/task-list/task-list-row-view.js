define('bitbucket/internal/feature/tasks/task-list/task-list-row-view', ['module', 'exports', 'backbone', 'jquery', 'lodash', 'bitbucket/util/events', 'bitbucket/internal/feature/tasks/model/task-state', 'bitbucket/internal/feature/tasks/task-view/task-view', 'bitbucket/internal/util/feature-detect', 'bitbucket/internal/util/function'], function (module, exports, _backbone, _jquery, _lodash, _events, _taskState, _taskView, _featureDetect, _function) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backbone2 = babelHelpers.interopRequireDefault(_backbone);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _taskState2 = babelHelpers.interopRequireDefault(_taskState);

    var _taskView2 = babelHelpers.interopRequireDefault(_taskView);

    var _featureDetect2 = babelHelpers.interopRequireDefault(_featureDetect);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    exports.default = _backbone2.default.View.extend({
        events: {
            'click .task-content': 'taskListContentClicked',
            'click .task-link-button': 'taskListLinkClicked',
            'click .comment-diff-anchor .aui-button': 'taskListDiffAnchorClicked'
        },

        defaults: {
            isCollapsible: true,
            showLink: true,
            initialTaskViewMode: _taskView2.default.Mode.VIEW
        },

        initialize: function initialize(options) {
            this.options = _lodash2.default.assign({}, this.defaults, options);
            this.isCollapsed = this.options.isCollapsible;

            this.taskView = new _taskView2.default({
                model: this.model,
                mode: this.options.initialTaskViewMode,
                prNavBuilder: this.prNavBuilder,
                showLink: this.options.showLink
            });

            this.focusEditor = this.taskView.focusEditor;
            this.getEditorText = this.taskView.getEditorText;

            this.listenTo(this.model, 'change:state', this._handleTaskChangeState);
            this.listenTo(this.model, 'change:text', this._handleTaskChangeText);

            if (this.options.isCollapsible) {
                _lodash2.default.bindAll(this, 'handleTaskExpand');
                _events2.default.on('bitbucket.internal.feature.tasks.list.expand', this.handleTaskExpand);
            }
        },

        template: _function2.default.dot('bitbucket.internal.feature.tasks.taskList.taskListRow')(window),

        /**
         * Build the URL for the comment that belongs to this view's model.
         *
         * @returns {string}
         */
        activityUrl: function activityUrl() {
            var anchor = this.model.getAnchor();
            return this.options.prNavBuilder.overview().comment(anchor.id).build();
        },

        /**
         * Build the URL to go to the comment's diff anchor.
         *
         * @returns {string}
         */
        diffUrl: function diffUrl(path) {
            return this.options.prNavBuilder.diff().change(path).build();
        },

        /**
         * Render the task state on a comment for a given state, it is expected that this
         * will be called once on initial render and subsequent updates will only happen
         * to the task view
         *
         * @returns {Backbone.View}
         */
        render: function render() {
            var $row = (0, _jquery2.default)(this.template({
                isCollapsed: this.isCollapsed
            }));

            $row.append(this.taskView.render().$el);

            this.$el.replaceWith($row);
            this.setElement($row);

            return this;
        },

        /**
         * Handle the click event on the action button for an individual task.
         */
        transitionTaskHandler: function transitionTaskHandler() {
            this.model.transitionToNextState();
        },

        /**
         * When the task list content is clicked, check if the click occurred on a link or
         * on a different part of the content.
         *
         * @param {Event} e
         */
        taskListContentClicked: function taskListContentClicked(e) {
            if (!this.options.isCollapsible) {
                return;
            }

            var $target = (0, _jquery2.default)(e.target);

            if ($target.is('a')) {
                // send them on their merry way
                return;
            }

            this.setCollapsed(!this.isCollapsed);
        },

        setCollapsed: function setCollapsed(collapsed) {
            var self = this;
            this.isCollapsed = collapsed;

            // TODO move this to a common animation component?
            function _transitionState(height, intermediaryClass, finalClass, removeClasses) {
                function _finalise() {
                    self.$el.removeClass([intermediaryClass, removeClasses].join(' ')).addClass(finalClass).css({ height: '' });
                }

                self.$el.css({ height: height }).addClass(intermediaryClass);

                if (_featureDetect2.default.cssTransition()) {
                    self.$el.one(_featureDetect2.default.transitionEndEventName(), _finalise);
                } else {
                    _finalise();
                }
            }

            function _taskHeight() {
                return self.$el.find('.task').get(0).scrollHeight;
            }

            if (this.isCollapsed) {
                this.$el.css({ height: _taskHeight() }).removeClass('expanded');

                // we need to ensure that the absolute height style is applied before
                // we kick off the transition to allow the transition animation to
                // actually occur
                _lodash2.default.defer(_transitionState.bind(this, '', 'collapsing', 'collapsed', 'expanded expanding'));
            } else {
                // Don't bother expanding tasks that are not open.
                if (this.model.getState() !== _taskState2.default.OPEN) {
                    return;
                }
                _events2.default.trigger('bitbucket.internal.feature.tasks.list.expand', null, this);
                this.$el.removeClass('collapsed');
                _transitionState(_taskHeight(), 'expanding', 'expanded', 'collapsed collapsing');
            }
        },

        taskListDiffAnchorClicked: function taskListDiffAnchorClicked(event) {
            var path = this.model.getProperties().diffAnchorPath;
            this._handleTaskClick(event, 'bitbucket.internal.layout.pull-request.urlRequested', this.diffUrl(path));
            this.triggerTaskVisitedEvent({ location: 'diff' });
        },

        taskListLinkClicked: function taskListLinkClicked(event) {
            this._handleTaskClick(event, 'bitbucket.internal.layout.pull-request.urlRequested', this.activityUrl());
            this.triggerTaskVisitedEvent({ location: 'activity-stream' });
        },

        /**
         * Trigger the visit-task event with an appropriate
         * @param {object} eventData
         */
        triggerTaskVisitedEvent: function triggerTaskVisitedEvent(eventData) {
            eventData = _lodash2.default.assign({}, { task: this.model.toJSON() }, eventData);
            _events2.default.trigger('bitbucket.internal.feature.tasks.visit-task', null, eventData);
        },

        /**
         * Event handler for the 'expand' event, which indicates another row is expanding and so
         * if this row is expanded it should collapse itself.
         *
         * @param {TaskListRowView} context the row that is expanding
         */
        handleTaskExpand: function handleTaskExpand(context) {
            // if this is us, or we're collapsed, ignore us
            if (context === this || this.isCollapsed) {
                return;
            }
            if (this.taskView.mode === _taskView2.default.Mode.EDIT) {
                this.taskView.cancelTaskEdit();
            }
            this.setCollapsed(true);
        },

        /**
         * Highlights this row - usually for indicating a new task
         */
        highlight: function highlight() {
            var _finalise = this.$el.removeClass.bind(this.$el, 'task-highlight');

            this.$el.addClass('task-highlight');
            if (_featureDetect2.default.cssAnimation()) {
                this.$el.one(_featureDetect2.default.animationEndEventName(), _finalise);
            } else {
                // for browsers without animation support (IE9) just highlight
                // for the same amount of time as the animation
                setTimeout(_finalise, 5000);
            }
        },

        /**
         * Handles whenever the user clicks on a task's deep link.
         *
         * @param {Event} e original click event
         * @param {string} eventName internal event to fire
         * @private
         */
        _handleTaskClick: function _handleTaskClick(e, eventName) {
            e.preventDefault();
            // request the new URL and trigger further events that can be watched.
            _events2.default.trigger.apply(this, [eventName, null].concat(_lodash2.default.toArray(arguments).slice(2)));
        },

        /**
         * If this task is being deleted we need to add a "pending-delete" class
         * to the row.
         *
         * @param task
         * @private
         */
        _handleTaskChangeState: function _handleTaskChangeState(task) {
            this.$el.toggleClass('pending-delete', task.getState() === _taskState2.default.DELETED);
        },

        /**
         * If the task's text has changed and this is a new task then highlight it.
         *
         * @param task
         * @private
         */
        _handleTaskChangeText: function _handleTaskChangeText(task) {
            if (task.isNew() && task.getText() !== '') {
                this.highlight();
            }
        }
    });
    module.exports = exports['default'];
});