define('bitbucket/internal/feature/tasks/task-list/task-list', ['module', 'exports', 'jquery', 'bitbucket/util/events', 'bitbucket/util/state', 'bitbucket/internal/feature/tasks/model/task-collection', 'bitbucket/internal/feature/tasks/task-list/task-list-dialog'], function (module, exports, _jquery, _events, _state, _taskCollection, _taskListDialog2) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _taskCollection2 = babelHelpers.interopRequireDefault(_taskCollection);

    var _taskListDialog3 = babelHelpers.interopRequireDefault(_taskListDialog2);

    var _taskListDialog;
    var openEventData = {};

    /**
     * Initialises (if required) and opens the PR Task List dialog
     *
     * @param {string} projectKey the project that the repo & PR belong to, to display tasks for
     * @param {object} repository object containing the id and slug of the repository to display tasks for
     * @param {number} pullRequestId PR within the repository to display tasks for
     * @param {HTMLElement} [target] - the target of the DOM event that triggered this. Optional because this can be
     *                                 triggered programmatically as well.
     */
    function openTaskListDialog(projectKey, repository, pullRequestId, target) {
        var context = {
            projectKey: projectKey,
            repository: repository,
            pullRequestId: pullRequestId
        };

        openEventData.sourceEl = target;

        if (!_taskListDialog) {
            _taskListDialog = new _taskListDialog3.default(_taskCollection2.default.getCollection());
            _taskListDialog._dialog.on('beforeShow', function () {
                _events2.default.trigger('bitbucket.internal.feature.tasks.list.opened', null, openEventData);
            });
            _taskListDialog._dialog.on('close', function () {
                _events2.default.trigger('bitbucket.internal.feature.tasks.list.closed');
            });
        }

        _taskListDialog.openDialog(context);
    }

    /**
     * This is used by the keyboard shortcut to open the dialog for the current
     * PR
     */
    function openTaskListDialogForCurrentPullRequest() {
        openTaskListDialog(_state2.default.getProject(), _state2.default.getRepository(), _state2.default.getPullRequest().id);
    }

    function onReady() {
        (0, _jquery2.default)(document).on('click', '.task-list-dialog-link', function (event) {
            event.preventDefault();
            var $target = (0, _jquery2.default)(event.currentTarget);
            var projectKey = $target.data('project-key') || _state2.default.getProject().key;
            var pullRequestId = $target.data('pull-request-id') || _state2.default.getPullRequest().id;

            /* The reason repository is an object is because in the Task List Dialog we need to make a REST
             * request to get the list of tasks, which requires a PR id, and also provide a link to a
             * comment in the activity stream, which requires a repo slug.  Creating this mini repo
             * object avoids having to pass both variables and the navBuilder supports building from
             * an object with this signature.
             */
            var repository = {
                id: $target.data('repository-id') || _state2.default.getRepository().id,
                slug: $target.data('repository-slug') || _state2.default.getRepository().slug
            };
            openTaskListDialog(projectKey, repository, pullRequestId, event.currentTarget);
        });
    }

    exports.default = {
        openTaskListDialogForCurrentPullRequest: openTaskListDialogForCurrentPullRequest,
        onReady: onReady
    };
    module.exports = exports['default'];
});