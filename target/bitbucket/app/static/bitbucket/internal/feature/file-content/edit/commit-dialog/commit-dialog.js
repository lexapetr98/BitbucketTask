define('bitbucket/internal/feature/file-content/edit/commit-dialog/commit-dialog', ['exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/util/state', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/commit', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/widget/commit-message-editor/commit-message-editor'], function (exports, _aui, _jquery, _lodash, _navbuilder, _server, _state, _analytics, _commit, _domEvent, _commitMessageEditor) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.CommitMethods = undefined;
    exports.show = show;

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var CommitMethods = exports.CommitMethods = {
        COMMIT: 'COMMIT',
        PULL_REQUEST: 'PULL_REQUEST'
    };

    function createDialog(onSubmit, onCancel) {
        var username = _state2.default.getCurrentUser().slug;
        var timestamp = Date.now();
        var filename = _state2.default.getFilePath().name;
        var branchName = (username + '/' + filename + '-' + timestamp).replace(/\s/g, '').replace('.', '');
        var dialog = (0, _aui.dialog2)(bitbucket.internal.feature.edit.commitDialog.dialog({
            fileName: filename,
            branchName: branchName
        }));

        dialog.$el.on('click', '#create-pr-checkbox', function () {
            dialog.$el.find('.pull-request-fields').toggle(this.checked);
            dialog.$el.find('.commit-button').text(this.checked ? _aui.I18n.getText('bitbucket.web.sourceview.button.edit.commitDialog.createPullRequest') : _aui.I18n.getText('bitbucket.web.sourceview.button.edit.toolbar.commit'));
        }).on('click', '.commit-button', function () {
            return onSubmit(dialog.$el);
        }).on('keydown', function (e) {
            if (_domEvent2.default.isCtrlEnter(e)) {
                e.preventDefault();
                onSubmit(dialog.$el);
            }
        }).on('click', '.cancel-button', onCancel).on('submit', function (e) {
            return false;
        }); // forms with only one input field automatically submit on enter
        return dialog;
    }

    function redirectToPr(sourceBranchId, targetBranchId) {
        window.location = _navbuilder2.default.currentRepo().createPullRequest().sourceBranch(sourceBranchId).targetBranch(targetBranchId).build();
    }

    function displayBranchError($dialog, error) {
        var $branchName = $dialog.find('#branch-name');
        $branchName.closest('.field-group').replaceWith(bitbucket.internal.feature.edit.commitDialog.branchName({
            errorTexts: [error],
            branchName: $branchName.val()
        }));
    }

    function displayGeneralMessage($dialog, forceCreatePR, errorMessage, errorTitle) {
        $dialog.find('.aui-dialog2-content').prepend(bitbucket.internal.feature.edit.commitDialog.genericErrorMessage({
            errorMessage: errorMessage,
            errorTitle: errorTitle
        }));
        if (forceCreatePR) {
            var $createPrCheckbox = $dialog.find('#create-pr-checkbox');
            $createPrCheckbox.filter(':not(:checked)').click();
            $createPrCheckbox.prop('disabled', true);
        }
    }

    function createBranch(newBranchName) {
        var createBranchUrl = _navbuilder2.default.rest('branch-utils').currentRepo().addPathComponents('branches').build();

        return _server2.default.rest({
            url: createBranchUrl,
            type: 'POST',
            data: {
                name: newBranchName,
                startPoint: _state2.default.getRef().latestCommit
                // This ^ will be updated in BSERVDEV-14150 to have the actual latest commit, now it will fail when:
                // 1. the user makes a new commit on the current branch, and then
                // 2. the user tries to make a PR without refreshing the page
            },
            statusCode: {
                400: false
            }
        });
    }

    function submitCommit(_ref) {
        var content = _ref.content,
            ref = _ref.ref,
            createPullRequest = _ref.createPullRequest,
            message = _ref.message,
            branchName = _ref.branchName,
            filePath = _ref.filePath;

        var branchPromise = createPullRequest ? createBranch(branchName) : _jquery2.default.Deferred().resolve(ref);

        return branchPromise.then(function (branch) {
            return (0, _commit.create)({
                branchId: branch.id,
                sourceCommitId: ref.latestCommit,
                content: content,
                message: message,
                filePath: filePath,
                handledStatusCodes: [400, 404, 409]
            });
        }); // Failures handled in onSubmit
    }

    function onSubmit($dialog, content, beforeRedirect) {
        function onError(exception) {
            var exceptionName = exception.exceptionName.split('.').pop();
            _analytics2.default.add('sourceEdit.edit.failed', { reason: exceptionName });
            switch (exceptionName) {
                // Branch creation errors
                case 'DuplicateRefException':
                    displayBranchError($dialog, _aui.I18n.getText('bitbucket.web.sourceview.edit.error.branchNameTaken'));
                    break;
                case 'InvalidRefNameException':
                    displayBranchError($dialog, _aui.I18n.getText('bitbucket.web.sourceview.edit.error.branchNameInvalid'));
                    break;
                // Request validation errors
                case 'NoSuchObjectException':
                case 'NoSuchBranchException':
                    displayGeneralMessage($dialog, false, (0, _aui.escapeHtml)(_aui.I18n.getText('bitbucket.web.sourceview.edit.error.branchDeleted.message')), (0, _aui.escapeHtml)(_aui.I18n.getText('bitbucket.web.sourceview.edit.error.branchDeleted.title')));
                    break;
                case 'FileOutOfDateException':
                    displayGeneralMessage($dialog, true, (0, _aui.escapeHtml)(_aui.I18n.getText('bitbucket.web.sourceview.edit.error.forcePR.message')), (0, _aui.escapeHtml)(_aui.I18n.getText('bitbucket.web.sourceview.edit.error.branchMoved.title')));
                    break;
                // Request cancelled means we should try committing through PR instead
                case 'RepositoryHookVetoedException':
                    var details = void 0;
                    if (exception.details.length >= 0) {
                        // The details are an array
                        if (exception.details.length > 1) {
                            details = bitbucket.internal.feature.edit.commitDialog.errorList({
                                details: exception.details
                            });
                        } else if (exception.details.length === 1) {
                            details = (0, _aui.escapeHtml)(exception.details[0]);
                        } else {
                            details = '';
                        }
                    } else {
                        details = (0, _aui.escapeHtml)(exception.details);
                    }
                    displayGeneralMessage($dialog, true, details, (0, _aui.escapeHtml)(_aui.I18n.getText('bitbucket.web.sourceview.edit.error.hook.title')));
                    break;
                default:
                    displayGeneralMessage($dialog, true, exception.message);
            }
        }

        function setEnabled($element, enabled) {
            $element.attr('disabled', !enabled).attr('aria-disabled', !enabled);
        }

        $dialog.find('.field-group .error, .aui-message.error-message').remove();

        var validForm = true;
        var $message = $dialog.find('#commit-message');
        var message = $message.val();
        var createPullRequest = $dialog.find('#create-pr-checkbox').prop('checked');
        var branchName = $dialog.find('#branch-name').val();
        var $spinner = $dialog.find('.button-spinner');
        var $commitButton = $dialog.find('.commit-button');
        var $cancelButton = $dialog.find('.cancel-button');

        setEnabled($commitButton, false);
        setEnabled($cancelButton, false);

        if (!message || /^\s*$/.test(message)) {
            $message.closest('.field-group').replaceWith(bitbucket.internal.feature.edit.commitDialog.commitMessage({
                errorTexts: [_aui.I18n.getText('bitbucket.web.sourceview.edit.error.commitMessageRequired')]
            }));
            validForm = false;
        }

        if (createPullRequest && !branchName) {
            displayBranchError($dialog, _aui.I18n.getText('bitbucket.web.sourceview.edit.error.branchNameRequired'));
            validForm = false;
        }

        if (validForm) {
            $spinner.spin();
            var ref = _state2.default.getRef();
            var filePath = _state2.default.getFilePath();
            return submitCommit({
                content: content,
                ref: ref,
                createPullRequest: createPullRequest,
                message: message,
                branchName: branchName,
                filePath: filePath.components
            }).then(function (commit) {
                _analytics2.default.add('sourceEdit.edit.success', {
                    type: createPullRequest ? CommitMethods.PULL_REQUEST : CommitMethods.COMMIT,
                    extension: filePath.extension.toUpperCase()
                });

                if (createPullRequest) {
                    beforeRedirect();
                    redirectToPr(branchName, ref.id);
                    return _jquery2.default.Deferred(); //return unresolved promise to prevent dialog from closing.
                }

                return commit;
            }, function (error) {
                var exception = _lodash2.default.get(error, 'responseJSON.errors[0]', '');
                onError(exception);
                return { error: exception.exceptionName };
            }).always(function () {
                $spinner.spinStop();
                setEnabled($commitButton, true);
                setEnabled($cancelButton, true);
            });
        }
        setEnabled($commitButton, true);
        setEnabled($cancelButton, true);
        return _jquery2.default.Deferred().resolve({ error: 'invalid form' });
    }

    function show(content, beforeRedirect) {
        var commitDeferred = _jquery2.default.Deferred();

        var dialog = createDialog(function ($dialog) {
            return onSubmit($dialog, content, beforeRedirect).then(function (data) {
                if (!data.error) {
                    commitDeferred.resolve(data);
                }
            });
        }, function () {
            return commitDeferred.reject();
        }).show();

        (0, _commitMessageEditor.getCommitMessageEditor)(dialog.$el.find('#commit-message')[0]);

        commitDeferred.always(function () {
            return dialog.remove();
        });

        return commitDeferred;
    }
});