define('bitbucket/internal/feature/tasks/tasks-overview/tasks-counter', ['module', 'exports', 'baconjs', 'jquery', 'lodash', 'bitbucket/internal/feature/tasks/model/task-state', 'bitbucket/internal/util/bacon', 'bitbucket/internal/util/function'], function (module, exports, _baconjs, _jquery, _lodash, _taskState, _bacon, _function) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _baconjs2 = babelHelpers.interopRequireDefault(_baconjs);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _taskState2 = babelHelpers.interopRequireDefault(_taskState);

    var _bacon2 = babelHelpers.interopRequireDefault(_bacon);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    /**
     * This object contains a stream of count change events for tasks, and can
     * provide a property that tracks the counts for a single pull requests to
     * be used on the pull requests list and pull request overview page task count
     * panel
     *
     * @constructor
     */
    function TasksCounter() {
        this.init.apply(this, arguments);
    }

    /**
     * Initialises a TaskCounter which contains a stream of count change events for tasks,
     * and can provide a property that tracks the counts for a single pull requests to
     * be used on the pull requests list and pull request overview page task count
     * panel
     */
    TasksCounter.prototype.init = function () {
        var self = this;
        this._destroyCallbacks = [];

        _lodash2.default.bindAll(this, '_mapEventData');

        var eventNames = ['created', 'resolved', 'reopened', 'deleted', 'failed-transition'];
        this._taskCounterStream = _baconjs2.default.mergeAll(_lodash2.default.map(eventNames, function (name) {
            return _bacon2.default.events('bitbucket.internal.feature.pull-request-tasks.' + name).map(self._mapEventData);
        })
        // merge the set-counts event on separately as we don't want to run it through _mapEventData
        ).merge(_bacon2.default.events('bitbucket.internal.feature.pull-request-tasks.set-counts'));
    };

    /**
     * Returns an empty object that is in the format that the counter maintains
     *
     * @param {object} [context]
     * @param {number} [context.pullRequestId=null] the pull request id to embed in the counter object
     * @param {number} [context.repositoryId=null] the repository id to embed in the counter object. Defaults to the current repository ID
     * @returns {object} a counter object with all values set to 0
     */
    TasksCounter.prototype.emptyCounter = function (context) {
        var counter = {
            openTaskCount: 0,
            resolvedTaskCount: 0,
            pullRequestId: context && context.pullRequestId || null,
            repositoryId: context && context.repositoryId || null
        };

        return counter;
    };

    /**
     * Internal function which maps the context of a Task event to an object containing
     * the change to the counts of various tasks that occurred
     *
     * @param {object} context - a context object delivered by an event triggered by the TaskModel
     * @returns {object} information about the change to each state of task that occurred due to this event
     * @private
     */
    TasksCounter.prototype._mapEventData = function (context) {
        var change = this.emptyCounter(context.task);

        switch (context.task.state) {
            case _taskState2.default.OPEN:
                change.openTaskCount = 1;
                break;
            case _taskState2.default.RESOLVED:
                change.resolvedTaskCount = 1;
                break;
        }

        switch (context.task.lastState) {
            case _taskState2.default.OPEN:
                change.openTaskCount = -1;
                break;
            case _taskState2.default.RESOLVED:
                change.resolvedTaskCount = -1;
                break;
        }

        return change;
    };

    /**
     * Creates a Bacon property that tracks the task count by state for a particular
     * pull request, given an initial starting count
     *
     * @param {object} context
     * @param {number} context.pullRequestId - the pull request id to filter events by
     * @param {number} context.repositoryId - the repository id to filter events by
     * @param {Bacon.Stream} initialValueProvider - a single value stream that provides the initial values for this pull request
     * @returns {Bacon.Property}
     */
    TasksCounter.prototype.countPropertyForPullRequest = function (context, initialValueProvider) {
        var self = this;
        var property = this._taskCounterStream.merge(initialValueProvider).filter(function (value) {
            return value.pullRequestId === context.pullRequestId && value.repositoryId === context.repositoryId;
        }).scan(this.emptyCounter(context), function (counts, change) {
            // "reset" events are expected to have the correct total values in them
            if (change.isReset) {
                counts = self.emptyCounter(change);
            }

            counts.openTaskCount += change.openTaskCount;
            counts.resolvedTaskCount += change.resolvedTaskCount;
            return counts;
        });

        /*
         * HACK: the behaviour of a Bacon property is that if nobody is listening
         * then it doesn't get updated, so we need a null listener to make sure
         * the task count is current even in this situation.
         */
        this._destroyCallbacks.push(property.onValue(_jquery2.default.noop));

        return property;
    };

    /**
     * Destroys this TasksCounter by removing the internal listener for any
     * properties that have been created
     */
    TasksCounter.prototype.destroy = function () {
        _function2.default.applyAll(this._destroyCallbacks);
    };

    exports.default = TasksCounter;
    module.exports = exports['default'];
});