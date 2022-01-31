define('bitbucket/internal/feature/user/access-key-multi-selector/access-key-multi-selector', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/widget/searchable-multi-selector/searchable-multi-selector'], function (module, exports, _aui, _jquery, _navbuilder, _searchableMultiSelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _searchableMultiSelector2 = babelHelpers.interopRequireDefault(_searchableMultiSelector);

    var AccessKeyMultiSelector = function (_SearchableMultiSelec) {
        babelHelpers.inherits(AccessKeyMultiSelector, _SearchableMultiSelec);

        function AccessKeyMultiSelector($field, options) {
            babelHelpers.classCallCheck(this, AccessKeyMultiSelector);
            return babelHelpers.possibleConstructorReturn(this, (AccessKeyMultiSelector.__proto__ || Object.getPrototypeOf(AccessKeyMultiSelector)).call(this, $field, _jquery2.default.extend(true, AccessKeyMultiSelector.defaults, options)));
        }

        return AccessKeyMultiSelector;
    }(_searchableMultiSelector2.default);

    AccessKeyMultiSelector.defaults = {
        hasAvatar: true,
        url: function url() {
            return _navbuilder2.default.rest('keys', 'latest').currentRepo().addPathComponents('ssh').build();
        },
        selectionTemplate: function selectionTemplate(_ref) {
            var key = _ref.key;

            return bitbucket.internal.widget.accessKey({
                size: 'xsmall',
                label: key.label,
                text: key.text
            });
        },
        resultTemplate: function resultTemplate(_ref2) {
            var key = _ref2.key;

            return bitbucket.internal.widget.accessKeyWithText({
                size: 'small',
                label: key.label,
                text: key.text
            });
        },
        generateId: function generateId(_ref3) {
            var key = _ref3.key;
            return key.id;
        },
        generateText: function generateText(_ref4) {
            var key = _ref4.key;
            return key.label;
        },
        inputTooShortTemplate: function defaultInputTooShortTemplate() {
            return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.access.key.multi.selector.help'));
        },
        noMatchesTemplate: function defaultNoMatchesTemplate() {
            return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.access.key.multi.selector.no.match'));
        }
    };
    exports.default = AccessKeyMultiSelector;
    module.exports = exports['default'];
});