define('bitbucket/internal/page/repository/no-default-branch/no-default-branch', ['module', 'exports', 'bitbucket/util/navbuilder', 'bitbucket/internal/util/events'], function (module, exports, _navbuilder, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    function onReady() {
        _events2.default.on('bitbucket.internal.feature.repository.revisionReferenceSelector.revisionRefChanged', function (revisionReference) {
            var uri = _navbuilder2.default.parse(location.href);
            uri.addQueryParam('at', revisionReference.getId());
            location.href = uri.toString();
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});