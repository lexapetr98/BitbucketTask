define('bitbucket/internal/page/admin/globalPermissions/globalPermissions', ['module', 'exports', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/permission/permission-table/permission-table'], function (module, exports, _navbuilder, _permissionTable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _permissionTable2 = babelHelpers.interopRequireDefault(_permissionTable);

    function onReady(permissions, currentUserHighestPerm) {
        _permissionTable2.default.initialise(_navbuilder2.default.admin().permissions(), permissions, currentUserHighestPerm);
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});