'use strict';

require(['@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/commit/request-commit'], function (AJS, $, _, nav, requestCommit) {
    var truncateCommitMessage = function truncateCommitMessage(commitMessage) {
        //Truncate long commit messages to ~750 characters (break on the first whitespace character AFTER the 750th character)
        var truncated = commitMessage.substring(0, commitMessage.substring(750).search(/\s/) + 750);
        return truncated.length < commitMessage.length ? truncated + '…' : truncated;
    };

    var refreshTipsy = function refreshTipsy($el) {
        if ($el.data('tipsy').hoverState === 'in') {
            $el.tipsy('hide');
            $el.tipsy('show');
        }
    };

    function initTooltip($this, trigger) {
        $this.tipsy({
            opacity: 0.98,
            trigger: trigger,
            gravity: function gravity() {
                return $this.attr('data-commit-preview-gravity') || $.fn.tipsy.autoNS.call(this);
            },
            className: 'commit-preview-tipsy',
            title: function title() {
                var commitMessage = $this.attr('data-commit-message');
                var commitPreviewPrefix = $this.attr('data-commit-preview-prefix');
                var loadingText = AJS.I18n.getText('bitbucket.web.commit.preview.loading');

                if (commitMessage) {
                    return commitPreviewPrefix ? commitPreviewPrefix + '\n\n' + truncateCommitMessage(commitMessage) : truncateCommitMessage(commitMessage);
                }

                loadDescription($this).then(function () {
                    return refreshTipsy($this);
                });

                return commitPreviewPrefix ? commitPreviewPrefix + '\n\n' + loadingText : loadingText;
            }
        });
    }

    function loadDescription($this) {
        if ($this.data('commit-loading')) {
            return $this.data('commit-loading');
        }

        var commitId = $this.attr('data-commitid') || $this.text();
        var paramsRegex = /.*?\/(projects|users)\/([^\/]+)\/repos\/([^\/]+)\//;
        var matches = nav.parse($this.attr('href')).path().match(paramsRegex);
        var loadingPromise = requestCommit({
            commitId: commitId,
            project: matches && (matches[1] === 'users' ? '~' : '') + matches[2],
            repo: matches && matches[3],
            statusCode: {
                '404': false,
                '*': false // this should never cause a redirect or an error dialog or any other default handling.
            }
        }).then(function (commit) {
            return commit.message ? truncateCommitMessage(commit.message) : AJS.I18n.getText('bitbucket.web.commit.preview.message.empty');
        }, function () {
            return AJS.I18n.getText('bitbucket.web.commit.preview.request.failed');
        });

        loadingPromise.then(function (message) {
            return $this.attr('data-commit-message', message);
        });

        $this.data('commit-loading', loadingPromise);
        return loadingPromise;
    }

    $(document).on('mouseenter focus', 'a.commitid:not(.no-preview):not([data-inited]), \n        .commit-preview-trigger:not([data-inited]), \n        .commits-table .message[data-commit-message]:not([data-inited])', function (e) {
        // Sometimes we want to trigger _only_ on hover and NOT focus, which tipsy doesn't support. (we focus the first row on page load)
        // So we manually init each item on the first mouseenter. :not([data-inited]) ensures we don't double-init anything.
        var $this = $(this).attr('data-inited', true);
        var triggerMode = $this.attr('data-trigger-mode') || 'all';

        if (triggerMode === 'all') {
            initTooltip($this, 'hover'); // hover in tipsy world implies focus as well
            $this.tipsy('show');
            return;
        }

        initTooltip($this, 'manual');
        var tipsy = $this.tipsy(true);

        $this.on('mouseenter', function () {
            return tipsy.show();
        });
        $this.on('mouseleave', function () {
            return tipsy.hide();
        });

        if (triggerMode === 'hover-accessible') {
            // show the message in a describedby on focus, with no tipsy.
            loadDescription($this).then(function (message) {
                var id = _.uniqueId('commit-desc-');
                $(bitbucket.internal.widget.commitPreview.assistiveText({
                    id: id,
                    message: message
                })).insertAfter($this);
                $this.attr('aria-describedby', id);
            });
        }

        if (e.type === 'mouseenter') {
            tipsy.show();
        }
    });
});