define('bitbucket/internal/feature/tasks/model/task-collection', ['module', 'exports', 'backbone-brace', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/util/state', 'bitbucket/internal/feature/tasks/model/task', 'bitbucket/internal/feature/tasks/model/task-state'], function (module, exports, _backboneBrace, _events, _navbuilder, _state, _task, _taskState) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _task2 = babelHelpers.interopRequireDefault(_task);

    var _taskState2 = babelHelpers.interopRequireDefault(_taskState);

    var TaskCollection = _backboneBrace2.default.Collection.extend({
        model: _task2.default,

        initialize: function initialize() {
            // N.B. The 'remove' event on the collection is fired when a task is *deleted* from the collection
            this.on('remove', function (model) {
                if (!model.isNew()) {
                    // Only trigger the event if this is a task that has been synced to the server.
                    // The data passed the event needs to reflect the correct last state so that the right value is
                    // decremented
                    var task = model.toJSON();
                    task.lastState = task.state;
                    task.state = _taskState2.default.DEFAULT;
                    _events2.default.trigger('bitbucket.internal.feature.pull-request-tasks.deleted', null, {
                        task: task
                    });
                }
            });
        },

        url: _navbuilder2.default.rest('tasks').addPathComponents('pull-requests').withParams({
            repositoryId: _state2.default.getRepository().id,
            pullRequestId: _state2.default.getPullRequest().id,
            start: 0,
            limit: 1000
        }).build()
    });

    var sharedCollection = new TaskCollection();

    /**
     * Get a task collection instance that can be shared between modules to ensure that the same Tasks are being
     * manipualted.
     *
     * @returns {TaskCollection} a shared TaskCollection
     */
    TaskCollection.getCollection = function () {
        return sharedCollection;
    };

    exports.default = TaskCollection;
    module.exports = exports['default'];
});