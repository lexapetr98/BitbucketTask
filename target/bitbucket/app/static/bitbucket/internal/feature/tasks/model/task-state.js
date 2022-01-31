define('bitbucket/internal/feature/tasks/model/task-state', ['module', 'exports'], function (module, exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    /**
     * @enum {{DEFAULT: string, OPEN: string, RESOLVED: string, DELETED: string, Transitions: object}}
     */
    var TaskState = {
        DEFAULT: 'NONE',
        OPEN: 'OPEN',
        RESOLVED: 'RESOLVED',
        DELETED: 'DELETED'
    };

    TaskState.Transitions = {};
    TaskState.Transitions[TaskState.DEFAULT] = TaskState.OPEN;
    TaskState.Transitions[TaskState.OPEN] = TaskState.RESOLVED;
    TaskState.Transitions[TaskState.RESOLVED] = TaskState.OPEN;

    exports.default = TaskState;
    module.exports = exports['default'];
});