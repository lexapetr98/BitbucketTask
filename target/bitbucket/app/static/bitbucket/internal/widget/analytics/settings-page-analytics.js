define('bitbucket/internal/widget/analytics/settings-page-analytics', ['module', 'exports', 'jquery', 'bitbucket/util/state', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _state, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    function init() {
        var $settingsNav = (0, _jquery2.default)('.content-body > .aui-page-panel-inner > .aui-page-panel-nav');
        $settingsNav.on('click', 'li > a[data-web-item-key]', function (e) {
            var eventSpace = _state2.default.getRepository() != null ? 'repository' : 'project';
            _events2.default.trigger('bitbucket.internal.ui.' + eventSpace + '.settings.sidebar.clicked', null, {
                webItemKey: (0, _jquery2.default)(e.target).attr('data-web-item-key')
            });
        });
    }

    exports.default = {
        init: init
    };
    module.exports = exports['default'];
});