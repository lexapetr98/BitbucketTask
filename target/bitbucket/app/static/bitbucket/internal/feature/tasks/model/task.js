define('bitbucket/internal/feature/tasks/model/task', ['module', 'exports', '@atlassian/aui', 'backbone', 'backbone-brace', 'lodash', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/comments/utils', 'bitbucket/internal/feature/tasks/model/task-state', 'bitbucket/internal/model/stash-user'], function (module, exports, _aui, _backbone, _backboneBrace, _lodash, _events, _navbuilder, _utils, _taskState, _stashUser) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _backbone2 = babelHelpers.interopRequireDefault(_backbone);

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _taskState2 = babelHelpers.interopRequireDefault(_taskState);

    var _stashUser2 = babelHelpers.interopRequireDefault(_stashUser);

    /**
     * Task anchor types
     * @enum {{COMMENT: string}}
     */
    var Anchor = {
        COMMENT: 'COMMENT'
    };

    var taskUrlBuilder = _navbuilder2.default.rest().addPathComponents('tasks');

    function getEventName(postfix) {
        return postfix && 'bitbucket.internal.feature.pull-request-tasks.' + postfix;
    }

    var Task = _backboneBrace2.default.Model.extend({
        namedAttributes: {
            // mandatory fields
            id: 'number',
            anchor: null,
            state: 'string',
            author: _stashUser2.default,
            createdDate: 'number',
            // optional fields
            text: 'string',
            html: 'string',
            properties: null,
            permittedOperations: null,
            // transient fields
            lastState: 'string',
            pendingSync: 'boolean',
            pullRequestId: 'number',
            repositoryId: 'number'
        },

        defaults: {
            state: _taskState2.default.OPEN,
            text: '',
            pendingSync: false,
            permittedOperations: {}
        },

        url: function url() {
            var builder = taskUrlBuilder;

            // for updates add the ID to the path
            if (!this.isNew()) {
                builder = builder.addPathComponents(this.getId());
            }

            return builder.build();
        },

        /**
        * Initialise this task, if this is a new open task then we fire the correct
        * event so that the counter gets updated.
        */
        initialize: function initialize() {
            this.on('sync', function () {
                if (!this._previousAttributes.id) {
                    this._triggerTaskEvent(getEventName('created'));
                }
                this._triggerTaskEvent(getEventName('saved'));
            });
        },

        /**
        * Figure out what the next state after the current state is.
        *
        * @returns {TaskState}
        */
        nextState: function nextState() {
            return _taskState2.default.Transitions[this.getState()];
        },

        eventNameForState: function eventNameForState(nextState) {
            // find out what the next event name for this task should be.
            switch (nextState) {
                case _taskState2.default.OPEN:
                    if (!this._previousAttributes.id) {
                        return getEventName('created');
                    }
                    return getEventName('reopened');

                case _taskState2.default.RESOLVED:
                    return getEventName('resolved');

                case _taskState2.default.DELETED:
                    return getEventName('deleted');

                case _taskState2.default.DEFAULT:
                /* falls through */
                default:
                    return getEventName('default');
            }
        },
        /**
        * Transition a task from one state to the next.
        *
        * @returns {Promise}
        */
        transitionToNextState: function transitionToNextState() {
            return this._updateState(this.nextState());
        },

        changeState: function changeState(newState) {
            this.set({
                state: newState,
                lastState: this.getState()
            }, {
                local: true
            });
            this._triggerTaskEvent(this.eventNameForState(newState));
        },

        _updateState: function _updateState(nextState) {
            var currentState = this.getState();
            var eventName = this.eventNameForState(nextState);
            var self = this;

            // Note that we explicitly set the new values *before* saving (and not as part of the save) to generate
            // 2 distinct events, the `change` event when setting properties and the `sync` event when the save completes.
            this.changeState(nextState);

            return this.save().done(function () {
                // If the server's state and the local state mismatch, trigger the appropriate event
                // for the state of the task on the server
                if (self.getState() !== nextState) {
                    eventName = self.eventNameForState(self.getState());
                    self._triggerTaskEvent(eventName);
                }
            }).fail(function () {
                // revert the task state.
                self.set({
                    state: currentState,
                    lastState: nextState
                });

                self._triggerTaskEvent(getEventName('failed-transition'));
            });
        },

        /**
        * Update the text of a task and save it, restoring the old text on failure
        * (for optimisic updates).  Always returns a promise, if there's a validation
        * error then this promise will be rejected with the error.
        *
        * @param {string} text
        * @returns {Promise}
        */
        updateText: function updateText(text) {
            var self = this;
            var oldText = this.getText();
            var sanitisedText = (0, _utils.sanitiseText)(text);
            this.setText(sanitisedText);

            return (this.save() || _backbone2.default.$.Deferred().reject(this.validationError)).fail(function () {
                if (sanitisedText !== '') {
                    self.setText(oldText);
                }
            });
        },

        validate: function validate(attrs, options) {
            var sanitisedText = (0, _utils.sanitiseText)(attrs.text);
            if (sanitisedText !== attrs.text) {
                return _aui2.default.I18n.getText('bitbucket.web.tasks.error.invalidText');
            }

            if (attrs.text === '') {
                return _aui2.default.I18n.getText('bitbucket.web.tasks.error.missingText');
            }
        },

        sync: function sync(method, model, options) {
            // We set a transient property to indicate a pending sync in order to
            // have something for the soy template for rendering a task to use to
            // determine whether to add a 'task-pending-sync' class
            this.setPendingSync(true);

            var syncPromise = _backbone2.default.sync(method, model, _lodash2.default.assign(options, {
                statusCode: {
                    404: function _(xhr, testStatus, errorThrown, data) {
                        var error = _lodash2.default.get(data, 'errors.0');
                        var message = error && error.message;
                        if (method !== 'create') {
                            message = _aui2.default.I18n.getText('bitbucket.web.tasks.noSuchTask', bitbucket.internal.util.productName());
                        }
                        return {
                            title: _aui2.default.I18n.getText('bitbucket.web.tasks.noSuchTask.title'),
                            message: message,
                            shouldReload: true,
                            fallbackUrl: undefined
                        };
                    }
                }
            }));

            syncPromise.always(this.setPendingSync.bind(this, false));

            return syncPromise;
        },

        _triggerTaskEvent: function _triggerTaskEvent(name, data) {
            if (data === this) {
                // don't extend a task model
                data = {};
            }
            _events2.default.trigger(name, null, _lodash2.default.assign({
                task: this.toJSON()
            }, data));
        }
    }, {
        Anchor: Anchor
    });

    exports.default = Task;
    module.exports = exports['default'];
});