define('bitbucket/internal/util/analytics-helper/analytics-helper', ['module', 'exports', 'lodash', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/events', 'bitbucket/internal/util/text'], function (module, exports, _lodash, _analytics, _events, _text) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _text2 = babelHelpers.interopRequireDefault(_text);

    /**
     * UI Events will be prefixed with this
     * @type {string}
     */
    /**
     * The analytics helper will watch several UI events and trigger appropriate Analytics events for them.
     * If necessary for the event, this module will attach appropriate attributes.
     */
    var EVENT_PREFIX = 'bitbucket.internal.ui.';

    /**
     * The global attributes map will be applied to all analytics events and ensures that certain attributes
     * are always mapped to a given key name (to keep the analytics events list DRY).
     * e.g.
     *
     * "pullRequestId" will always be mapped to "pullRequest.id" for all events that carry that attribute.
     *
     * Note that any attributes in this list can still be overridden in the attributesMap of a {@type MappedEvent}
     *
     * e.g. if the following {@type MappedEvent} is added to the UI Events list, "pullRequestId" will be mapped to "pull-request-id"
     *
     * { name: "some.event.name", attributesMap: { "pullRequestId": "pull-request-id" }
     *
     * @type {{pullRequestId: string}}
     */
    var GLOBAL_ATTRIBUTES_MAP = {
        pullRequestId: 'pullRequest.id'
    };
    var destroyables = [];

    /**
     * Describes a mapped event for watching. The event name will be watched and if data is passed along
     * to the event then the attribute map will be used to rename attributes from their name (the map's key)
     * to the corresponding value.
     *
     * @typedef {Object} MappedEvent
     * @property {string} name - the event name
     * @property {Object<string,string>} attributesMap - the attribute map.
     *
     */

    function init() {
        /**
         * Simple events can simply be an event name. If an event only consists of the name, any attributes on that
         * event will be converted to dot.case and passed along to the analytics event.
         *
         * Complex analytics events map some of their UI event data attributes to analytics friendly event attributes.
         * Note that we do this primarily to be explicit about which attributes make it in to the analytics events.
         * The shape of the objects is described as {@linkcode MappedEvent}
         *
         *
         * Note that in this case all attributes that are to be passed along to the event will need to be specified.
         */
        var uiEvents = [
        // Top Level Nav
        'nav.logo.clicked', 'nav.projects.clicked', 'alerts.dialog.opened', 'applinks.menu.opened', 'applinks.menu.clicked', 'branch-selector.actions.item.clicked', 'branch-selector.actions.opened', 'branch-list.actions.item.clicked', 'branch-list.actions.opened', 'branch.created', 'branch.deleted',
        // Dashboard
        'dashboard.pullrequest-list.created.item.clicked', 'dashboard.pullrequest-list.reviewing.item.clicked', 'dashboard.pullrequest-list.closed.item.clicked', 'dashboard.repository-list.project.clicked', 'dashboard.repository-list.repository.clicked', 'dashboard.repository-list.search.results.loaded',
        // Mirroring
        'mirroring.mirror.updated',
        // Navigation
        'nav.search.focused', 'nav.search.result.clicked', 'nav.repositories.opened', 'nav.repositories.public.clicked', 'nav.repositories.item.clicked', 'nav.help.opened', 'nav.help.item.clicked', 'nav.globalsettings.clicked', 'nav.profile.opened', 'nav.profile.item.clicked', 'nav.inbox.opened', 'nav.inbox.tab.selected', 'nav.inbox.item.clicked', 'nav.footer.item.clicked',
        // Pagination
        'nav.pagination',
        // Diff view
        'diff-view.viewed', 'diff-view.search.result.details',
        // Keyboard events
        'keyboard.shortcutClicked',
        // Project Create
        'project-create.change-avatar.clicked', 'project-create.submitted',
        // Pull Request List
        'pullRequestList.buildStatus.clicked', 'pullRequestList.createAction.clicked', 'pullRequestList.empty.create.clicked', 'pullRequestList.empty.help.clicked', 'pullRequestList.empty.viewOpen.clicked', 'pullRequestList.filteredBy.author', 'pullRequestList.filteredBy.reviewer', 'pullRequestList.filteredBy.state', 'pullRequestList.filteredBy.target', 'pullRequestList.row.clicked', 'pullRequestList.viewed',
        // Setting pages
        'project.settings.sidebar.clicked', 'repository.settings.sidebar.clicked',
        // Sidebar
        'sidebar.settings.clicked', 'sidebar.collapse.change', 'sidebar.actions-menu.item.clicked', 'sidebar.item.clicked',
        // Time Zones
        'time.zone.onboarding.changed', 'time.zone.onboarding.dismissed', 'time.zone.onboarding.shown'];

        watchEvents(uiEvents);
    }

    /**
     * Remove the 'bitbucket.internal.ui.' part of an event name to pass it along as an analytics event
     *
     * @param {string} eventName
     * @returns {string}
     */
    function analyticsEventName(eventName) {
        return eventName.replace(/^bitbucket\.internal\.ui\./, '');
    }

    /**
     * Take the values of a UI event's data and map them to an object with
     * analytics friendly attributes as per the provided map. If no map is provided, it will change all attribute names
     * in the provided data object to dot-separated event names. e.g.
     * { repositoryId: 1, projectId: 1 } => { repository.id: 1, project.id: 1 }
     *
     * @param {Object} data
     * @param {Object} [attributesMap]
     * @returns {?Object}
     */
    function analyticsAttributesFromData(data, attributesMap) {
        return _lodash2.default.transform(data, function (mappedData, value, key) {
            var attributeName;
            attributeName = _lodash2.default.has(attributesMap, key) ? attributesMap[key] : _text2.default.camelCaseToDotCase(key);
            mappedData[attributeName] = value;
        });
    }

    /**
     * Watch a list of events. If an event is a MappedEvent, its map will be passed along to the
     * {@linkcode analyticsAttributesFromData} method to extract and rename attributes.
     *
     * @param {Array<string|MappedEvent>} evts
     */
    function watchEvents(evts) {
        evts.forEach(function (event) {
            var attributesMap;
            var eventName = event;
            if (_lodash2.default.isObject(event)) {
                eventName = event.name;
                attributesMap = event.attributesMap;
            }
            attributesMap = _lodash2.default.merge({}, GLOBAL_ATTRIBUTES_MAP, attributesMap);
            destroyables.push(_events2.default.chain().on(prefixEventName(eventName), function (data) {
                _analytics2.default.add(analyticsEventName(eventName), analyticsAttributesFromData(data, attributesMap));
            }));
        });
    }

    /**
     * Prefix an event name with our EVENT_PREFIX
     *
     * @param {string} eventName
     * @returns {string}
     */
    function prefixEventName(eventName) {
        if (!_lodash2.default.startsWith(eventName, EVENT_PREFIX)) {
            eventName = EVENT_PREFIX + eventName;
        }
        return eventName;
    }

    function destroy() {
        _lodash2.default.invokeMap(destroyables, 'destroy');
    }

    exports.default = {
        init: init,
        destroy: destroy,
        watchEvents: watchEvents,
        prefixEventName: prefixEventName
    };
    module.exports = exports['default'];
});