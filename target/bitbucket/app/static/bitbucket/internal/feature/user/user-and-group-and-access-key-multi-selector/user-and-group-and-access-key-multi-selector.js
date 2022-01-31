define('bitbucket/internal/feature/user/user-and-group-and-access-key-multi-selector/user-and-group-and-access-key-multi-selector', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/internal/feature/user/user-and-group-multi-selector/user-and-group-multi-selector', '../access-key-multi-selector/access-key-multi-selector'], function (module, exports, _aui, _jquery, _userAndGroupMultiSelector, _accessKeyMultiSelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _userAndGroupMultiSelector2 = babelHelpers.interopRequireDefault(_userAndGroupMultiSelector);

    var _accessKeyMultiSelector2 = babelHelpers.interopRequireDefault(_accessKeyMultiSelector);

    var typeToSelectionTemplate = {
        accessKey: _accessKeyMultiSelector2.default.defaults.selectionTemplate
    };

    var typeToResultTemplate = {
        accessKey: _accessKeyMultiSelector2.default.defaults.resultTemplate
    };

    var typeToGenerateId = {
        accessKey: _accessKeyMultiSelector2.default.defaults.generateId
    };

    var typeToGenerateText = {
        accessKey: _accessKeyMultiSelector2.default.defaults.generateText
    };

    var UserAndGroupAndAccessKeyMultiSelector = function (_UserAndGroupMultiSel) {
        babelHelpers.inherits(UserAndGroupAndAccessKeyMultiSelector, _UserAndGroupMultiSel);

        function UserAndGroupAndAccessKeyMultiSelector($field, options) {
            babelHelpers.classCallCheck(this, UserAndGroupAndAccessKeyMultiSelector);
            return babelHelpers.possibleConstructorReturn(this, (UserAndGroupAndAccessKeyMultiSelector.__proto__ || Object.getPrototypeOf(UserAndGroupAndAccessKeyMultiSelector)).call(this, $field, _jquery2.default.extend(true, UserAndGroupAndAccessKeyMultiSelector.defaults, options)));
        }

        return UserAndGroupAndAccessKeyMultiSelector;
    }(_userAndGroupMultiSelector2.default);

    UserAndGroupAndAccessKeyMultiSelector.defaults = {
        initialItems: {
            accessKey: []
        },
        excludedItems: {
            accessKey: []
        },
        urls: {
            accessKey: _accessKeyMultiSelector2.default.defaults.url
        },
        urlParams: {
            accessKey: _accessKeyMultiSelector2.default.defaults.urlParams
        },
        hasAvatar: true,
        typeToGenerateId: typeToGenerateId,
        typeToGenerateText: typeToGenerateText,
        typeToResultTemplate: typeToResultTemplate,
        typeToSelectionTemplate: typeToSelectionTemplate,
        inputTooShortTemplate: function inputTooShortTemplate() {
            return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.user.and.group.and.access.key.multi.selector.help'));
        },
        noMatchesTemplate: function noMatchesTemplate() {
            return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.user.and.group.and.access.key.multi.selector.no.match'));
        }
    };
    exports.default = UserAndGroupAndAccessKeyMultiSelector;
    module.exports = exports['default'];
});