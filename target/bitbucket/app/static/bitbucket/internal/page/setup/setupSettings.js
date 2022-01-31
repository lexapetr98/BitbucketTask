define('bitbucket/internal/page/setup/setupSettings', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/internal/util/client-storage', 'bitbucket/internal/widget/setup-tracking'], function (module, exports, _aui, _jquery, _clientStorage, _setupTracking) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var _setupTracking2 = babelHelpers.interopRequireDefault(_setupTracking);

    function onReady() {
        var $form = (0, _jquery2.default)('#settings');

        var setupDataKey = _clientStorage2.default.buildKey([_aui2.default.contextPath(), 'setup']);
        var setupData = _clientStorage2.default.getSessionItem(setupDataKey);

        if (setupData) {
            setupData.applicationTitle && (0, _jquery2.default)('#applicationTitle').val(setupData.applicationTitle);
            setupData.baseUrl && (0, _jquery2.default)('#baseUrl').val(setupData.baseUrl);
        }

        (0, _jquery2.default)('#has-key-radio').attr('autocomplete', 'off');
        (0, _jquery2.default)('#no-key-radio').attr('autocomplete', 'off');

        $form.on('click', 'input[type="radio"]', function (e) {
            var $el = (0, _jquery2.default)(e.currentTarget);
            var elId = $el.attr('id');
            (0, _jquery2.default)('.license-section').hide();

            if (elId === 'no-key-radio') {
                (0, _jquery2.default)('#no-key').show();
                _setupTracking2.default.track('setup-settings-evaluate');
            }

            if (elId === 'has-key-radio') {
                (0, _jquery2.default)('#has-key').show();
                (0, _jquery2.default)('#license').focus();
                _setupTracking2.default.track('setup-settings-has-key');
            }
        });

        $form.submit(function () {
            _clientStorage2.default.setSessionItem(setupDataKey, {
                applicationTitle: (0, _jquery2.default)('#applicationTitle').val(),
                baseUrl: (0, _jquery2.default)('#baseUrl').val()
            });

            (0, _jquery2.default)('#licenseHidden').val((0, _jquery2.default)('#license').val());

            (0, _jquery2.default)('.button-spinner').show().spin();
            (0, _jquery2.default)('.next-text').show().text(_aui2.default.I18n.getText('bitbucket.web.setup.settings.license.import', bitbucket.internal.util.productName()));
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});