define('bitbucket/internal/page/pull-request/view/pull-request-view-overview', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/enums', 'bitbucket/internal/feature/comments/comment-tips', 'bitbucket/internal/feature/pull-request/activity/pull-request-activity', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/events', 'bitbucket/internal/util/scroll', 'bitbucket/internal/util/syntax-highlight'], function (module, exports, _jquery, _lodash, _navbuilder, _enums, _commentTips, _pullRequestActivity, _pageState, _events, _scroll, _syntaxHighlight) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _commentTips2 = babelHelpers.interopRequireDefault(_commentTips);

    var _pullRequestActivity2 = babelHelpers.interopRequireDefault(_pullRequestActivity);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _scroll2 = babelHelpers.interopRequireDefault(_scroll);

    var _syntaxHighlight2 = babelHelpers.interopRequireDefault(_syntaxHighlight);

    var currentEl;
    var activity;
    var $mergeWarningBanner;

    var ActivityType = {
        COMMENT: 'comment',
        ACTIVITY: 'activity'
    };

    function bindMergeHelpDialog() {
        if ($mergeWarningBanner) {
            $mergeWarningBanner.find('.manual-merge').click(function (e) {
                e.preventDefault();
                _events2.default.trigger('bitbucket.internal.pull-request.show.cant.merge.help');
            });
        }
    }

    function showMergeWarningBanner(el, outcome) {
        if ($mergeWarningBanner) {
            if ($mergeWarningBanner.data('outcome') === outcome) {
                return;
            }

            $mergeWarningBanner.remove();
        }

        $mergeWarningBanner = (0, _jquery2.default)(bitbucket.internal.feature.pullRequest.mergeWarningBanner({
            outcome: outcome,
            extraClasses: 'transparent'
        })).prependTo(el);

        bindMergeHelpDialog();

        setTimeout(function () {
            return $mergeWarningBanner.removeClass('transparent');
        }, 0); //Let the message get rendered before starting the fade in.
    }

    //noinspection JSUnusedLocalSymbols
    _events2.default.on('bitbucket.internal.pull-request.*.merge', function (pullRequest, conflicted, vetoes, properties, outcome) {
        if (outcome === _enums.MergeOutcome.CLEAN) {
            if ($mergeWarningBanner) {
                $mergeWarningBanner.remove();
                $mergeWarningBanner = null;
            }
        } else {
            showMergeWarningBanner(currentEl, outcome);
        }
    });

    /**
     * Start up and initialise the PullRequest Activity stream.
     *
     * If there is an activity it gets reset and a freshly rendered list replaces the existing one
     * before creating a new {PullRequestActivity}
     *
     * @param {PullRequest} pullRequest
     * @param {string} fromType
     * @param {string} fromId
     */
    function initPullRequestActivity(pullRequest, fromType, fromId) {
        if (activity instanceof _pullRequestActivity2.default) {
            // If there is activity present already, reset and destroy it.
            activity.reset();
            activity = null;

            // Empty the PR Activity list
            var $newList = (0, _jquery2.default)(bitbucket.internal.feature.pullRequest.activity({
                id: 'pull-request-activity',
                currentUser: _pageState2.default.getCurrentUser() && _pageState2.default.getCurrentUser().toJSON(),
                commentTips: _commentTips2.default.tips
                // N.B. to only replace the list we need to find it within the content returned by the template.
            })).find('.pull-request-activity');

            getPullRequestActivity$El().replaceWith($newList);
        }

        // Create the new activity stream
        activity = new _pullRequestActivity2.default(getPullRequestActivity$El(), pullRequest, fromType, fromId, {
            scrollableElement: window
        });

        activity.init();
    }

    /**
     * Get the PullRequest Activity list by searching for it within the Pull Request overview HTMLElement.
     *
     * @returns {jQuery}
     */
    function getPullRequestActivity$El() {
        return (0, _jquery2.default)(currentEl).find('.pull-request-activity');
    }

    /**
     * Find and scroll to a comment or activity item if it can be found.
     *
     * @param {string} type - the type of item to find
     * @param {number|string} id - the id of the activity or comment
     * @returns {boolean} - whether the item was scrolled to (true) or could not be found (false)
     */
    function findAndScrollToActivity(type, id) {
        var $el = (0, _jquery2.default)(currentEl);
        var selector = type === ActivityType.COMMENT ? '.comment[data-id="' + id + '"]' : '.activity-item[data-activityid="' + id + '"]';
        var $item = $el.find(selector);

        if (!$item.length) {
            return false;
        }

        // unhighlight any focused items and highlight the new one
        $el.find('.comment.focused, .activity-item.focused').removeClass('focused');
        $item.addClass('focused');
        _scroll2.default.scrollTo($item);

        return true;
    }

    /**
     * If a URL change occurs with a new activity/comment id and an activity type then go to the activity item.
     */
    function watchUrlChanges() {
        var activityParams = getActivityParams();

        if (activityParams.id && activityParams.type) {
            if (!findAndScrollToActivity(activityParams.type, activityParams.id)) {
                // If the item can not be found, reload the activity stream with the page that has the relevant item.
                initPullRequestActivity(_pageState2.default.getPullRequest(), activityParams.type, activityParams.id);
            }
        }
    }

    /**
     * Get the activity related URL params
     *
     * @returns {{type: string, id: number|string}} - the ID refers to the activity or comment id.
     */
    function getActivityParams() {
        var uri = _navbuilder2.default.parse(window.location);
        return {
            type: uri.getQueryParamValue('commentId') ? 'comment' : 'activity',
            id: uri.getQueryParamValue('commentId') || uri.getQueryParamValue('activityId')
        };
    }

    exports.default = {
        load: function load(el) {
            var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            currentEl = el;

            var pullRequest = _pageState2.default.getPullRequest();

            el.innerHTML = bitbucket.internal.feature.pullRequest.viewOverview({
                pullRequest: pullRequest.toJSON(),
                author: pullRequest.getAuthor().getUser().toJSON(),
                createdDate: pullRequest.getCreatedDate(),
                description: pullRequest.getDescription(),
                descriptionAsHtml: pullRequest.getDescriptionAsHtml(),
                currentUser: _pageState2.default.getCurrentUser() && _pageState2.default.getCurrentUser().toJSON(),
                commentTips: _commentTips2.default.tips
            });

            _syntaxHighlight2.default.container((0, _jquery2.default)(el));

            if (context.store) {
                var state = context.store.getState();
                var outcome = _lodash2.default.get(state, 'pullRequest.mergeable.outcome', null);
                if (outcome === _enums.MergeOutcome.CONFLICTED) {
                    showMergeWarningBanner(el, outcome);
                }
            }

            if ($mergeWarningBanner) {
                // Need to rebind the help dialog because the unload function removes the event binding
                bindMergeHelpDialog();
                $mergeWarningBanner.addClass('transparent').prependTo(el);
                setTimeout(function () {
                    return $mergeWarningBanner.removeClass('transparent');
                }, 0);
            }

            var activityParams = getActivityParams();

            initPullRequestActivity(pullRequest, activityParams.type, activityParams.id);

            _events2.default.on('bitbucket.internal.history.changestate', watchUrlChanges);
        },
        // This is _only_ exposed for the live-update plugin and should _not_ be used for anything else
        _internalActivity: function _internalActivity() {
            return activity;
        },
        unload: function unload(el) {
            activity.reset();
            activity = null;
            (0, _jquery2.default)(el).empty();
            currentEl = null;
            _events2.default.off('bitbucket.internal.history.changestate', watchUrlChanges);
        },
        keyboardShortcutContexts: ['pull-request-overview']
    };
    module.exports = exports['default'];
});