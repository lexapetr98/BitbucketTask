define('bitbucket/internal/page/project/permissions/project-permissions', ['module', 'exports', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/permission/permission-table/permission-table', 'bitbucket/internal/page/project/permissions/project-permissions-model', 'bitbucket/internal/widget/submit-spinner/submit-spinner'], function (module, exports, _jquery, _navbuilder, _permissionTable, _projectPermissionsModel, _submitSpinner) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _permissionTable2 = babelHelpers.interopRequireDefault(_permissionTable);

    var _projectPermissionsModel2 = babelHelpers.interopRequireDefault(_projectPermissionsModel);

    var _submitSpinner2 = babelHelpers.interopRequireDefault(_submitSpinner);

    function onReady(permissions) {
        var licensedUserNoAccessRadio = getLicensedUserPermsRadios('none');
        var publicAccessCheckbox = (0, _jquery2.default)('#public-access-allowed');
        var publicAccessSpinner;
        var currentPublicAccessXHR;

        var projectPermissions = new _projectPermissionsModel2.default({
            grantedDefaultPermission: (0, _jquery2.default)('#licensed-users-permissions').attr('data-granted-permission'),
            publicAccess: !!publicAccessCheckbox.prop('checked') // If checkbox is not present, default to false
        });

        function getLicensedUserPermsRadios(value) {
            var selector = 'input:radio[name="licensed-users-permissions"]';
            if (value) {
                selector += '[value="' + value + '"]';
            }
            return (0, _jquery2.default)(selector);
        }

        projectPermissions.on('change:grantedDefaultPermission', function (model) {
            getLicensedUserPermsRadios(model.getGrantedDefaultPermission()).prop('checked', true);
        });

        projectPermissions.on('change:publicAccess', function (model) {
            getLicensedUserPermsRadios(model.getEffectiveDefaultPermission()).prop('checked', true);
            licensedUserNoAccessRadio.prop('disabled', model.getPublicAccess());
            publicAccessCheckbox.prop('checked', model.getPublicAccess());
        });

        /* event handlers */
        getLicensedUserPermsRadios().each(function () {
            var spinner;
            var currentXHR;
            (0, _jquery2.default)(this).click(function () {
                if (!spinner) {
                    spinner = new _submitSpinner2.default((0, _jquery2.default)(this).next('label'));
                }
                if (currentXHR) {
                    currentXHR.abort();
                }
                spinner.show();
                var selectedValue = getLicensedUserPermsRadios().filter(':checked').val();
                currentXHR = projectPermissions.saveDefaultPermission(selectedValue);
                currentXHR.always(function () {
                    spinner.hide();
                    currentXHR = null;
                });
            });
        });

        publicAccessCheckbox.click(function () {
            if (!publicAccessSpinner) {
                publicAccessSpinner = new _submitSpinner2.default((0, _jquery2.default)(this).next('label'));
            }
            if (currentPublicAccessXHR) {
                currentPublicAccessXHR.abort();
            }
            publicAccessSpinner.show();
            currentPublicAccessXHR = projectPermissions.savePublicAccess(this.checked);
            currentPublicAccessXHR.always(function () {
                publicAccessSpinner.hide();
                currentPublicAccessXHR = null;
            });
        });

        licensedUserNoAccessRadio.next('label').tooltip({
            gravity: 'sw',
            title: function title() {
                return projectPermissions.getPublicAccess() ? licensedUserNoAccessRadio.parent().attr('data-disabled-title') : '';
            }
        });

        /* permission table*/
        var permControls = _permissionTable2.default.initialise(_navbuilder2.default.currentProject().permissions(), permissions, 'PROJECT_ADMIN' //If the user can see this page, then the UI should act like they have project admin permissions
        );
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});