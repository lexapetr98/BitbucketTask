define('bitbucket/internal/page/branches/branches-page-analytics', ['module', 'exports', 'jquery', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var CONTEXT = 'list';

    function branchActionsAnalytics(data) {
        if (data.context === CONTEXT) {
            _events2.default.trigger('bitbucket.internal.ui.branch-list.actions.item.clicked', null, {
                webItemKey: data.webItemKey
            });
        }
    }

    function bindAnalyticsEvents() {
        (0, _jquery2.default)(document).on('click', '.branch-list-action-dropdown a', function (e) {
            branchActionsAnalytics({
                context: CONTEXT,
                webItemKey: (0, _jquery2.default)(e.target).attr('data-web-item-key')
            });
        }).on('aui-dropdown2-show', '.branch-list-action-dropdown', function (e) {
            _events2.default.trigger('bitbucket.internal.ui.branch-list.actions.opened');
        });

        _events2.default.on('bitbucket.internal.feature.branch-copy.branchNameCopied', branchActionsAnalytics);
    }

    exports.default = {
        bindAnalyticsEvents: bindAnalyticsEvents,
        CONTEXT: CONTEXT
    };
    module.exports = exports['default'];
});