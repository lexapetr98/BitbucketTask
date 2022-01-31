'use strict';

require(['@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/events', 'bitbucket/util/state', 'bitbucket/internal/feature/file-content/edit/commit-dialog/commit-dialog', 'bitbucket/internal/feature/file-content/edit/toolbar', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/path', 'bitbucket/internal/model/revision', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/history', 'bitbucket/internal/util/property', 'bitbucket/internal/util/shortcuts', 'bitbucket/internal/util/text', 'bitbucket/internal/util/warn-before-unload'], function (AJS, $, _, events, state, commitDialog, toolbar, pageState, Path, Revision, analytics, domEvent, history, propertyUtil, shortcuts, textUtil, warnBeforeUnload) {
    var EDIT_BUTTON_SELECTOR = '.in-browser-edit-button';
    var COMMIT_BUTTON_SELECTOR = '.edit-commit';
    var CANCEL_BUTTON_SELECTOR = '.edit-cancel';
    var EDIT_MODE_CLASSNAME = 'edit-mode';

    $(EDIT_BUTTON_SELECTOR).tipsy({
        live: true,
        gravity: 'n'
    });

    // If the user didn't give an explicit until in the url, we can work out the effective head of the branch for
    // this file (the commit where the file was last edited) by looking at the untilRevision in the history.
    // This has to be done when the revision changes (or on page load) because the effective head of one branch may
    // not be the effective head of a different branch, and the state can change when the history dropdown is selected.
    var effectiveHead = void 0;
    var editingPromise = void 0;

    var maxSizePromise = propertyUtil.getFromProvider('content.upload.max.size');

    function setEffectiveHead() {
        var _history$state = history.state(),
            explicitUntil = _history$state.explicitUntil,
            untilRevision = _history$state.untilRevision;
        // If the user didn't specify an explicit until then the until ID in the history will be commit in which the
        // current file was last modified.


        if (!explicitUntil && untilRevision) {
            effectiveHead = untilRevision.id;
        } else {
            effectiveHead = null;
        }
    }

    $(document).ready(setEffectiveHead);

    shortcuts.bind('sourceViewEdit', function () {
        // defer execution using requestAnimationFrame so that the keypress can pass through CodeMirror first if it is
        // focused without being caught. If edit mode is enabled immediately, the keypress registers after CodeMirror
        // goes in to edit mode and the value of the keyboard shortcut will be inserted in the editor.
        // The reason for requestAnimationFrame here is because it will execute at the first available opportunity,
        // a setTimeout based solution may take a significant amount of time executing its callback when the document is
        // scrolled immediately before pressing the keyboard shortcut.
        requestAnimationFrame(function () {
            return !document.body.classList.contains(EDIT_MODE_CLASSNAME) && $(EDIT_BUTTON_SELECTOR).click();
        });
    });

    events.on('bitbucket.internal.feature.repository.revisionReferenceSelector.revisionRefChanged', setEffectiveHead);

    // this should be removed or updated when BSERVDEV-14311 has happened
    var _stopEditing = function _stopEditing(noop) {};
    events.on('bitbucket.internal.history.popstate', function () {
        if (document.body.classList.contains(EDIT_MODE_CLASSNAME)) {
            toggleEditing(false);
            _stopEditing({ discardChanges: true });
        }
    });

    function checkRevisionEditable() {
        var revisionRef = pageState.getRevisionRef();

        var _history$state2 = history.state(),
            explicitUntil = _history$state2.explicitUntil,
            untilRevision = _history$state2.untilRevision;

        var untilId = untilRevision && untilRevision.id;
        var atBranchHead = !explicitUntil || untilId === effectiveHead || untilId === revisionRef.getLatestCommit();

        // Check that the user is at the head/effective head of a branch (we cannot edit on a tag or commit)
        if (!revisionRef.isBranch() || !atBranchHead) {
            return {
                editable: false,
                reason: AJS.I18n.getText('bitbucket.web.sourceview.button.edit.uneditable.branch.head')
            };
        }

        return { editable: true };
    }

    events.on('bitbucket.internal.feature.fileContent.requestHandled', function (handlingContext) {
        var handler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return updateEditingHandler(handler.editing);
    });

    /**
     * @param {EditingContext}  editingContext  - Editability and supporting methods for the current file handler.
     *
     */
    function updateEditingHandler() {
        var editingContext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var editable = editingContext.editable,
            reason = editingContext.reason,
            startEditing = editingContext.startEditing,
            stopEditing = editingContext.stopEditing,
            hasChanged = editingContext.hasChanged,
            getContent = editingContext.getContent,
            changes = editingContext.changes;

        _stopEditing = stopEditing;

        if (!editable) {
            //handler rejections take priority over revision level rejections
            updateEditButton({ editable: editable, reason: reason });
            return;
        }

        //File is editable by the handler, but need to check we can edit the current revision of the file
        var revisionEditable = checkRevisionEditable();

        if (!revisionEditable.editable) {
            updateEditButton(revisionEditable);
            return;
        }

        //we can edit the file
        updateEditButton({
            editable: editable,
            onClick: function onClick() {
                analytics.add('sourceEdit.editButton.clicked');
                toggleEditing(true, hasChanged);
                bindCancelButton(function () {
                    return stopEditing({ discardChanges: true });
                });
                bindCommitButton(getContent, stopEditing);
                startEditing();

                if (_.isFunction(changes)) {
                    //Only initially disable the commit button if we are given a changes emitter
                    updateCommitButton(false);
                }
            }
        });
        _.isFunction(changes) && changes(function (changed) {
            return updateCommitButton(changed, getContent());
        });
    }

    function updateEditButton(_ref) {
        var editable = _ref.editable,
            reason = _ref.reason,
            onClick = _ref.onClick,
            getContent = _ref.getContent;

        var fallbackReason = editable ? AJS.I18n.getText('bitbucket.web.sourceview.button.edit.editable.tooltip') : AJS.I18n.getText('bitbucket.web.sourceview.button.edit.uneditable.type');

        var $editButton = $(EDIT_BUTTON_SELECTOR);

        $editButton.attr('disabled', !editable).attr('aria-disabled', !editable).attr('title', reason || fallbackReason);

        if (onClick) {
            $editButton.on('click', onClick);
        } else {
            $editButton.off('click');
        }
    }

    function updateCommitButton(changed, content) {
        maxSizePromise.done(function (maxSize) {
            var tooBig = content && content.size > maxSize;

            var title = void 0;
            if (tooBig) {
                title = AJS.I18n.getText('bitbucket.web.sourceview.button.edit.toolbar.commit.too.big.tooltip', textUtil.formatSizeInBytes(maxSize));
            } else if (changed) {
                title = AJS.I18n.getText('bitbucket.web.sourceview.button.edit.toolbar.commit.tooltip');
            } else {
                title = AJS.I18n.getText('bitbucket.web.sourceview.button.edit.toolbar.commit.unchanged.tooltip');
            }

            var enabled = changed && !tooBig;

            $(COMMIT_BUTTON_SELECTOR).attr('disabled', !enabled).attr('aria-disabled', !enabled).attr('title', title);
        });
    }

    function maybeClickCommitButton(e) {
        if (domEvent.isCtrlish(e) && e.which === 'S'.charCodeAt(0)) {
            e.preventDefault();
            $(COMMIT_BUTTON_SELECTOR + ':enabled').click(); //Only trigger the click handler if the button is enabled
        }
    }

    function toggleEditing(editing, hasChanged) {
        if (editing) {
            editingPromise = editingPromise || $.Deferred();
            // the warning message will only be displayed in IE/Edge
            warnBeforeUnload(editingPromise, AJS.I18n.getText('bitbucket.web.sourceview.button.edit.close.warning'), hasChanged);
        } else {
            editingPromise && editingPromise.resolve();
            editingPromise = null;
        }

        var $blameButton = $('.file-blame');

        // Close the blame if it is open
        // The content view has the class 'blame-disabled' when the blame is NOT showing.
        if (editing && !$('.content-view').hasClass('blame-disabled')) {
            $blameButton.click();
        }

        //Disable blame button when editing (blocks keyboard shortcut)
        $blameButton.attr('disabled', editing).attr('aria-disabled', editing);

        var $editButton = $(EDIT_BUTTON_SELECTOR);

        $(document.body).toggleClass(EDIT_MODE_CLASSNAME, editing);
        if (editing) {
            // Need to hide the tipsy manually because removal of the toolbar means no mouseout event is triggered on the button.
            // Some browsers (read: Safari) do not focus the button when it is clicked, so tipsy's blur handler doesn't cause a hide either.
            $editButton.tipsy('hide');
        }
        toolbar.toggleToolbars(editing);
        window.scrollTo(0, null);

        $editButton.prop('disabled', editing);
        $(document)[editing ? 'on' : 'off']('keydown', maybeClickCommitButton);
    }

    function bindCommitButton(getContent, stopEditing) {
        $(COMMIT_BUTTON_SELECTOR).click(function (e) {
            e.preventDefault();
            analytics.add('sourceEdit.commitDialog.open');
            commitDialog.show(getContent(), editingPromise.resolve).done(function (commit) {
                // PR redirect has already happened, only need to deal with the commit to branch case
                toggleEditing(false);
                stopEditing();
                // update the page state revision ref's latest commit with the commit ID so that locally it is pointing to the right commit hash
                pageState.setRevisionRef(pageState.getRevisionRef().setLatestCommit(commit.id));
                events.trigger('bitbucket.internal.feature.edit.untilRevisionChanged', null, new Revision(commit), new Path(state.getFilePath()));
            });
        });
    }

    function bindCancelButton(onCancel) {
        $(CANCEL_BUTTON_SELECTOR).click(function (e) {
            e.preventDefault();
            analytics.add('sourceEdit.cancelLink.clicked');

            onCancel();
            toggleEditing(false);
        });
    }
});