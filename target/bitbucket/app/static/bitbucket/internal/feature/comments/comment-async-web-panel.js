define('bitbucket/internal/feature/comments/comment-async-web-panel', ['module', 'exports', 'jquery', 'bitbucket/util/events', 'bitbucket/internal/util/promise'], function (module, exports, _jquery, _events, _promise) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    // since comments are outside of the DOM when not in view,
    // we need to search each specific comment container's children, not just the document.
    var commentSearchScope = [document.documentElement];

    // reset the comment containers array when a new context requested (this happens when switching
    // tabs and files in the PR) to avoid comment containers from piling up.
    _events2.default.on('bitbucket.internal.page.pull-request.view.contextRequested', function () {
        commentSearchScope = [document.documentElement];
    });

    _events2.default.on('bitbucket.internal.feature.comments.commentContainerAdded', function ($container) {
        commentSearchScope.push($container[0]);
    });

    var webPanelId = 0;

    /**
     *
     * @param {Function} callback
     * @returns {string}
     */
    function getWebPanelEl(callback) {
        webPanelId++;

        var selector = '#comment-async-web-panel-' + webPanelId;

        _promise2.default.waitFor({
            predicate: function predicate() {
                var $el = (0, _jquery2.default)(selector, commentSearchScope);
                return $el.length ? $el : false;
            },
            name: 'Async web panel ' + webPanelId,
            interval: 50
        }).then(callback);

        return bitbucket.internal.feature.commentAsyncWebPanelPlaceholder({
            webPanelId: webPanelId
        });
    }

    exports.default = {
        getWebPanelEl: getWebPanelEl
    };
    module.exports = exports['default'];
});