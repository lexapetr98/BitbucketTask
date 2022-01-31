define('bitbucket/internal/page/setup/setupJiraIntegration', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function onReady() {
        // make the 'Skip' link set a hidden 'skip' field (used in SetupController) then post the form
        (0, _jquery2.default)('#submitSkip').click(function (e) {
            e.preventDefault();
            var form = (0, _jquery2.default)(this).parents('form.aui');
            form.find('#skip').val('true');
            form.submit();
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});