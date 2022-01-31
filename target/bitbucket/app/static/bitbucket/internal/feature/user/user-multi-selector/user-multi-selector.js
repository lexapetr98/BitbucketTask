define('bitbucket/internal/feature/user/user-multi-selector/user-multi-selector', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/widget/searchable-multi-selector/searchable-multi-selector'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _searchableMultiSelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _searchableMultiSelector2 = babelHelpers.interopRequireDefault(_searchableMultiSelector);

    function UserMultiSelector($field, options) {
        _searchableMultiSelector2.default.call(this, $field, options);
    }

    _jquery2.default.extend(true, UserMultiSelector.prototype, _searchableMultiSelector2.default.prototype, {
        defaults: {
            hasAvatar: true,
            url: _navbuilder2.default.rest().users().build(),
            selectionTemplate: function selectionTemplate(person) {
                return bitbucket.internal.widget.avatarWithName({
                    size: 'xsmall',
                    person: person,
                    deleted: !(0, _lodash.get)(person, 'active', true)
                });
            },
            urlParams: {
                avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                    size: 'xsmall'
                })
            },
            resultTemplate: function resultTemplate(person) {
                return bitbucket.internal.widget.avatarWithNameAndEmail({
                    size: 'small',
                    person: person
                });
            },
            generateId: function generateId(user) {
                // We only use the name as we may not have access to the id
                return user.name;
            },
            inputTooShortTemplate: function defaultInputTooShortTemplate() {
                return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.user.multi.selector.help'));
            },
            noMatchesTemplate: function defaultNoMatchesTemplate() {
                return _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.user.multi.selector.no.match'));
            },
            prepareSearchTerm: function prepareSearchTerm(term) {
                // Don't be picky when user types in "@user" instead of "user"
                return term.replace(/^@/, '');
            }
        }
    });

    exports.default = UserMultiSelector;
    module.exports = exports['default'];
});