define('bitbucket/internal/feature/user/group-multi-selector/group-multi-selector', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/widget/searchable-multi-selector/searchable-multi-selector'], function (module, exports, _aui, _jquery, _navbuilder, _searchableMultiSelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _searchableMultiSelector2 = babelHelpers.interopRequireDefault(_searchableMultiSelector);

    function getGroupName(groupOrGroupName) {
        return typeof groupOrGroupName === 'string' ? groupOrGroupName : groupOrGroupName.name;
    }

    function GroupMultiSelector($field, options) {
        _searchableMultiSelector2.default.call(this, $field, options);
    }

    _jquery2.default.extend(true, GroupMultiSelector.prototype, _searchableMultiSelector2.default.prototype, {
        defaults: {
            hasAvatar: true,
            url: _navbuilder2.default.rest().groups().build(),
            selectionTemplate: function selectionTemplate(group) {
                return bitbucket.internal.widget.groupAvatarWithName({
                    size: 'xsmall',
                    name: getGroupName(group)
                });
            },
            resultTemplate: function resultTemplate(group) {
                return bitbucket.internal.widget.groupAvatarWithName({
                    size: 'small',
                    name: getGroupName(group)
                });
            },
            generateId: getGroupName,
            generateText: getGroupName,
            inputTooShortTemplate: function defaultInputTooShortTemplate() {
                return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.group.multi.selector.help'));
            },
            noMatchesTemplate: function defaultNoMatchesTemplate() {
                return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.group.multi.selector.no.match'));
            }
        }
    });

    exports.default = GroupMultiSelector;
    module.exports = exports['default'];
});