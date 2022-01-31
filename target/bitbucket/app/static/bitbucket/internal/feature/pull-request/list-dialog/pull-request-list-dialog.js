define('bitbucket/internal/feature/pull-request/list-dialog/pull-request-list-dialog', ['exports', '@atlassian/aui', 'bitbucket/util/events', 'bitbucket/internal/feature/pull-request/table/pull-request-table'], function (exports, _aui, _events, _pullRequestTable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.showFor = showFor;
    exports.listenForNavigationKeyboardShortcuts = listenForNavigationKeyboardShortcuts;

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _pullRequestTable2 = babelHelpers.interopRequireDefault(_pullRequestTable);

    var getDialogContentContainer = function getDialogContentContainer(dialog) {
        return dialog.$el.find('.aui-dialog2-content');
    };

    var keyboardShortcuts = {
        nextItemKey: null,
        prevItemKey: null
    };

    var PullRequestListDialog = function () {
        function PullRequestListDialog(pullRequestUrlBuilder, options) {
            var _this = this;

            babelHelpers.classCallCheck(this, PullRequestListDialog);

            options = babelHelpers.extends({}, PullRequestListDialog.defaults, options);

            this._dialog = (0, _aui.dialog2)(aui.dialog.dialog2({
                id: 'pull-request-list-dialog',
                content: bitbucket.internal.feature.pullRequest.pullRequestTable({}),
                titleText: options.titleText,
                size: 'xlarge',
                removeOnHide: true
            }));

            this._dialog.show();

            this.pullRequestTable = new _pullRequestTable2.default(pullRequestUrlBuilder, {
                scrollPaneSelector: getDialogContentContainer(this._dialog),
                onClick: options.onClick
            });

            // cancel the dialog if another dialog is opened, since the default error handling from ajax.rest() will
            // also show an error dialog (or redirect to the login page);
            // this avoids having the error dialog showing up on top of the pull request dialog.
            _aui.dialog2.on('show', function () {
                if (_this._dialog) {
                    _this._dialog.hide();
                }
            });

            _aui.dialog2.on('hide', function () {
                _this.destroy();
            });

            this._dialog.$el.find('.close-button').click(function () {
                _this._dialog.hide();
            });
        }

        babelHelpers.createClass(PullRequestListDialog, [{
            key: 'init',
            value: function init() {
                this.pullRequestTable.init();
                this.pullRequestTable.initShortcuts(keyboardShortcuts);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.pullRequestTable.removeShortcuts();
            }
        }]);
        return PullRequestListDialog;
    }();

    PullRequestListDialog.defaults = {
        titleText: _aui.I18n.getText('bitbucket.web.pullrequest.listdialog.header')
    };


    /**
     * Shows a dialog containing a list of pull requests retrieved with the given pullRequestUrlBuilder
     *
     * @param {Object} pullRequestUrlBuilder a nav builder for a REST request that returns pull request objects
     * @param {Object} options additional options including:
     *                  - titleText the title of the dialog
     */
    function showFor(pullRequestUrlBuilder) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var dialog = new PullRequestListDialog(pullRequestUrlBuilder, options);

        dialog.init();
    }

    function listenForNavigationKeyboardShortcuts() {
        _events2.default.chain().on('bitbucket.internal.keyboard.shortcuts.requestMoveToNextHandler', function (key) {
            keyboardShortcuts.nextItemKey = key;
        }).on('bitbucket.internal.keyboard.shortcuts.requestMoveToPreviousHandler', function (key) {
            keyboardShortcuts.prevItemKey = key;
        }).on('bitbucket.internal.keyboard.shortcuts.requestOpenItemHandler', function (key) {
            keyboardShortcuts.openItemKey = key;
        });
    }
});