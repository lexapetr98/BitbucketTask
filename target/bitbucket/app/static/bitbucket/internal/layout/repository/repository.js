define('bitbucket/internal/layout/repository/repository', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/repository/sticky-branches', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/repository', 'bitbucket/internal/util/events', 'bitbucket/internal/widget/quick-copy-text', 'bitbucket/internal/widget/sidebar/sidebar'], function (module, exports, _jquery, _lodash, _navbuilder, _stickyBranches, _pageState, _repository, _events, _quickCopyText, _sidebar) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _stickyBranches2 = babelHelpers.interopRequireDefault(_stickyBranches);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _repository2 = babelHelpers.interopRequireDefault(_repository);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _quickCopyText2 = babelHelpers.interopRequireDefault(_quickCopyText);

    var _sidebar2 = babelHelpers.interopRequireDefault(_sidebar);

    function initRepositoryPageState(repositoryJson) {
        var repo = new _repository2.default(repositoryJson);
        _pageState2.default.setRepository(repo);
        _pageState2.default.setProject(repo.getProject());
        // TODO: remove this. It is here for testing if people use the project avatar icon as a button.
        (0, _jquery2.default)('.aui-page-header-image > a').on('click', function () {
            _events2.default.trigger('bitbucket.internal.sidebar.clickAvatar.expanded.' + (0, _jquery2.default)('.aui-sidebar').attr('aria-expanded'), null);
        });
    }

    function getCloneUrlContainer() {
        return (0, _jquery2.default)('.clone-url');
    }

    function getCloneUrlInput() {
        return getCloneUrlContainer().find('.clone-url-input');
    }

    function getCloneUrlProtocolTrigger() {
        return (0, _jquery2.default)('.repository-protocol');
    }

    /**
     * Input elements can't be sized to fit their contents, so we have to use a bit of javascript to do it for us.
     * This method creates a fake element to calculate the size of one monospace character and then sets the width
     * of the input element to be input.length * width. There are a few rounding issues on some browsers but should
     * be good enough for the most part.
     *
     * Finally, this method also binds events to focus/mouseup to automatically select the input text for the
     * convenience of the user who is going to want to copy the value.
     */
    function initCloneUrlInput() {
        var $container = getCloneUrlContainer();
        var $cloneProtocolTrigger = getCloneUrlProtocolTrigger();
        var $cloneProtocolDropdown = (0, _jquery2.default)('#' + $cloneProtocolTrigger.attr('aria-controls'));
        var $cloneProtocolDropdownItems = $cloneProtocolDropdown.find('li');
        var cloneUrl;
        var moduleKey;
        var oldModuleKey = '';

        if ($cloneProtocolTrigger.is('button')) {
            updateCloneProtocolTrigger($cloneProtocolTrigger, $cloneProtocolTrigger.text());
            cloneUrl = $cloneProtocolTrigger.attr('data-clone-url');
            moduleKey = $cloneProtocolTrigger.attr('data-module-key');
        } else {
            updateCloneProtocolTrigger($cloneProtocolTrigger, $cloneProtocolDropdownItems.first().children('a').text());
            cloneUrl = $cloneProtocolDropdownItems.first().attr('data-clone-url');
            moduleKey = $cloneProtocolDropdownItems.first().attr('data-module-key');
        }
        getCloneUrlInput().attr('value', cloneUrl);
        $container.addClass(moduleKey);
        oldModuleKey = moduleKey;

        // We can't set this on $cloneProtocolDropdownItems directly, as InlineDialog will move the elements around and
        // the handler will not be called in IE11.
        (0, _jquery2.default)(document).on('click', '#repository-protocol-selector li', function (event) {
            var $this = (0, _jquery2.default)(this);
            updateCloneProtocolTrigger(getCloneUrlProtocolTrigger(), $this.text());
            getCloneUrlInput().attr('value', $this.attr('data-clone-url')).select();
            moduleKey = $this.attr('data-module-key');
            $container.removeClass(oldModuleKey).addClass(moduleKey);
            oldModuleKey = moduleKey;
            _events2.default.trigger('bitbucket.internal.feature.repository.clone.protocol.changed', null, moduleKey, $this.attr('data-clone-url'));

            // the dropdown is outside of the inline dialog, so clicking on a dropdown item actually hides the inline
            // dialog, so we prevent that from happening...
            event.stopPropagation();
            if ($cloneProtocolDropdown.is(':visible')) {
                // but we still want to hide the dropdown onclick if it is visible
                $cloneProtocolTrigger.trigger('aui-button-invoke');
            }
            event.preventDefault();
        });

        _events2.default.trigger('bitbucket.internal.feature.repository.clone.protocol.initial', null, moduleKey, cloneUrl);
    }

    function updateCloneProtocolTrigger($trigger, newLabel) {
        var $cloneProtocolLabel = $trigger.children('span').remove(); // pull the icon span element out and store it temporarily
        $trigger.text(newLabel).append($cloneProtocolLabel); // replace the dropdown trigger text and add the icon span back in
    }

    function initCloneUrlDialog(cloneUrlDialogTrigger) {
        var $cloneDialogTrigger = (0, _jquery2.default)(cloneUrlDialogTrigger);
        var $cloneUrlInput;
        var dialog;
        var dialogId = 'repo-clone-dialog';

        $cloneDialogTrigger.attr('aria-controls', dialogId);

        (0, _jquery2.default)(document).on('click', cloneUrlDialogTrigger, function (e) {
            e.preventDefault();
            cloneUrlDialogSetup();
            dialog.open = true;
            // select the text in the input for easy copy/pasta
            $cloneUrlInput.select();
        });

        var cloneUrlDialogSetup = _lodash2.default.once(function () {
            dialog = document.getElementById(dialogId);
            $cloneUrlInput = (0, _jquery2.default)(dialog).find('.clone-url-input');
            // the first time the dialog trigger click event handler runs in a page lifecyle
            // set up event listeners that respond to the sidebar expanding/collapsing and close the dialog
            _events2.default.on('bitbucket.internal.feature.sidebar.collapseEnd', closeDialog);
            _events2.default.on('bitbucket.internal.feature.sidebar.expandEnd', closeDialog);
        });

        function closeDialog() {
            if (dialog && dialog.open) {
                dialog.open = false;
            }
        }

        (0, _jquery2.default)('#clone-dialog-options').html(bitbucket.internal.layout.cloneDialogOptions());
    }

    function bindCreatePullRequestButton() {
        var $createButton = (0, _jquery2.default)('.aui-page-header-actions .create-pull-request');

        _events2.default.on('bitbucket.internal.layout.branch.revisionRefChanged', function (revisionReference) {
            var createPullRequestBuilder = _navbuilder2.default.currentRepo().createPullRequest();
            if (!revisionReference.isDefault() && revisionReference.isBranch()) {
                createPullRequestBuilder = createPullRequestBuilder.sourceBranch(revisionReference.getId());
            }
            $createButton.attr('href', createPullRequestBuilder.build());
        });
    }

    function bindBadgesTipsy() {
        (0, _jquery2.default)('.repository-badge .badge').tooltip({
            gravity: 'n'
        });
    }

    // temporary @aui-override to add tipsy to the project avatar. Should be removed when this is implemented in the
    // AUI sidebar component
    function bindProjectAvatarTipsy() {
        var $trigger = (0, _jquery2.default)('.aui-sidebar[aria-expanded=false] .aui-page-header-image');
        $trigger.tooltip({
            gravity: 'w',
            delayIn: 0,
            live: true,
            html: true,
            aria: true,
            className: 'aui-sidebar-section-tooltip',
            title: function title() {
                return (0, _jquery2.default)(this).find('.aui-avatar').attr('data-tooltip');
            }
        });
    }

    function onReady(repositoryJson, cloneUrlDialogTrigger) {
        initRepositoryPageState(repositoryJson);
        initCloneUrlInput();
        _quickCopyText2.default.onReady();
        (0, _jquery2.default)(document).ready(_sidebar2.default.onReady);
        _stickyBranches2.default.onReady();
        initCloneUrlDialog(cloneUrlDialogTrigger);
        bindCreatePullRequestButton();
        bindBadgesTipsy();
        bindProjectAvatarTipsy();

        _events2.default.on('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', function (keyboardShortcuts) {
            keyboardShortcuts.enableContext('repository');
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});