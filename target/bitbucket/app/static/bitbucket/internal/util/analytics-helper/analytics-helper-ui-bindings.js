define('bitbucket/internal/util/analytics-helper/analytics-helper-ui-bindings', ['jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/util/state', 'bitbucket/internal/util/analytics-helper/analytics-helper', 'bitbucket/internal/util/events', 'bitbucket/internal/util/html'], function (_jquery, _lodash, _navbuilder, _state, _analyticsHelper, _events, _html) {
    'use strict';

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _analyticsHelper2 = babelHelpers.interopRequireDefault(_analyticsHelper);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _html2 = babelHelpers.interopRequireDefault(_html);

    /**
     * The default context selector for child elements in a context.
     * @type {string}
     */
    var DEFAULT_CONTEXT_SELECTOR = 'a';
    /**
     * The default event to monitor on context containers
     * @type {string}
     */
    /**
     * The Analytics Helper UI Bindings module will bind several UI events and broadcast generic Events for them
     * These Events can then be listened to by the Analytics Helper to broadcast analytics events
     * and attach attributes to those events
     */
    var DEFAULT_CONTEXT_EVENT = 'click';

    /**
     * A UI event context.
     * One of eventName or eventMap should be used. If eventName is present, it will be used to fire the UI event
     * if eventMap is present (and only if eventName isn't simultaneously present) it will be used.
     *
     * @typedef {Object} UIContext
     * @property {jQuery} container - the jQuery object to scope event handlers to
     * @property {string} selector - a selector to use as a scope for event handlers bound on the `container`.
     *                               Set this to the same value as the container for events that need to be
     *                               directly monitored on the container.
     * @property {?UIEventMap} eventMap
     * @property {?string} - eventName - The event name to trigger as soon as the UI event fires
     * @property {?string} - event - The event to monitor on the container
     */

    /**
     * A generic event context
     * Generic event contexts will monitor non-ui based events (i.e. things triggered by events.trigger())
     *
     * @typedef {Object} GenericContext
     * @property {string} on - the event name
     * @property {Function<UIEvent>} callback - the callback that will return the event object
     */

    /**
     * This contains a set of properties that contain either {string}s or {UIEventCallback}s
     * Property names are CSS Selectors.
     *
     * @typedef {Object} UIEventMap
     * @property {string|UIEventCallback} *
     */

    /**
     * @callback UIEventCallback
     * @param {Event} e
     * @returns {string|UIEvent}
     */

    /**
     * @typedef {Object} UIEvent
     * @property {string} eventName
     * @property {Object} data
     */

    function init() {
        // the document should ideally only be used when instrumenting things that are
        // not present in the DOM until a user initiated event happens.
        var $document = (0, _jquery2.default)(document);
        var $header = (0, _jquery2.default)('#header');
        var $appSwitcher = (0, _jquery2.default)('#app-switcher');
        var $helpMenu = (0, _jquery2.default)(_html2.default.sanitizeId('#com.atlassian.bitbucket.server.bitbucket-server-web-fragments-help-menu'));
        var $profileMenu = (0, _jquery2.default)('#user-dropdown-menu');
        var $inboxLink = (0, _jquery2.default)('#inbox-trigger');
        var $inboxMenu = (0, _jquery2.default)('.inbox-menu');

        /**
         *
         * @type {Array<UIContext>}
         */
        var UIContexts = [
        // HEADER LINKS
        {
            container: $header,
            eventMap: {
                '#logo a': 'nav.logo.clicked',
                '.projects-link': 'nav.projects.clicked',
                '.admin-link': 'nav.globalsettings.clicked'
            }
        },
        // APPSWITCHER
        {
            container: $appSwitcher,
            // Use the container as the selector when watching an event on the container.
            selector: $appSwitcher,
            event: 'aui-dropdown2-show',
            eventName: 'applinks.menu.opened'
        }, {
            container: $appSwitcher,
            eventName: 'applinks.menu.clicked'
        },
        // HELP MENU
        {
            container: $helpMenu,
            selector: $helpMenu,
            event: 'aui-dropdown2-show',
            eventName: 'nav.help.opened'
        }, {
            container: $helpMenu,
            eventMap: {
                a: function a() {
                    return {
                        eventName: 'nav.help.item.clicked',
                        data: {
                            webItemKey: (0, _jquery2.default)(this).attr('data-web-item-key')
                        }
                    };
                }
            }
        },
        // PROFILE MENU
        {
            container: $profileMenu,
            selector: $profileMenu,
            event: 'aui-dropdown2-show',
            eventName: 'nav.profile.opened'
        }, {
            container: $profileMenu,
            eventMap: {
                a: function a() {
                    return {
                        eventName: 'nav.profile.item.clicked',
                        data: {
                            webItemKey: (0, _jquery2.default)(this).attr('data-web-item-key')
                        }
                    };
                }
            }
        },
        // PR INBOX
        {
            container: $inboxMenu,
            selector: $inboxLink,
            eventMap: {
                a: function a() {
                    return {
                        eventName: 'nav.inbox.opened',
                        data: {
                            count: (0, _jquery2.default)(this).find('.aui-badge').text()
                        }
                    };
                }
            }
        }, {
            container: $document,
            selector: '#inline-dialog-inbox-pull-requests-content a',
            eventMap: {
                '.menu-item a': function menuItemA() {
                    var href = (0, _jquery2.default)(this).attr('href');
                    var needsWorkCount = (0, _jquery2.default)(href).find('tr.prNeedsWork').length;
                    return {
                        eventName: 'nav.inbox.tab.selected',
                        data: {
                            name: href === '#inbox-pull-request-reviewer' ? 'reviewing' : 'created',
                            reviewed: needsWorkCount,
                            unreviewed: (0, _jquery2.default)(href).find('tr').length - needsWorkCount
                        }
                    };
                },
                'a.pull-request-title': function aPullRequestTitle() {
                    var $el = (0, _jquery2.default)(this);
                    var isAuthor = $el.closest('.tabs-pane').is('#inbox-pull-request-created');
                    return {
                        eventName: 'nav.inbox.item.clicked',
                        data: {
                            isAuthor: isAuthor,
                            status: isAuthor ? null : $el.closest('tr').is('.prNeedsWork') ? 'NEEDS_WORK' : 'UNAPPROVED'
                        }
                    };
                }
            }
        },
        // FOOTER
        {
            container: (0, _jquery2.default)('#footer ul'),
            eventMap: {
                a: function a() {
                    return {
                        eventName: 'nav.footer.item.clicked',
                        data: {
                            linkId: (0, _jquery2.default)(this).closest('li').attr('data-key')
                        }
                    };
                }
            }
        }];

        // "Generic" contexts are non-ui specific events. Generally used for watching 'bitbucket.*' events
        // and following up with a callback.
        var genericContexts = [
        // Diff View
        {
            on: 'bitbucket.internal.feature.fileContent.diffViewDataLoaded',
            callback: function callback() {
                // On the PullRequest overview page bail out early to avoid triggering an analytics
                // event for every diff with a comment.
                if (_state2.default.getPullRequest() && window.location.pathname === _navbuilder2.default.currentPullRequest().overview().build()) {
                    return;
                }

                // Get the source of the diff view
                var source;
                if (_state2.default.getPullRequest()) {
                    source = 'pullrequest';
                } else if (_state2.default.getCommit()) {
                    source = 'commit';
                } else if (_state2.default.getRef()) {
                    source = 'source-view';
                } else {
                    source = 'create-pullrequest';
                    if (window.location.pathname === _navbuilder2.default.currentRepo().compare().diff().build()) {
                        source = 'compare-branch';
                    }
                }
                // pass null as second param to prevent the require from being extracted to the top level AMD module by the babel transform
                var dvOptions = require('bitbucket/internal/feature/file-content/diff-view-options', null).getOptions();
                return {
                    eventName: 'diff-view.viewed',
                    data: {
                        ignoreWhitespace: dvOptions.ignoreWhitespace,
                        showWhitespaceCharacters: dvOptions.showWhitespaceCharacters,
                        hideComments: dvOptions.hideComments,
                        hideEdiff: dvOptions.hideEdiff,
                        diffType: dvOptions.diffType,
                        source: source
                    }
                };
            }
        }, {
            on: 'bitbucket.internal.feature.branch-creation.branchCreated',
            callback: function callback() {
                return {
                    eventName: 'branch.created'
                };
            }
        }, {
            on: 'bitbucket.internal.page.branches.revisionRefRemoved',
            callback: function callback() {
                return {
                    eventName: 'branch.deleted'
                };
            }
        }];

        UIContexts.forEach(instrumentUIContext);
        genericContexts.forEach(instrumentGenericContext);
    }

    /**
     * Parse the context objects and set up event listeners that execute callbacks and trigger events.
     *
     * @param {GenericContext} context
     */
    function instrumentGenericContext(context) {
        if (context.on) {
            _events2.default.on(context.on, function (data) {
                triggerUIEvent(context.callback.call(this, data));
            });
        }
    }

    /**
     * Parse the context objects and set up UI event listeners that execute callbacks and trigger events.
     *
     * @param {UIContext} context
     */
    function instrumentUIContext(context) {
        context.container.on(context.event || DEFAULT_CONTEXT_EVENT, context.selector || DEFAULT_CONTEXT_SELECTOR, function (e) {
            if (context.eventName) {
                triggerUIEvent(context.eventName);
                return;
            }

            var $el = (0, _jquery2.default)(this);
            var self = this;

            /**
             * @param {string|UIEventCallback} eventName - can be one of:
             *                                - a string (the event name)
             *                                - a function (which when called will return either a string with
             *                                  the event name or an {UIEvent}
             *
             * @param {string} selector - a valid CSS selector
             */
            _lodash2.default.forEach(context.eventMap, function (eventName, selector) {
                var event;
                if ($el.is(selector)) {
                    event = _lodash2.default.isFunction(eventName) ? eventName.call(self, e) : eventName;
                    if (event) {
                        triggerUIEvent(event);
                    }
                }
            });
        });
    }

    /**
     * Trigger a UI event.
     * @param {string|UIEvent} event
     */
    function triggerUIEvent(event) {
        // bail out if we have a non-event
        if (!event) {
            return;
        }
        if (_lodash2.default.isString(event)) {
            event = { eventName: event };
        }
        _events2.default.trigger(_analyticsHelper2.default.prefixEventName(event.eventName), null, event.data);
    }

    // Self initialise when the DOM is ready
    (0, _jquery2.default)(document).ready(init);
});