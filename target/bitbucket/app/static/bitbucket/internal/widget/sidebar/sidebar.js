define('bitbucket/internal/widget/sidebar/sidebar', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/internal/util/client-storage', 'bitbucket/internal/util/events'], function (module, exports, _aui, _jquery, _clientStorage, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var IS_EXPANDED_KEY = 'sidebar_expanded';

    var sidebarSelector = '.aui-sidebar';
    var sidebar;

    function initSidebar() {
        sidebar = _aui2.default.sidebar(sidebarSelector);

        sidebar.on('collapse-end', function (e) {
            if (!e.isResponsive) {
                _clientStorage2.default.setItem(IS_EXPANDED_KEY, false);
            }
            _events2.default.trigger('bitbucket.internal.feature.sidebar.collapseEnd');
        });

        // On expand-start check if the sidebar's state has been manually set to collapsed,
        // if it has then don't invoke the responsive sidebar behaviour
        sidebar.on('expand-start', function (e) {
            if (e.isResponsive && _clientStorage2.default.getItem(IS_EXPANDED_KEY) === false) {
                e.preventDefault();
            }
        });

        sidebar.on('expand-end', function (e) {
            if (!e.isResponsive) {
                _clientStorage2.default.setItem(IS_EXPANDED_KEY, true);
            }
            _events2.default.trigger('bitbucket.internal.feature.sidebar.expandEnd');
        });

        initSidebarUIEvents();
        initSubmenuResizingAndOverscrollPrevention();
    }

    // this shouldn't be necessary after https://ecosystem.atlassian.net/browse/AUI-4396 is resolved
    function initSubmenuResizingAndOverscrollPrevention() {
        (0, _jquery2.default)('.aui-sidebar-submenu-dialog').attr('alignment', 'right middle').on('aui-show', function (e) {
            var $dialog = (0, _jquery2.default)(e.target);
            var windowHeight = (0, _jquery2.default)(window).height();

            if (!$dialog.data('height')) {
                $dialog.data('height', $dialog.height());
            }

            if ($dialog.data('height') >= windowHeight) {
                var padding = 50;
                var triggerPosition = (0, _jquery2.default)('.aui-sidebar-group[aria-controls=\'' + $dialog.attr('id') + '\']')[0].getBoundingClientRect().top;
                $dialog.css('max-height', (Math.min(windowHeight - triggerPosition, triggerPosition) - padding) * 2 + 'px');
            } else if ($dialog.data('height') >= $dialog.height()) {
                $dialog.css('max-height', '100vh');
            }
        }).on('mousewheel', function (e) {
            var delta = e.originalEvent.deltaY;
            var $dialogContent = (0, _jquery2.default)(e.target).closest('.aui-inline-dialog-contents');
            var maxScrollHeight = $dialogContent[0].scrollHeight - $dialogContent.outerHeight();
            if ($dialogContent.scrollTop() === maxScrollHeight && delta >= 0 || $dialogContent.scrollTop() === 0 && delta <= 0) {
                //If at the bottom scrolling down, or at the top scrolling up
                e.preventDefault();
            }
        });
    }

    function preloadSidebar() {
        var state = isCollapsed();
        (0, _jquery2.default)(document.body).toggleClass('aui-sidebar-collapsed', state);
        (0, _jquery2.default)(sidebarSelector).attr('aria-expanded', !state);
    }

    /**
     * Is the sidebar currently collapsed
     *
     * @returns {boolean}
     */
    function isCollapsed() {
        return !_clientStorage2.default.getItem(IS_EXPANDED_KEY);
    }

    /**
     * Initialise the sidebar UI events that will trigger bitbucket.internal.ui.* events
     */
    function initSidebarUIEvents() {
        // Click on any items in the actions menu
        sidebar.$el.find('.aui-sidebar-group-actions ul').on('click', '> li > a[data-web-item-key]', function () {
            _events2.default.trigger('bitbucket.internal.ui.sidebar.actions-menu.item.clicked', null, {
                isCollapsed: isCollapsed(),
                webItemId: (0, _jquery2.default)(this).attr('data-web-item-key')
            });
        });

        // Click on any navigation items
        sidebar.$el.find('.sidebar-navigation ul').on('click', '> li > a[data-web-item-key]', function () {
            var $el = (0, _jquery2.default)(this);
            var isCollapsed = !_clientStorage2.default.getItem(IS_EXPANDED_KEY);
            var listLevel = $el.parentsUntil('.aui-sidebar-group').filter('ul').length;

            _events2.default.trigger('bitbucket.internal.ui.sidebar.item.clicked', null, {
                webItemId: $el.attr('data-web-item-key'),
                isCollapsed: isCollapsed,
                level: listLevel
            });
        });

        // Click on the settings button
        sidebar.$el.find('.sidebar-settings-group').on('click', 'a', function () {
            _events2.default.trigger('bitbucket.internal.ui.sidebar.settings.clicked', null, {
                webItemId: (0, _jquery2.default)(this).attr('data-web-item-key')
            });
        });

        // Monitor the toggling of expand/collapse.
        // These are the same event handlers and selectors/filters used in aui-sidebar
        sidebar.$el.on('click', '.aui-sidebar-toggle', function (e) {
            triggerCollapseChange('button');
        });

        sidebar.$el.on('click', '.aui-sidebar-body', function (e) {
            if ((0, _jquery2.default)(e.target).is('.aui-sidebar-body')) {
                triggerCollapseChange('sidebar');
            }
        });

        _aui2.default.whenIType('[').execute(function () {
            triggerCollapseChange('keyboard-shortcut');
        });

        sidebar.on('expand-end collapse-end', function (e) {
            (0, _jquery2.default)('aui-inline-dialog').removeAttr('open');
            (0, _jquery2.default)('.actions-trigger.active').trigger('aui-button-invoke');
            (0, _jquery2.default)('.sidebar-actions-dialog').hide();
            if (e.isResponsive) {
                triggerCollapseChange('resize');
            }
        });
    }

    /**
     * Trigger a collapse state changed ui event
     *
     * @param {string} source
     */
    function triggerCollapseChange(source) {
        _events2.default.trigger('bitbucket.internal.ui.sidebar.collapse.change', null, {
            source: source,
            isCollapsed: isCollapsed(),
            windowWidth: window.innerWidth
        });
    }

    exports.default = {
        preload: preloadSidebar,
        onReady: initSidebar
    };
    module.exports = exports['default'];
});