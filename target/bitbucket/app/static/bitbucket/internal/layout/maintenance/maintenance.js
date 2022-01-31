define('bitbucket/internal/layout/maintenance/maintenance', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/util/ajax', 'bitbucket/internal/widget/confirm-dialog/confirm-dialog', 'bitbucket/internal/widget/progress-bar/progress-bar'], function (module, exports, _aui, _jquery, _navbuilder, _ajax, _confirmDialog, _progressBar) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _confirmDialog2 = babelHelpers.interopRequireDefault(_confirmDialog);

    var _progressBar2 = babelHelpers.interopRequireDefault(_progressBar);

    function showCanceling($trigger, progressBar, opts) {
        $trigger.val(opts.cancelingButtonText).prop('disabled', true).toggleClass('disabled', true);
        progressBar.update({
            message: opts.cancelingDescription,
            percentage: 100
        });
        progressBar.reversed(true);
        progressBar.active(true);
        (0, _jquery2.default)('#backup-description').hide();
        (0, _jquery2.default)('#content > header > h1').text(opts.canceledHeader);
    }

    function pollingDone(opts) {
        location.href = opts.redirectUrl;
    }

    function pollTickCallback(progressBar, data, textStatus, xhr) {
        if (data.task) {
            if (data.task.state && data.task.state !== 'RUNNING') {
                return true;
            }

            progressBar.update(data.task.progress);
            if (data.task.progress.percentage === 100) {
                return true;
            }
        }
        return undefined;
    }

    function pollStatus(opts, progressBar) {
        var canceled = false;

        var promise = _ajax2.default.poll({
            url: opts.pollUrl,
            pollTimeout: Infinity,
            interval: 500,
            statusCode: {
                '404': function _() {
                    pollingDone(opts);
                    return false;
                },
                // Ignore all other errors
                '*': false
            },
            tick: function tick(data, textStatus, xhr) {
                return opts.pollTickCallback(progressBar, data, textStatus, xhr);
            }
        });
        promise.cancel = function () {
            canceled = true;
        };
        promise.isCancelled = function () {
            return canceled;
        };
        return promise;
    }

    function init(options) {
        var defaults = {
            pollUrl: _aui2.default.contextPath() + '/system/maintenance',
            pollTickCallback: pollTickCallback,
            cancelTriggerSelector: '.cancel-link',
            cancelFormSelector: '.cancel-form',
            progressBarSelector: '#progress',
            redirectUrl: _navbuilder2.default.dashboard().build(),
            cancelButtonSelector: '#cancel',
            canceledHeader: _aui2.default.I18n.getText('bitbucket.web.maintenance.canceled.title'),
            cancelingButtonText: _aui2.default.I18n.getText('bitbucket.web.maintenance.canceling.button'),
            cancelingDescription: _aui2.default.I18n.getText('bitbucket.web.maintenance.canceling.description'),
            hasCancelDialog: true,
            cancelDialogId: 'cancel-maintenance-dialog',
            cancelDialogTitle: _aui2.default.I18n.getText('bitbucket.web.maintenance.dialog.title'),
            cancelDialogTitleClass: 'warning-header',
            cancelDialogDescription: _aui2.default.I18n.getText('bitbucket.web.maintenance.dialog.description'),
            cancelDialogButtonText: _aui2.default.I18n.getText('bitbucket.web.maintenance.dialog.cancel')
        };

        var opts = _jquery2.default.extend({}, defaults, options);

        var $trigger = (0, _jquery2.default)(opts.cancelTriggerSelector);
        $trigger.on('click', function (e) {
            (0, _jquery2.default)(opts.cancelFormSelector).addClass('visible');
            $trigger.hide();
            e.preventDefault();
        });

        var progressBar = (0, _progressBar2.default)(opts.progressBarSelector);
        var poller = pollStatus(opts, progressBar).done(function (data) {
            pollingDone(opts);
        });

        if (opts.hasCancelDialog) {
            var cancelDialog = new _confirmDialog2.default({
                id: opts.cancelDialogId,
                titleText: opts.cancelDialogTitle,
                titleClass: opts.cancelDialogTitleClass,
                panelContent: '<p>' + opts.cancelDialogDescription + '</p>',
                submitText: opts.cancelDialogButtonText
            });
            cancelDialog.addCancelListener(function () {
                poller.resume();
                progressBar.active(true);
            });
            cancelDialog.addConfirmListener(function (promise, $trigger, closeCallback) {
                poller.cancel();
                closeCallback();
                showCanceling($trigger, progressBar, opts);
            });
            cancelDialog.attachTo(opts.cancelButtonSelector, function () {
                poller.pause();
                progressBar.active(false);
            });

            (0, _jquery2.default)(opts.cancelFormSelector).find('input[name="token"]').each(function () {
                var $self = (0, _jquery2.default)(this);

                var $cancelButtonSelector = (0, _jquery2.default)(opts.cancelButtonSelector);

                //Set initial disabled state
                $cancelButtonSelector.prop('disabled', !_jquery2.default.trim($self.val()));
                $self.on('input', function () {
                    //Change disabled state depending on whether the token field is empty
                    $cancelButtonSelector.prop('disabled', !_jquery2.default.trim($self.val()));
                });
            });
        }
    }

    exports.default = {
        init: init
    };
    module.exports = exports['default'];
});