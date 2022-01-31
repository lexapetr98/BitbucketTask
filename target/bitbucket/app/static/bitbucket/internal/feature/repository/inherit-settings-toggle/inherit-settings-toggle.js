define('bitbucket/internal/feature/repository/inherit-settings-toggle/inherit-settings-toggle', ['exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/bbui/widget/widget', 'bitbucket/internal/widget/are-you-sure/are-you-sure'], function (exports, _aui, _jquery, _lodash, _widget, _areYouSure) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.InheritanceType = undefined;

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _widget2 = babelHelpers.interopRequireDefault(_widget);

    var _areYouSure2 = babelHelpers.interopRequireDefault(_areYouSure);

    var InheritSettingsToggle = function (_Widget) {
        babelHelpers.inherits(InheritSettingsToggle, _Widget);

        /**
         * @param {jQuery|HTMLElement} container
         * @param {boolean|function} confirmOnInherit
         * @returns {InheritSettingsToggle}
         */
        function InheritSettingsToggle(container) {
            var confirmOnInherit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
            babelHelpers.classCallCheck(this, InheritSettingsToggle);

            var _this = babelHelpers.possibleConstructorReturn(this, (InheritSettingsToggle.__proto__ || Object.getPrototypeOf(InheritSettingsToggle)).call(this));

            (0, _jquery2.default)(container).on('change', 'input[name=inherit-settings-selection]', function (_ref) {
                var target = _ref.target;

                if (target.id === 'inherit-settings-selection-inherit' && ((0, _lodash.isFunction)(confirmOnInherit) ? confirmOnInherit() : confirmOnInherit)) {
                    target.checked = false;
                    document.getElementById('inherit-settings-selection-custom').checked = true;

                    (0, _areYouSure2.default)({
                        title: _aui.I18n.getText('bitbucket.web.repository.settings.inheritedsettingstoggle.warning.title'),
                        bodyContent: _aui.I18n.getText('bitbucket.web.repository.settings.inheritedsettingstoggle.warning.body'),
                        confirmButtonText: _aui.I18n.getText('bitbucket.web.button.remove')
                    }).then(function () {
                        target.checked = true;
                        _this.trigger('change', target.value);
                    });
                } else {
                    _this.trigger('change', target.value);
                }
            });
            return _this;
        }

        return InheritSettingsToggle;
    }(_widget2.default);

    var InheritanceType = exports.InheritanceType = {
        CUSTOM: 'CUSTOM',
        INHERIT: 'INHERIT'
    };

    exports.default = InheritSettingsToggle;
});