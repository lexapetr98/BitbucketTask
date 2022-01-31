define('bitbucket/internal/page/repository/settings/general/repository-settings', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/feature/project/project-selector/project-selector', 'bitbucket/internal/feature/repository/branch-selector/branch-selector', 'bitbucket/internal/feature/repository/cloneUrlGen/cloneUrlGen', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/error', 'bitbucket/internal/util/notifications/notifications', 'bitbucket/internal/util/set-dialog-buttons-disabled', 'bitbucket/internal/widget/confirm-dialog/confirm-dialog', 'bitbucket/internal/widget/submit-spinner/submit-spinner'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _server, _projectSelector, _branchSelector, _cloneUrlGen, _pageState, _error, _notifications, _setDialogButtonsDisabled, _confirmDialog, _submitSpinner) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _projectSelector2 = babelHelpers.interopRequireDefault(_projectSelector);

    var _branchSelector2 = babelHelpers.interopRequireDefault(_branchSelector);

    var _cloneUrlGen2 = babelHelpers.interopRequireDefault(_cloneUrlGen);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _error2 = babelHelpers.interopRequireDefault(_error);

    var _notifications2 = babelHelpers.interopRequireDefault(_notifications);

    var _setDialogButtonsDisabled2 = babelHelpers.interopRequireDefault(_setDialogButtonsDisabled);

    var _confirmDialog2 = babelHelpers.interopRequireDefault(_confirmDialog);

    var _submitSpinner2 = babelHelpers.interopRequireDefault(_submitSpinner);

    function createMoveDialog() {
        var content = bitbucket.internal.page.moveRepositoryForm({
            repository: _pageState2.default.getRepository().toJSON()
        });

        var moveButton = aui.buttons.button({
            text: _aui.I18n.getText('bitbucket.web.button.move'),
            extraClasses: ['button', 'move-button']
        });

        var cancelButton = aui.buttons.button({
            text: _aui.I18n.getText('bitbucket.web.button.cancel'),
            type: 'link',
            extraClasses: 'cancel-button'
        });

        var moveDialog = (0, _aui.dialog2)(aui.dialog.dialog2({
            id: 'repository-move-dialog',
            titleText: _aui.I18n.getText('bitbucket.web.repository.move.title'),
            content: content,
            headerActionContent: '<div tabindex="0"></div>', // TODO: Remove once https://ecosystem.atlassian.net/browse/AUI-4403 is fixed
            footerActionContent: moveButton + cancelButton
        }));

        // bind project selector
        var $projectSelectorTrigger = moveDialog.$el.find('#moveProjectSelector');
        var projectSelector = new _projectSelector2.default($projectSelectorTrigger, {
            field: $projectSelectorTrigger.next('input')
        });

        // bind cloneUrlGen
        var $repoName = moveDialog.$el.find('#moveName');
        var $cloneUrl = moveDialog.$el.find('.clone-url-generated span');
        _cloneUrlGen2.default.bindUrlGeneration($cloneUrl, {
            elementsToWatch: [$repoName, $projectSelectorTrigger],
            getProject: projectSelector.getSelectedItem.bind(projectSelector),
            getRepoName: $repoName.val.bind($repoName)
        });

        function moveRepository() {
            var name = moveDialog.$el.find('#moveName').val();
            var project = projectSelector.getSelectedItem().toJSON();

            if (name === _pageState2.default.getRepository().getName() && project.key === _pageState2.default.getProject().getKey()) {
                // nothing to save. just close the dialog
                moveDialog.hide();
                return;
            }

            (0, _setDialogButtonsDisabled2.default)(moveDialog, true);
            var spinner = new _submitSpinner2.default(moveDialog.$el.find('.move-button'), 'before');
            spinner.show();
            _server2.default.rest({
                type: 'PUT',
                url: _navbuilder2.default.rest().currentRepo().build(),
                data: {
                    name: name,
                    project: project
                },
                statusCode: {
                    // Don't handle these globally. We will want to show
                    // an error message in the form
                    400: false,
                    409: false
                }
            }).done(function (repository) {
                var name = repository.name,
                    slug = repository.slug,
                    _repository$project = repository.project,
                    projectName = _repository$project.name,
                    projectKey = _repository$project.key;

                _notifications2.default.addFlash(
                // It is possible to rename the repository only in the move dialog.
                projectKey === _pageState2.default.getProject().getKey() ? _aui.I18n.getText('bitbucket.web.repository.rename.success', _pageState2.default.getRepository().getName(), name) : _aui.I18n.getText('bitbucket.web.repository.move.success', name, projectName));
                location.href = _navbuilder2.default.project(projectKey).repo(slug).settings().build();
            }).fail(function (xhr, testStatus, errorThrown, data) {
                _error2.default.setFormErrors(moveDialog.$el.find('form.aui'),
                // The move dialog uses different field names to prevent duplicate ids.
                // transform relevant contexts to something errorUtil will understand
                _lodash2.default.chain(data.errors).reject({ context: 'slug' }).map(function (error) {
                    var context = error.context;

                    if (context === 'project' || context === 'name') {
                        error.context = 'move' + context.charAt(0).toUpperCase() + context.slice(1);
                    }
                    return error;
                }).value());
            }).always(function () {
                (0, _setDialogButtonsDisabled2.default)(moveDialog, false);
                spinner.hide();
            });
        }

        moveDialog.$el.find('form.aui').on('submit', function (e) {
            e.preventDefault();
            moveRepository();
        });
        moveDialog.$el.find('.move-button').click(moveRepository);
        moveDialog.$el.find('.cancel-button').click(function () {
            projectSelector.dialog.hide();
            moveDialog.hide();
        });

        return moveDialog;
    }

    function initMoveButton(moveButtonSelector) {
        var dialog = void 0;
        (0, _jquery2.default)(moveButtonSelector).on('click', function (e) {
            e.preventDefault();
            if (!dialog) {
                dialog = createMoveDialog();
            }
            dialog.show();
            _error2.default.clearFormErrors(dialog.$el);
        });
    }

    function initDeleteButton(deleteButtonSelector) {
        var repo = _pageState2.default.getRepository().toJSON();

        var deleteRepositoryDialog = new _confirmDialog2.default({
            id: 'delete-repository-dialog',
            titleText: _aui.I18n.getText('bitbucket.web.repository.delete.title'),
            titleClass: 'warning-header',
            panelContent: bitbucket.internal.page.deleteRepositoryDialog({
                repository: repo
            }),
            submitText: _aui.I18n.getText('bitbucket.web.button.delete'),
            height: 240,
            focusSelector: '.cancel-button'
        }, { type: 'DELETE' });

        deleteRepositoryDialog.attachTo(deleteButtonSelector);

        deleteRepositoryDialog.addConfirmListener(function (promise) {
            promise.then(function (data, status, xhr) {
                return _server2.default.poll({
                    url: (0, _jquery2.default)(deleteButtonSelector).attr('href'),
                    statusCode: {
                        404: function _() {
                            _notifications2.default.addFlash(_aui.I18n.getText('bitbucket.web.repository.deleted', repo.name));

                            window.location = _navbuilder2.default.currentProject().build();

                            return false; // don't handle this globally.
                        }
                    }
                });
            });
        });
    }

    function initSizes($field) {
        var $button = $field.find('.size-load-button');

        $button.click(function (e) {
            e.preventDefault();
            $button.remove();
            getSizes($field);
        });
    }

    function getSizes($field) {
        var $spinner = $field.find('.spinner').spin();

        _server2.default.rest({
            type: 'GET',
            url: _navbuilder2.default.currentRepo().sizes().build(),
            statusCode: { '*': false }
        }).always(function () {
            $spinner.remove();
        }).done(function (sizes) {
            $field.html(bitbucket.internal.page.repositorySizeDisplay(sizes));
        }).fail(function () {
            var error = bitbucket.internal.page.repositoryInlineError({
                message: _aui.I18n.getText('bitbucket.web.repository.size.error')
            });
            (0, _jquery2.default)(error).insertAfter($field);
        });
    }

    function onReady(formSelector, moveButtonSelector, deleteButtonSelector) {
        // Ensure that any flash notifications which are available are added to the page
        _notifications2.default.showFlashes();

        initMoveButton(moveButtonSelector);
        initDeleteButton(deleteButtonSelector);
        initSizes((0, _jquery2.default)(formSelector).find('.field-group #size'));
        new _branchSelector2.default((0, _jquery2.default)('#default-branch'), {
            field: (0, _jquery2.default)('#default-branch-field')
        });

        var $repoName = (0, _jquery2.default)('#name');
        var $cloneUrl = (0, _jquery2.default)('.clone-url-generated span');

        _cloneUrlGen2.default.bindUrlGeneration($cloneUrl, {
            elementsToWatch: [$repoName],
            getRepoName: $repoName.val.bind($repoName)
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});