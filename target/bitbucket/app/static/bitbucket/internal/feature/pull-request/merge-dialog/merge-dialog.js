define('bitbucket/internal/feature/pull-request/merge-dialog/merge-dialog', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/events', 'bitbucket/internal/util/set-dialog-buttons-disabled', 'bitbucket/internal/widget/commit-message-editor/commit-message-editor', 'bitbucket/internal/widget/submit-spinner/submit-spinner'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _avatar, _pageState, _ajax, _events, _setDialogButtonsDisabled, _commitMessageEditor, _submitSpinner) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _setDialogButtonsDisabled2 = babelHelpers.interopRequireDefault(_setDialogButtonsDisabled);

    var _submitSpinner2 = babelHelpers.interopRequireDefault(_submitSpinner);

    var MERGE_STRATEGY_BUTTON_SELECTOR = '#merge-strategy-button';
    var mergeDialog = void 0;

    function initMergeDialog(_ref) {
        var _callback = _ref.callback,
            mergeTimeout = _ref.mergeTimeout;

        _ajax2.default.rest({
            url: _navbuilder2.default.rest().currentRepo().pullRequestSettings().build(),
            type: 'GET'
        }).done(function (PullRequestJSON) {
            var pullRequest = _pageState2.default.getPullRequest();
            var filterStrategies = PullRequestJSON.mergeConfig.strategies.filter(function (strategy) {
                // filter out disabled strategies
                return strategy.enabled;
            }).filter(function (strategy) {
                // remove the default strategy
                return strategy.id !== PullRequestJSON.mergeConfig.defaultStrategy.id;
            });

            filterStrategies.unshift(PullRequestJSON.mergeConfig.defaultStrategy); // add default to beginning

            var options = {
                dialog: {
                    person: _pageState2.default.getCurrentUser() && _pageState2.default.getCurrentUser().toJSON(),
                    pullRequest: pullRequest.toJSON(),
                    mergeStrategies: filterStrategies,
                    defaultStrategy: PullRequestJSON.mergeConfig.defaultStrategy
                },
                ajax: {
                    statusCode: {
                        '400': function _(xhr, textStatus, errorThrown, response, dominantError) {
                            var $mergeDialogContent = mergeDialog.$el.find('.aui-dialog2-content');

                            if (response.errors) {
                                $mergeDialogContent.children('.aui-message').remove();
                                $mergeDialogContent.prepend(bitbucket.internal.feature.pullRequest.merge.errors({
                                    errors: response.errors
                                }));
                            }

                            return false;
                        },
                        '401': function _(xhr, textStatus, errorThrown, errors, dominantError) {
                            mergeDialog.hide();
                            return babelHelpers.extends({}, dominantError, {
                                title: _aui2.default.I18n.getText('bitbucket.web.pullrequest.merge.error.401.title'),
                                message: _aui2.default.I18n.getText('bitbucket.web.pullrequest.merge.error.401.message'),
                                fallbackUrl: false,
                                shouldReload: true
                            });
                        },
                        '409': function _(xhr, textStatus, errorThrown, response, dominantError) {
                            var firstError = (0, _lodash.get)(response, 'errors.0', {});
                            var $mergeDialogContent = mergeDialog.$el.find('.aui-dialog2-content');
                            $mergeDialogContent.children('.aui-message').remove();

                            // if the PR is out of date, hide the dialog and return so the fallback error
                            // handling can show a dialog to reload the page
                            if (firstError.exceptionName === 'com.atlassian.bitbucket.pull.PullRequestOutOfDateException') {
                                mergeDialog.hide();
                                return;
                            }

                            _events2.default.trigger('bitbucket.internal.pull-request.cant.merge', null, pullRequest, firstError.conflicted || firstError.isConflicted, firstError.vetoes);
                            $mergeDialogContent.prepend(bitbucket.internal.feature.pullRequest.merge.errors({
                                errors: response.errors
                            }));
                            if (mergeDialog.$el.attr('aria-hidden') !== 'false') {
                                _events2.default.trigger('bitbucket.internal.pull-request.show.cant.merge.help');
                            }
                            return false;
                        },
                        '*': function _() {
                            mergeDialog.hide();
                        }
                    },
                    timeout: mergeTimeout * 1000
                },
                callback: function callback(StashPullRequestJSON) {
                    _callback(StashPullRequestJSON);
                    mergeDialog.hide();
                }
            };
            mergeDialog = createMergeDialog(options);
        });
    }

    // Creates a AUI Dialog2 dialog, separate from the legacy actionDialog which uses ConfirmDialog (AUI Dialog 1)
    function createMergeDialog(options) {
        var mergeDialog = _aui2.default.dialog2(bitbucket.internal.feature.pullRequest.merge.dialog(options.dialog));
        // we manually add the dialog to the body so that it's on the DOM and available for the branch deletion plugin
        // to disable the checkbox
        (0, _jquery2.default)('body').append(mergeDialog.$el);

        var mergeXhr = void 0;
        var promiseDecorator = void 0;
        var mergeStrategy = void 0;

        (0, _jquery2.default)(document).on('click', '#merge-strategy-opts aui-item-link', function (e) {
            var $target = (0, _jquery2.default)(e.currentTarget);
            mergeStrategy = $target.data('strategy');
            mergeDialog.$el.find(MERGE_STRATEGY_BUTTON_SELECTOR).text($target.find('.strategy-name').text());
            e.preventDefault();
        });

        (0, _jquery2.default)('#merge-strategy-opts').on('aui-dropdown2-show', function (e) {
            function isOnScreen($el) {
                var $win = (0, _jquery2.default)(window);
                return $el.offset().top + $el.outerHeight() < $win.scrollTop() + $win.height();
            }
            setTimeout(function () {
                var $fullDropdown = (0, _jquery2.default)(e.target);
                var $dropdown = $fullDropdown.find('div[role="group"]');
                var $items = $dropdown.find('aui-item-link a');
                if (!isOnScreen($items.last())) {
                    // allow the dropdown to take up as much space as possible
                    $dropdown.css({
                        'overflow-y': 'scroll',
                        'max-height': (0, _jquery2.default)(window).height() - $dropdown.offset().top - 10
                    });
                }
            }, 0);
        });

        mergeDialog.$el.find('.confirm-button').on('click', function (evt) {
            var spinnerTarget = (0, _jquery2.default)(MERGE_STRATEGY_BUTTON_SELECTOR).length ? (0, _jquery2.default)(MERGE_STRATEGY_BUTTON_SELECTOR) : evt.target;
            var spinner = new _submitSpinner2.default(spinnerTarget, 'before');
            var mergeUrl = _navbuilder2.default.rest().currentPullRequest().merge().withParams({
                avatarSize: _avatar.AvatarSize.XSMALL,
                version: _pageState2.default.getPullRequest().getVersion()
            }).build();

            (0, _setDialogButtonsDisabled2.default)(mergeDialog, true);
            spinner.show();

            mergeXhr = _ajax2.default.rest(babelHelpers.extends({}, options.ajax, {
                url: mergeUrl,
                type: 'POST',
                data: {
                    autoSubject: false,
                    message: mergeDialog.$el.find('#commit-message').val().trim(),
                    strategyId: mergeStrategy
                }
            }));

            var mergePromise = mergeXhr;

            mergeXhr.always(function () {
                mergeXhr = null; // null it out so that merge can't be cancelled below
                spinner.hide();
                (0, _setDialogButtonsDisabled2.default)(mergeDialog, false);
            });

            // HACK - we don't want to expose plugin points for the promise yet
            // we hard code a link to the branch deletion, if it's available
            if (!promiseDecorator) {
                try {
                    // assigning require to a variable - otherwise Babel will move the import to
                    // the top level require, removing the if !promiseDecorator condition. If the
                    // branchDeletion module is not available, this merge-dialog module will fail
                    var hideRequireFromBabel = require;
                    promiseDecorator = hideRequireFromBabel('bitbucket/internal/feature/pull-request-cleanup/pull-request-cleanup').getMergePromiseDecorator;
                } catch (err) {
                    // ignore
                }
            }

            if (promiseDecorator) {
                mergePromise = promiseDecorator(mergePromise, function () {
                    return mergeDialog.hide();
                }) || mergePromise;
            }

            mergePromise.done(function (StashPullRequestJSON) {
                _events2.default.trigger('bitbucket.internal.feature.pullRequest.merged', null, {
                    user: _pageState2.default.getCurrentUser().toJSON(),
                    pullRequest: StashPullRequestJSON
                });
                options.callback(StashPullRequestJSON);
            });
        });

        mergeDialog.$el.find('.cancel-button').on('click', function () {
            if (mergeXhr) {
                mergeXhr.abort();
                mergeXhr = null;
            }

            mergeDialog.hide();
        });

        mergeDialog.on('hide', function (e) {
            if (e.target === e.currentTarget) {
                //Reset the value of the commit message to the generated version
                var $commitMessage = mergeDialog.$el.find('#commit-message');
                $commitMessage.val($commitMessage.attr('data-original-value'));
            }
        });

        mergeDialog.$el.on('click', '.view-merge-veto-details-button', function () {
            mergeDialog.hide();
            _events2.default.trigger('bitbucket.internal.pull-request.show.cant.merge.help');
        });

        return mergeDialog;
    }

    function onMergeClick() {
        mergeDialog.show();
        mergeDialog.$el.find('.confirm-button').focus();

        (0, _commitMessageEditor.getCommitMessageEditor)(mergeDialog.$el.find('#commit-message')[0]);
    }

    exports.default = {
        onMergeClick: onMergeClick,
        initMergeDialog: initMergeDialog
    };
    module.exports = exports['default'];
});