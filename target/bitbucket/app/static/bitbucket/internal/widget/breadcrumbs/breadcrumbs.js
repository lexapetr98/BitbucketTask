define('bitbucket/internal/widget/breadcrumbs/breadcrumbs', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _lodash, _navbuilder, _pageState, _domEvent, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    function Breadcrumbs(containerSelector) {
        this.$container = (0, _jquery2.default)(containerSelector);
        var self = this;
        this.$container.on('click', 'a', function (e) {
            if (_domEvent2.default.openInSameTab(e)) {
                _events2.default.trigger('bitbucket.internal.widget.breadcrumbs.urlChanged', self, (0, _jquery2.default)(this).attr('href'));
                e.preventDefault();
            }
        });
    }

    var browseNavBuilder = _navbuilder2.default.currentRepo().browse();
    var browsePath = function browsePath(pathComponents, revisionReference) {
        if (!revisionReference.isDefault()) {
            return browseNavBuilder.path(pathComponents).at(revisionReference.getId()).build();
        }
        return browseNavBuilder.path(pathComponents).build();
    };

    function createBreadcrumbData(revisionReference, pathComponents) {
        var pathSeed = [];
        var breadcrumbParts = _lodash2.default.map(pathComponents, function (part) {
            pathSeed = pathSeed.slice(0); //shallow copy
            pathSeed.push(part);
            return {
                text: part,
                url: browsePath(pathSeed, revisionReference)
            };
        });

        //prepend repository link
        breadcrumbParts.unshift({
            text: _pageState2.default.getRepository().getName(),
            url: browsePath([], revisionReference)
        });

        return breadcrumbParts;
    }

    Breadcrumbs.prototype.update = function (revisionReference, path, isDirectory) {
        this.$container.empty().append(bitbucket.internal.widget.breadcrumbs.crumbs({
            pathComponents: createBreadcrumbData(revisionReference, path.getComponents()),
            trailingSlash: isDirectory
        }));
    };

    exports.default = Breadcrumbs;
    module.exports = exports['default'];
});