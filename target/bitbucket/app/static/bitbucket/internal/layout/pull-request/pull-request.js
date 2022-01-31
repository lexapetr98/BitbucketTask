define('bitbucket/internal/layout/pull-request/pull-request', ['module', 'exports', '@atlassian/aui', 'chaperone', 'jquery', 'lodash', 'react', 'react-dom', 'react-redux', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/actions/pull-request', 'bitbucket/internal/enums', 'bitbucket/internal/feature/file-content/request-change', 'bitbucket/internal/feature/pull-request/header/pull-request-header-view', 'bitbucket/internal/feature/pull-request/pull-request-analytics/pull-request-analytics', 'bitbucket/internal/feature/pull-request/store/pull-request-store', 'bitbucket/internal/model/commit-range', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/participant', 'bitbucket/internal/model/pull-request', 'bitbucket/internal/model/revision', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/events', 'bitbucket/internal/util/feature-enabled', 'bitbucket/internal/util/feature-loader', 'bitbucket/internal/util/history', 'bitbucket/internal/util/horizontal-keyboard-scrolling', 'bitbucket/internal/util/notifications/notifications'], function (module, exports, _aui, _chaperone, _jquery, _lodash, _react, _reactDom, _reactRedux, _events, _navbuilder, _pullRequest, _enums, _requestChange, _pullRequestHeaderView, _pullRequestAnalytics, _pullRequestStore, _commitRange, _pageState, _participant, _pullRequest2, _revision, _domEvent, _events3, _featureEnabled, _featureLoader, _history, _horizontalKeyboardScrolling, _notifications) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _chaperone2 = babelHelpers.interopRequireDefault(_chaperone);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _enums2 = babelHelpers.interopRequireDefault(_enums);

    var _requestChange2 = babelHelpers.interopRequireDefault(_requestChange);

    var _pullRequestHeaderView2 = babelHelpers.interopRequireDefault(_pullRequestHeaderView);

    var _pullRequestAnalytics2 = babelHelpers.interopRequireDefault(_pullRequestAnalytics);

    var _pullRequestStore2 = babelHelpers.interopRequireDefault(_pullRequestStore);

    var _commitRange2 = babelHelpers.interopRequireDefault(_commitRange);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _participant2 = babelHelpers.interopRequireDefault(_participant);

    var _pullRequest3 = babelHelpers.interopRequireDefault(_pullRequest2);

    var _revision2 = babelHelpers.interopRequireDefault(_revision);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var _events4 = babelHelpers.interopRequireDefault(_events3);

    var _featureEnabled2 = babelHelpers.interopRequireDefault(_featureEnabled);

    var _featureLoader2 = babelHelpers.interopRequireDefault(_featureLoader);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    var _horizontalKeyboardScrolling2 = babelHelpers.interopRequireDefault(_horizontalKeyboardScrolling);

    var _notifications2 = babelHelpers.interopRequireDefault(_notifications);

    var DEFAULT_MERGE_TIMEOUT_SEC = 5 * 60; /* globals bitbucket_help_url:false */


    var HANDLER_TYPES = {
        diff: 'bitbucket.pull-request.nav.diff',
        overview: 'bitbucket.pull-request.nav.overview',
        commits: 'bitbucket.pull-request.nav.commits'
    };

    var $tabMenu;

    var haveKeyboardShortcutsObject = _jquery2.default.Deferred();

    var pullRequestNextEnabled = false;
    _featureEnabled2.default.getFromProvider('pull.request.next').done(function (enabled) {
        return pullRequestNextEnabled = enabled;
    });

    function bindKeyboardShortcuts() {
        _events4.default.on('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', function (keyboardShortcuts) {
            keyboardShortcuts.enableContext('pull-request');
            haveKeyboardShortcutsObject.resolve(keyboardShortcuts);
        });

        _events4.default.on('bitbucket.internal.keyboard.shortcuts.requestGotoPullRequestsListHandler', function (keys) {
            (this.execute ? this : _aui2.default.whenIType(keys)).execute(function () {
                window.location.href = _navbuilder2.default.currentRepo().allPullRequests().build();
            });
        });

        _events4.default.on('bitbucket.internal.keyboard.shortcuts.requestChangePullRequestSectionHandler', function (keys) {
            (this.execute ? this : _aui2.default.whenIType(keys)).execute(function (e) {
                var number = parseInt(String.fromCharCode(e.which), 10);
                var $link = $tabMenu.children().eq(number - 1).children('a');
                $link.click();
            });
        });
    }

    function initTabs() {
        var setTabActive = function setTabActive($tab, e) {
            $tab.addClass('active-tab').siblings().removeClass('active-tab');

            if (e) {
                var tabName = $tab.data('module-key').split('.').pop();
                var data = {
                    keyboard: !(e.originalEvent instanceof MouseEvent)
                };
                // Analytics event: stash.client.pullRequest.tab.commits
                // Analytics event: stash.client.pullRequest.tab.diff
                // Analytics event: stash.client.pullRequest.tab.overview
                _events4.default.trigger('bitbucket.internal.feature.pullRequest.tab.' + tabName, null, data);
            }
        };

        var updateState = function updateState(_ref) {
            var commitJSON = _ref.commitJSON,
                commitRangeJSON = _ref.commitRangeJSON;

            _pageState2.default.setCommit(commitJSON ? new _revision2.default(commitJSON) : null);
            _pageState2.default.setCommitRange(!commitJSON && commitRangeJSON ? new _commitRange2.default(commitRangeJSON) : null);

            //This extends the current context
            loader.setContext({
                commit: commitJSON
            });
        };

        $tabMenu.on('click', 'a', function (e) {
            if (!_domEvent2.default.openInSameTab(e)) {
                return;
            }
            var $a = (0, _jquery2.default)(this);
            var $tab = $a.parent();

            if (!$tab.is('.active-tab')) {
                setTabActive($tab);
                _events4.default.trigger('bitbucket.internal.layout.pull-request.urlRequested', null, $a.prop('href'));
            }

            e.preventDefault();
        });

        _events4.default.on('bitbucket.internal.page.pull-request.view.contextLoaded', function (context) {
            setTabActive($tabMenu.find('[data-module-key="' + context.name + '"]'));

            // Pause the scrolling functionality on the overview section for pull request page
            // This piece of code can be removed on pull request 2.0
            if (context.name === HANDLER_TYPES.diff) {
                _horizontalKeyboardScrolling2.default.resume();
            } else {
                _horizontalKeyboardScrolling2.default.pause();
            }
        });

        _events4.default.on('bitbucket.internal.feature.pullRequest.commit.open', updateState);
        _events4.default.on('bitbucket.internal.feature.pullRequest.*.view', updateState);

        haveKeyboardShortcutsObject.done(function (keyboardShortcuts) {
            _lodash2.default.forEach($tabMenu.children(), function (tab, index) {
                var $tab = (0, _jquery2.default)(tab);
                var key = String(index + 1);
                var message = _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.pull-request.switch.tabs', $tab.text());
                keyboardShortcuts.addCustomShortcut('pull-request', [[key]], message);
                $tab.attr('title', ($tab.attr('title') || message) + _aui2.default.I18n.getText('bitbucket.web.keyboardshortcut.type', key));
            });
        });
    }

    var loader = new _featureLoader2.default({
        loadedEvent: 'bitbucket.internal.page.pull-request.view.contextLoaded',
        unloadedEvent: 'bitbucket.internal.page.pull-request.page.pull-request.view.contextUnloaded',
        requestedEvent: 'bitbucket.internal.page.pull-request.view.contextRequested'
    });

    function initLoader(contentSelector, dataReady, store, commit) {
        // TODO: Consider Jason's idea of contexts. Lots of weirdness to flesh out with
        // TODO: the best API for this stuff.

        loader.registerHandler(HANDLER_TYPES.diff, /^[^\?\#]*pull-requests\/\d+\/(diff|commits\/\b[0-9a-fA-F]{5,40}\b|unreviewed)/, pullRequestNextEnabled ? 'bitbucket/internal/next/page/pull-request/view/diff/pull-request-view-diff' : 'bitbucket/internal/page/pull-request/view/pull-request-view-diff');
        loader.registerHandler(HANDLER_TYPES.overview, /^[^\?\#]*pull-requests\/\d+\/overview/, 'bitbucket/internal/page/pull-request/view/pull-request-view-overview');
        loader.registerHandler(HANDLER_TYPES.commits, /^[^\?\#]*pull-requests\/\d+\/commits(\/?)($|[#?])/, 'bitbucket/internal/page/pull-request/view/pull-request-view-commits');

        loader.setContext(babelHelpers.extends({}, _pageState2.default.getPullRequestViewInternal(), {
            store: store,
            commit: commit
        }));

        /**
         * @param eventType {String} 'start' or 'end'
         * @param handlerName {String} name of the feature loader handler
         */
        function getBrowserMetricsEventHandler(eventType, handlerName) {
            var handlerKey = _lodash2.default.findKey(HANDLER_TYPES, handlerName);
            if (handlerKey) {
                _events2.default.trigger('bitbucket.internal.browser-metrics.pull-request.' + handlerKey + '.' + eventType);
            }
        }

        // Raising context requested/loaded events for Stash apdex plugin. The tab types are defined on {@code HANDLER_TYPES}.
        _events4.default.on('bitbucket.internal.page.pull-request.view.contextRequested', getBrowserMetricsEventHandler.bind(null, 'start'));

        _events4.default.on('bitbucket.internal.page.pull-request.view.contextLoaded', function (handler) {
            getBrowserMetricsEventHandler('end', handler.name);
        });

        _events4.default.on('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', function (keyboardShortcuts) {
            loader.setKeyboardShortcuts(keyboardShortcuts);
            keyboardShortcuts.enableContext('pull-request');
        });

        _events4.default.on('bitbucket.internal.layout.pull-request.urlRequested', function (url) {
            if (url !== window.location.href) {
                _history2.default.pushState(null, '', url);
            }
        });

        _events4.default.on('bitbucket.internal.util.feature-loader.errorOccurred', function (error) {
            if (error.code === _featureLoader2.default.NO_HANDLER) {
                console.log('You did not register a handler for this page. Please call\n' + "require('bitbucket/internal/layout/pull-request').registerHandler(\n" + "   'tab-web-item-module-key',\n" + '   /^[^\\?\\#]*url-regex/,\n' + '   {\n' + '       load : function (contentElement) {},\n' + '       unload : function (contentElement) {}\n' + '   }\n' + ')');
            } else {
                console.log(error.message);
            }
        });

        (pullRequestNextEnabled ? _jquery2.default.when(dataReady, WRM.require('wrc!' + 'bitbucket.page.pullRequestNext.view')) : dataReady).done(function () {
            return loader.init(document.querySelector(contentSelector));
        });
    }

    function initReviewerStatusFeatureDiscovery() {
        _chaperone2.default.registerFeature('reviewer-status', [{
            id: 'reviewer-status',
            alignment: 'top right',
            selector: '.reviewing.reviewer-status-selector',
            content: bitbucket.internal.feature.pullRequest.feature.discovery.reviewerStatus(),
            close: {
                text: _aui2.default.I18n.getText('bitbucket.web.got.it')
            },
            moreInfo: {
                href: bitbucket_help_url('bitbucket.help.pull.request'),
                text: _aui2.default.I18n.getText('bitbucket.web.pullrequest.learn.more'),
                extraAttributes: {
                    target: '_blank'
                }
            },
            once: true
        }]);

        _events4.default.on('bitbucket.internal.feature.pullRequest.self.added', _chaperone2.default.checkFeatureVisibility);
    }

    var registerHandler = _jquery2.default.proxy(loader.registerHandler, loader);

    /**
     *
     * @param {Object} options
     * @param {boolean} options.canDelete
     * @param {Object} options.commitJSON
     * @param {Object} options.pullRequestJSON
     * @param {Object} options.hasRepoWrite - does the current user have repo write
     * @param {Object} options.hasSourceRepoRead - can the current user read the source repo
     * @param {string} options.contentSelector
     * @param {Object} options.commitsTableWebSections
     * @param {?number} options.maxChanges
     * @param {?number} options.mergeTimeout
     * @param {?number} options.relevantContextLines
     * @param {?string} options.sinceCommitId
     */
    function onReady(options) {
        _pageState2.default.setPullRequest(new _pullRequest3.default(options.pullRequestJSON));
        _pageState2.default.extend('pullRequestViewInternal', function () {
            return {
                commitsTableWebSections: options.commitsTableWebSections,
                maxChanges: options.maxChanges,
                relevantContextLines: options.relevantContextLines,
                seenCommitReview: options.seenCommitReview
            };
        });
        _pageState2.default.extend('isWatching');

        if (options.commitJSON) {
            _history2.default.replaceState({
                commitRange: options.sinceCommitId && {
                    sinceRevision: { id: options.sinceCommitId },
                    untilRevision: options.commitJSON
                },
                commit: !options.sinceCommitId && options.commitJSON
            }, null);
        }

        var store = (0, _pullRequestStore2.default)();
        store.dispatch({
            type: 'PR_SET_PULL_REQUEST',
            payload: options.pullRequestJSON
        });
        store.dispatch({
            type: 'SET_CURRENT_USER',
            payload: _pageState2.default.getCurrentUser().toJSON()
        });

        _reactDom2.default.render(_react2.default.createElement(
            _reactRedux.Provider,
            { store: store },
            _react2.default.createElement(_pullRequestHeaderView2.default, {
                canDelete: options.canDelete,
                hasRepoWrite: options.hasRepoWrite,
                hasSourceRepoWrite: options.hasSourceRepoWrite,
                hasSourceRepoRead: options.hasSourceRepoRead,
                mergeTimeout: options.mergeTimeout || DEFAULT_MERGE_TIMEOUT_SEC
            })
        ), document.getElementById('pull-request-header'));

        $tabMenu = (0, _jquery2.default)('.content-body .aui-page-panel-content > .aui-tabs > .tabs-menu');

        var isWatchingPromise = _jquery2.default.Deferred();
        _PageDataPlugin.ready('com.atlassian.bitbucket.server.bitbucket-web:iswatching-provider', 'bitbucket.internal.pull-request.view', function (data) {
            store.dispatch({
                type: _pullRequest.PR_SET_IS_WATCHING,
                payload: data.isWatching
            });
            _pageState2.default.setIsWatching(data.isWatching);
            isWatchingPromise.resolve();
        });

        if (options.seenNeedsWork !== true) {
            initReviewerStatusFeatureDiscovery();
        }

        (0, _jquery2.default)(document).on('click', 'button.needs-work', function () {
            _chaperone2.default.registerFeature('needs-work-click', [{
                id: 'needs-work-click',
                selector: 'button.needs-work',
                alignment: 'bottom center',
                title: _aui2.default.I18n.getText('bitbucket.web.pullrequest.reviewer.status.feature.discovery.needs.work.click.title'),
                content: bitbucket.internal.feature.pullRequest.feature.discovery.reviewerStatusClick(),
                close: {
                    text: _aui2.default.I18n.getText('bitbucket.web.got.it')
                },
                moreInfo: {
                    href: bitbucket_help_url('bitbucket.help.pull.request'),
                    text: _aui2.default.I18n.getText('bitbucket.web.pullrequest.learn.more'),
                    extraAttributes: {
                        target: '_blank'
                    }
                },
                width: 340,
                once: true
            }]);
        });

        _events4.default.on('bitbucket.internal.feature.pullRequest.self.added', function () {
            _pageState2.default.getPullRequest().getReviewers().add(new _participant2.default({
                user: _pageState2.default.getCurrentUser(),
                role: _enums2.default.ParticipantRole.REVIEWER,
                status: _enums2.default.ApprovalStatus.UNAPPROVED
            }));
        });

        _events4.default.on('bitbucket.internal.feature.pullRequest.self.removed', function () {
            var reviewers = _pageState2.default.getPullRequest().getReviewers();
            reviewers.remove(reviewers.findByUser(_pageState2.default.getCurrentUser()));
        });

        var _resetLatestReviewedCommit = function _resetLatestReviewedCommit(data) {
            if (data.newStatus === _enums2.default.ApprovalStatus.NEEDS_WORK || data.newStatus === _enums2.default.ApprovalStatus.APPROVED) {
                _requestChange2.default.reset();
                var pullRequest = _pageState2.default.getPullRequest();
                var currentUser = _pageState2.default.getCurrentUser();
                pullRequest.getReviewers().findByUser(currentUser).setLastReviewedCommit(pullRequest.getFromRef().getLatestCommit());
            }
        };

        _events4.default.chain().on('bitbucket.internal.widget.approve-button.added', _resetLatestReviewedCommit).on('bitbucket.internal.widget.approve-button.removed', _resetLatestReviewedCommit).on('bitbucket.internal.widget.needs-work.added', _resetLatestReviewedCommit);

        _pullRequestAnalytics2.default.init();

        bindKeyboardShortcuts();

        initTabs();

        initLoader(options.contentSelector, isWatchingPromise, store, options.commitJSON);

        _notifications2.default.showFlashes();
    }

    exports.default = {
        registerHandler: registerHandler,
        onReady: onReady
    };
    module.exports = exports['default'];
});