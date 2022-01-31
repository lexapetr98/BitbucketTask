define('bitbucket/internal/page/repository/permissions/repository-permissions', ['module', 'exports', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/permission/permission-table/permission-table', 'bitbucket/internal/util/ajax', 'bitbucket/internal/widget/submit-spinner/submit-spinner'], function (module, exports, _jquery, _navbuilder, _permissionTable, _ajax, _submitSpinner) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _permissionTable2 = babelHelpers.interopRequireDefault(_permissionTable);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _submitSpinner2 = babelHelpers.interopRequireDefault(_submitSpinner);

    function onReady(permissions) {
        var publicAccessCheckbox = (0, _jquery2.default)('#public-access-allowed');
        var publicAccessSpinner;
        var currentPublicAccessXHR;

        function setPublicAccess(allow) {
            return _ajax2.default.rest({
                type: 'PUT',
                url: _navbuilder2.default.rest().currentRepo().build(),
                data: {
                    public: allow
                }
            });
        }

        publicAccessCheckbox.click(function () {
            var allow = this.checked;
            if (!publicAccessSpinner) {
                publicAccessSpinner = new _submitSpinner2.default((0, _jquery2.default)(this).next('label'));
            }
            if (currentPublicAccessXHR) {
                currentPublicAccessXHR.abort();
            }
            publicAccessSpinner.show();
            currentPublicAccessXHR = setPublicAccess(allow);
            currentPublicAccessXHR.fail(function () {
                publicAccessCheckbox.prop('checked', !allow);
            }).always(function () {
                publicAccessSpinner.hide();
                currentPublicAccessXHR = null;
            });
        });

        _permissionTable2.default.initialise(_navbuilder2.default.currentRepo().permissions(), permissions, 'REPO_ADMIN' //If the user can see this page, then the UI should act like they have project admin permissions
        );
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});