define('bitbucket/internal/layout/branch/branch-layout-analytics', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _lodash, _navbuilder, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var CONTEXT = 'selector';

    function branchActionsAnalytics(data) {
        if (data.context !== CONTEXT) {
            return;
        }
        var pages = ['commits', 'browse', 'branches'];

        function onPage(pageName) {
            return _lodash2.default.startsWith(window.location.pathname, _navbuilder2.default.currentRepo()[pageName]().build());
        }

        var page = _lodash2.default.find(pages, onPage);

        _events2.default.trigger('bitbucket.internal.ui.branch-selector.actions.item.clicked', null, {
            webItemKey: data.webItemKey,
            source: page
        });
    }

    function initLayoutAnalytics($actionsMenu) {
        $actionsMenu.on('aui-dropdown2-show', function () {
            _events2.default.trigger('bitbucket.internal.ui.branch-selector.actions.opened');
        });

        $actionsMenu.on('click', 'a', function () {
            branchActionsAnalytics({
                context: CONTEXT,
                webItemKey: (0, _jquery2.default)(this).attr('data-web-item-key')
            });
        });

        _events2.default.on('bitbucket.internal.feature.branch-copy.branchNameCopied', branchActionsAnalytics);
    }

    exports.default = {
        initLayoutAnalytics: initLayoutAnalytics,
        CONTEXT: CONTEXT
    };
    module.exports = exports['default'];
});