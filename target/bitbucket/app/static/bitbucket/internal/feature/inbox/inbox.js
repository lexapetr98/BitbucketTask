define('bitbucket/internal/feature/inbox/inbox', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/util/state'], function (module, exports, _aui, _jquery, _lodash, _events, _navbuilder, _server, _state) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var inlineDialog;
    var $inboxTrigger;

    function getInboxCountResourceUrl() {
        return _navbuilder2.default.rest().addPathComponents('inbox', 'pull-requests', 'count').build();
    }

    var hideOnEscapeKeyUp = function hideOnEscapeKeyUp(e) {
        if (e.keyCode === _jquery2.default.ui.keyCode.ESCAPE) {
            inlineDialog.hide();
            e.preventDefault();
        }
    };

    var hideOnDialogShown = function hideOnDialogShown() {
        inlineDialog.hide();
    };

    function initialiseDialog($container) {
        // pass null as second param to prevent the require from being extracted to the top level AMD module by the babel transform
        require('bitbucket/internal/feature/inbox/inbox-dialog', null).onReady($container[0]);
    }

    var onShowDialog = function onShowDialog($content, trigger, showPopup) {
        showPopup();
        (0, _jquery2.default)(document).on('keyup', hideOnEscapeKeyUp);

        /*
         * This has been added for interaction with the other dialogs using dialog2,
         * and so the inline dialog for the inbox doesn't know about them which causes
         * layering issues when they're opened from the PR list.
         *
         * This might be able to be removed in future if there's an InlineDialog2
         * and the Inbox is updated to use it.
         */
        _aui2.default.dialog2.on('show', hideOnDialogShown);

        /*
         * This has been added for interaction with drop down menus that stay
         * shown even with the inbox dialog shown. See BSERV-7835
         */
        (0, _jquery2.default)('.aui-dropdown2-active').trigger('aui-button-invoke');

        loadDialogResources($content, _lodash2.default.partial(initialiseDialog, $content));
    };

    var loadDialogResources = _lodash2.default.once(function ($content, callback) {
        var $spinner = (0, _jquery2.default)('<div class="loading-resource-spinner"></div>');
        $content.empty().append($spinner);
        $spinner.show().spin('medium');

        WRM.require('wrc!bitbucket.pullRequest.inbox').done(function () {
            $spinner.spinStop().remove();
            callback();
        }).always(function () {
            $spinner.spinStop().remove();
        });
    });

    var onHideDialog = function onHideDialog() {
        (0, _jquery2.default)(document).off('keyup', hideOnEscapeKeyUp);
        _aui2.default.dialog2.off('show', hideOnDialogShown);

        if ((0, _jquery2.default)(document.activeElement).closest('#inline-dialog-inbox-pull-requests-content').length) {
            // if the focus is inside the dialog, you get stuck when it closes.
            document.activeElement.blur();
        }
    };

    var fetchInboxCount = function fetchInboxCount() {
        _server2.default.rest({
            url: getInboxCountResourceUrl(),
            type: 'GET',
            statusCode: {
                '*': false
            }
        }).done(function (data) {
            $inboxTrigger.attr('aria-label', _aui2.default.I18n.getText('bitbucket.web.header.inbox.menu.aria.label', data.count));
            if (data.count > 0) {
                var $badge = (0, _jquery2.default)(aui.badges.badge({
                    text: data.count
                }));
                $inboxTrigger.html(bitbucket.internal.inbox.triggerIcon({ isEmpty: false })).append($badge);
                setTimeout(function () {
                    // Needed for the transition to trigger
                    $badge.addClass('visible');
                }, 0);
            } else {
                // The badge fadeOut transition happens with a CSS3 transition, which we can't hook into.
                // Use a setTimeout instead, unfortunately.
                var cssTransitionDuration = 500;
                $inboxTrigger.find('.aui-badge').removeClass('visible');
                setTimeout(function () {
                    $inboxTrigger.html(bitbucket.internal.inbox.triggerIcon({ isEmpty: true }));
                }, cssTransitionDuration);
            }
            $inboxTrigger.attr('data-countLoaded', true);
        });
    };

    function onReady() {
        $inboxTrigger = (0, _jquery2.default)('#inbox-trigger');
        $inboxTrigger.attr('aria-label', _aui2.default.I18n.getText('bitbucket.web.header.inbox.menu.tooltip'));
        if ($inboxTrigger.length && _state2.default.getCurrentUser()) {
            $inboxTrigger.html(bitbucket.internal.inbox.triggerIcon({ isEmpty: true }));
            inlineDialog = _aui2.default.InlineDialog($inboxTrigger, 'inbox-pull-requests-content', onShowDialog, {
                width: 800,
                closeOnTriggerClick: true,
                hideCallback: onHideDialog
            });

            fetchInboxCount();

            var _reviewerStatusUpdateHandler = function _reviewerStatusUpdateHandler(data) {
                if (data.user.name === _state2.default.getCurrentUser().name) {
                    fetchInboxCount();
                }
            };

            _events2.default.on('bitbucket.internal.widget.approve-button.added', _reviewerStatusUpdateHandler);
            _events2.default.on('bitbucket.internal.widget.approve-button.removed', _reviewerStatusUpdateHandler);
            _events2.default.on('bitbucket.internal.widget.needs-work.added', _reviewerStatusUpdateHandler);
            _events2.default.on('bitbucket.internal.widget.needs-work.removed', _reviewerStatusUpdateHandler);
            _events2.default.on('bitbucket.internal.feature.pullRequest.self.added', _reviewerStatusUpdateHandler);
            _events2.default.on('bitbucket.internal.feature.pullRequest.self.removed', _reviewerStatusUpdateHandler);
        }
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});