define('bitbucket/internal/feature/pull-request/edit/pull-request-edit', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/repository/branch-selector/branch-selector', 'bitbucket/internal/feature/user/user-multi-selector/user-multi-selector', 'bitbucket/internal/model/revision-reference', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/client-storage', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/function', 'bitbucket/internal/util/warn-before-unload', 'bitbucket/internal/widget/markup-editor/markup-editor'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _branchSelector, _userMultiSelector, _revisionReference, _ajax, _clientStorage, _domEvent, _function, _warnBeforeUnload, _markupEditor) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _branchSelector2 = babelHelpers.interopRequireDefault(_branchSelector);

    var _userMultiSelector2 = babelHelpers.interopRequireDefault(_userMultiSelector);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _warnBeforeUnload2 = babelHelpers.interopRequireDefault(_warnBeforeUnload);

    var _markupEditor2 = babelHelpers.interopRequireDefault(_markupEditor);

    var REVIEWERS = 'reviewers';
    var PULL_REQUEST_OUT_OF_DATE_EXCEPTION = 'com.atlassian.bitbucket.pull.PullRequestOutOfDateException';

    function PullRequestEdit(pullRequest) {
        this._pullRequest = pullRequest;
        this._currentReviewerUsers = this._pullRequest.getReviewers();
        this._isDisabled = false;
        this._draftKey = _clientStorage2.default.buildKey('draft-description', 'pull-request');
    }

    PullRequestEdit.prototype.keypressListener = function (e) {
        if (_domEvent2.default.isCtrlEnter(e)) {
            e.preventDefault();
            this._dialog.$el.find('.save-button').click();
        }
    };

    PullRequestEdit.prototype.initDialog = function () {
        var _this = this;

        this._dialog = (0, _aui.dialog2)(bitbucket.internal.feature.pullRequest.editDialog());
        this._dialog.$el.on('click', '.save-button', function () {
            return _this.save();
        }).on('click', '.cancel-button', function () {
            return _this.cancel();
        }).on('keydown', function (e) {
            return _this.keypressListener(e);
        }).on('hide', function () {
            return _this.destroy();
        });

        this._$spinner = (0, _jquery2.default)('<div class="spinner"/>').insertBefore(this._dialog.$el.find('.save-button'));

        this._dialog.$el.on('input', 'textarea#pull-request-description', function (e) {
            return _this.updateDraftDescription(e);
        });
    };

    /**
     * Update the stored draft description, debounced by 300ms
     * Removes the draft if the textarea is cleared
     */
    PullRequestEdit.prototype.updateDraftDescription = _lodash2.default.debounce(function (e) {
        var text = e.target.value;

        if (text) {
            _clientStorage2.default.setSessionItem(this._draftKey, text);
        } else {
            this.deleteDraftDescription();
        }
    }, 300);

    PullRequestEdit.prototype.getDialogBody = function () {
        return this._dialog.$el.find('.aui-dialog2-content');
    };

    /**
     * Remove the draft description
     */
    PullRequestEdit.prototype.deleteDraftDescription = function () {
        _clientStorage2.default.removeSessionItem(this._draftKey);
    };

    PullRequestEdit.prototype.populatePanelFromPullRequest = function () {
        var draftDescription = _clientStorage2.default.getSessionItem(this._draftKey);

        this.updatePanel({
            title: this._pullRequest.getTitle(),
            description: draftDescription || this._pullRequest.getDescription(),
            // TODO It shouldn't be required to add type - https://jira.atlassian.com/browse/STASHDEV-3538
            toRef: _lodash2.default.assign({ type: _revisionReference2.default.type.BRANCH }, this._pullRequest.getToRef().toJSON()),
            reviewers: this._currentReviewerUsers.map(function (reviewer) {
                return reviewer.getUser().toJSON();
            })
        }, !!draftDescription);
    };

    /**
     * Update the dialog contents
     * @param {object} templateData - The data to populate the soy template with
     * @param {boolean} isRestoredDraftDescription - Whether or not the update includes a restored draft description
     */
    PullRequestEdit.prototype.updatePanel = function (templateData, isRestoredDraftDescription) {
        var $editPanel = this.getDialogBody();

        if (templateData.reviewers.length && templateData.reviewers[0].user) {
            //If we are supplied a collection of Pull Request Participants (with role and approval state) , pluck out just the user object.
            templateData.reviewers = _lodash2.default.map(templateData.reviewers, 'user');
        }

        $editPanel.empty().append(bitbucket.internal.feature.pullRequest.edit(templateData));

        if (isRestoredDraftDescription) {
            $editPanel.find('textarea#pull-request-description').addClass('restored').attr('title', _aui.I18n.getText('bitbucket.web.pullrequest.edit.description.restored')).one('click keydown input', function (e) {
                (0, _jquery2.default)(e.target).removeClass('restored').removeAttr('title');
            });
        }

        this.userSelect = new _userMultiSelector2.default($editPanel.find('#reviewers'), {
            initialItems: templateData.reviewers,
            excludedItems: [this._pullRequest.getAuthor().getUser().toJSON()], //Exclude the PR author from the user select, rather than the current user.
            urlParams: {
                'permission.1': 'LICENSED_USER', // only licensed users
                'permission.2': 'REPO_READ', // only users with READ to the target repository
                'permission.2.repositoryId': this._pullRequest.getToRef().getRepository().getId()
            }
        });

        var $branchSelectorTrigger = $editPanel.find('#toRef');
        this.branchSelector = new _branchSelector2.default($branchSelectorTrigger, {
            id: 'toRef-dialog',
            repository: this._pullRequest.getToRef().getRepository(),
            field: $branchSelectorTrigger.next('input')
        });

        _markupEditor2.default.bindTo($editPanel);
    };

    function toReviewer(user) {
        return {
            user: user
        };
    }

    PullRequestEdit.prototype.getPullRequestUpdateFromForm = function ($form) {
        return {
            title: $form.find('#title').val(),
            description: $form.find('#pull-request-description').val(),
            reviewers: _lodash2.default.map(this.userSelect.getSelectedItems(), toReviewer),
            toRef: this.branchSelector.getSelectedItem().toJSON(),
            version: this._pullRequest.getVersion()
        };
    };

    /**
     *
     * @param {PullRequestJSON} original the original potentially decorated pull request
     * @returns {object} a simple pull request object containing only the required properties by a PUT, apart from the version
     */
    function sanitizedPullRequestJSON(original) {
        var sanitized = _lodash2.default.pick(original, ['title', 'description']);

        if (_lodash2.default.has(original, 'reviewers')) {
            sanitized.reviewers = _lodash2.default.chain(original.reviewers
            // we first pluck the user.name, sort the strings
            // then unpluck them. This gives us a deep copy,
            // which is sorted efficiently by not doing excessive
            // property lookups and only contains the properties
            // we want
            ).map(_function2.default.dot('user.name')).sort().map(function (name) {
                return {
                    user: {
                        name: name
                    }
                };
            }).value();
        }
        if (_lodash2.default.has(original, 'toRef')) {
            sanitized.toRef = {
                id: original.toRef.id
            };
        }

        return sanitized;
    }

    /**
     * Perform a three way merge of the pull request
     *
     * @param baseline the pull request as it existed when the page was loaded
     * @param them the pull request as it exists on the server right now
     * @param us the updated pull request which failed to be PUT to the server
     * @returns a simple object representation the pull request resulting from the merge, or null if there is a conflict
     */
    PullRequestEdit.prototype.mergePullRequestUpdate = function (baseline, them, us) {
        var themVersion = them.version;

        baseline = sanitizedPullRequestJSON(baseline);
        them = sanitizedPullRequestJSON(them);
        us = sanitizedPullRequestJSON(us);

        var merged = _lodash2.default.reduce(_lodash2.default.keys(us), function (merged, prop) {
            if (!merged) {
                return null;
            }

            var themProp = them[prop];
            var usProp = us[prop];
            if (_lodash2.default.isEqual(themProp, usProp)) {
                // There is no difference, ignore
                return merged;
            }

            var baseProp = baseline[prop];
            if (_lodash2.default.isEqual(baseProp, usProp)) {
                // We didn't make any change, ignore
                return merged;
            }

            if (_lodash2.default.isEqual(baseProp, themProp)) {
                // We made a change and there is no conflict
                // update the merged result
                merged[prop] = usProp;
                return merged;
            }

            // There is a conflict
            return null;
        }, _lodash2.default.merge({}, them));

        if (merged) {
            merged.version = themVersion;
        }
        return merged;
    };

    PullRequestEdit.prototype.save = function (dialog, page) {
        if (this._isDisabled) {
            return;
        }

        var pullRequestUpdate = this.getPullRequestUpdateFromForm(this.getDialogBody().find('form'));

        if (!pullRequestUpdate.title) {
            //PR title is empty, which means the rest endpoint would ignore it.
            var noTitleError = _aui.I18n.getText('bitbucket.web.pullrequest.edit.no.title');
            this.updatePanel(_jquery2.default.extend({ fieldErrors: { title: [noTitleError] } }, pullRequestUpdate));
            return;
        }

        this._$spinner.show().spin('small');
        this.toggleDisabled(true);
        return this._doSave(pullRequestUpdate);
    };

    PullRequestEdit.prototype._doSave = function (pullRequestUpdate) {
        var self = this;
        var request = _ajax2.default.rest({
            url: _navbuilder2.default.rest().currentPullRequest().withParams({
                avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                    size: 'xsmall'
                })
            }).build(),
            type: 'PUT',
            data: pullRequestUpdate,
            statusCode: {
                400: false,
                409: false
                //TODO: complete this list
            }
        });

        (0, _warnBeforeUnload2.default)(request, _aui.I18n.getText('bitbucket.web.pullrequest.pending.request', bitbucket.internal.util.productName()));

        request.done(function (updatedPullRequest) {
            //TODO: in future we should use `new PullRequest(updatedPullRequest))` to update the page without a refresh.
            self.deleteDraftDescription();
            window.location.reload();
        });

        request.fail(function (xhr, testStatus, errorThrown, data, fallbackError) {
            var errors = [];
            var fieldErrors = {};
            var validReviewers;

            // If the only error is that the pull request is out of date, and we are able to do a three way merge
            // of the updates, then automatically re-attempt the request
            if (data.errors.length === 1 && data.errors[0].exceptionName === PULL_REQUEST_OUT_OF_DATE_EXCEPTION) {
                var revisedPullRequestUpdate = self.mergePullRequestUpdate(self._pullRequest.toJSON(), data.errors[0].pullRequest, pullRequestUpdate);
                if (revisedPullRequestUpdate) {
                    self._doSave(revisedPullRequestUpdate);
                    return;
                }
            }

            _lodash2.default.forEach(data.errors, function (error) {
                if (error.context) {
                    if (!Object.prototype.hasOwnProperty.call(fieldErrors, error.context)) {
                        fieldErrors[error.context] = [];
                    }
                    if (error.context === REVIEWERS) {
                        // This is a bit clunky, but the rest response has the per user error messages and
                        // the collection of valid users _inside_ the single com.atlassian.stash.pull.InvalidPullRequestParticipantException
                        fieldErrors[error.context] = _lodash2.default.map(error.reviewerErrors, 'message');
                        errors.push(error);
                        validReviewers = error.validReviewers;
                    } else {
                        fieldErrors[error.context].push(error.message);
                    }
                } else {
                    if (error.exceptionName === PULL_REQUEST_OUT_OF_DATE_EXCEPTION) {
                        //remove hash from href, else the browser will treat it as a hash change and won't refresh.
                        error.messageContent = '\n                        ' + (0, _aui.escapeHtml)(error.message) + ' \n                        <a href="' + window.location.href.split('#')[0] + '">\n                            ' + (0, _aui.escapeHtml)(_aui.I18n.getText('bitbucket.web.reload')) + '\n                        </a>.';
                    }
                    errors.push(error);
                }
            });

            //$.extend will ignore undefined properties, so if validReviewers is undefined, it will not overwrite pullRequestUpdate.reviewers
            self.updatePanel(_jquery2.default.extend({ errors: errors, fieldErrors: fieldErrors }, pullRequestUpdate, {
                reviewers: validReviewers
            }));
            self._$spinner.spinStop().hide();
            self.toggleDisabled(false);
        });
    };

    PullRequestEdit.prototype.toggleDisabled = function (disabled) {
        if ((typeof disabled === 'undefined' ? 'undefined' : babelHelpers.typeof(disabled)) === undefined) {
            disabled = !this._isDisabled;
        }
        this._dialog.$el.find('button, input, textarea, select').attr({
            disabled: disabled
        });
        this._dialog.$el.attr({
            'data-aui-modal': disabled
        });
        this._isDisabled = disabled;
    };

    PullRequestEdit.prototype.cancel = function () {
        if (!this._isDisabled) {
            this.deleteDraftDescription();
            this.hide();
        }
    };

    PullRequestEdit.prototype.show = function () {
        this.initDialog();
        this.populatePanelFromPullRequest();
        this._dialog.show();
    };

    PullRequestEdit.prototype.hide = function () {
        this._dialog.hide();
    };

    PullRequestEdit.prototype.destroy = function () {
        _markupEditor2.default.unbindFrom(this.getDialogBody());
    };

    exports.default = PullRequestEdit;
    module.exports = exports['default'];
});