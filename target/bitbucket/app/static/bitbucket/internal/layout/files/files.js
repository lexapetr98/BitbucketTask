define('bitbucket/internal/layout/files/files', ['module', 'exports', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/path', 'bitbucket/internal/model/revision-reference', 'bitbucket/internal/util/events', 'bitbucket/internal/widget/breadcrumbs/breadcrumbs'], function (module, exports, _pageState, _path, _revisionReference, _events, _breadcrumbs) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _path2 = babelHelpers.interopRequireDefault(_path);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _breadcrumbs2 = babelHelpers.interopRequireDefault(_breadcrumbs);

    function onReady(pathComponents, atRevision, breadcrumbsSelector, isDirectory) {
        _pageState2.default.setFilePath(new _path2.default(pathComponents));

        var currentRevisionRef = new _revisionReference2.default(atRevision);
        var breadcrumbs = new _breadcrumbs2.default(breadcrumbsSelector);

        _events2.default.on('bitbucket.internal.widget.breadcrumbs.urlChanged', function (url) {
            if (this === breadcrumbs) {
                _events2.default.trigger('bitbucket.internal.layout.files.urlChanged', this, url);
            }
        });

        /* React to page changes */
        _events2.default.on('bitbucket.internal.page.*.revisionRefChanged', function (revisionReference) {
            currentRevisionRef = _revisionReference2.default.hydrateDeprecated(revisionReference);
            breadcrumbs.update(currentRevisionRef, new _path2.default(_pageState2.default.getFilePath()), isDirectory);
        });

        _events2.default.on('bitbucket.internal.page.*.pathChanged', function (path) {
            path = new _path2.default(path);
            _pageState2.default.setFilePath(path);
            breadcrumbs.update(currentRevisionRef, path, isDirectory);
            // For now, isDirectory won't change when path changes cause we don't have push-state
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});