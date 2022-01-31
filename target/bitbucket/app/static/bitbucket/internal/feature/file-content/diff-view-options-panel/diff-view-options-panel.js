define('bitbucket/internal/feature/file-content/diff-view-options-panel/diff-view-options-panel', ['module', 'exports', '@atlassian/aui', 'chaperone', 'jquery', 'lodash', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/util/shortcuts'], function (module, exports, _aui, _chaperone, _jquery, _lodash, _events, _function, _shortcuts) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function ($document, diffViewOptions) {
        var ddList = '#diff-options-dropdown';
        var ddCoreItems = '#diff-options-core .aui-dropdown2-checkbox, #diff-options-core .aui-dropdown2-radio';
        var destroyables = [];

        // Update the diffOptions when an item is checked/unchecked
        function itemCheckStateChanged(e) {
            closeDiffViewOptions();
            var $el = (0, _jquery2.default)(this);
            var key = $el.attr('data-key');
            var val = $el.attr('data-value');
            var checked = e.type === 'aui-dropdown2-item-check';

            if (!checked && $el.hasClass('aui-dropdown2-radio')) {
                return;
            }

            diffViewOptions.set(key, val || checked);
        }

        // Check/Uncheck options visually when the dropdown is shown.
        function optionsDropdownShown(e) {
            destroyables.push(_events2.default.chain().on('window.scroll.throttled', closeDiffViewOptions).destroy);
        }

        function optionsDropdownHidden(e) {
            _events2.default.off('window.scroll.throttled', closeDiffViewOptions);
        }

        /**
         * Close the Diff View Options dropdown
         *
         * When the page is scrolled or when the options have changed, we want to
         * close the menu to avoid having it open when the user gets back to the page.
         *
         * In this particular scenario, the toolbar that contains the dropdown
         * can become position:fixed. This detaches the dropdown from the button location
         * and causes it to float on the page by itself until the toolbar is no longer fixed.
         *
         * @param {Event} e
         */
        function closeDiffViewOptions(e) {
            if ($document.find(ddList).attr('aria-hidden') === 'false') {
                $document.find(ddTrigger).trigger('aui-button-invoke');
            }
        }

        /**
         * Toggle a diff view option.
         *
         * @param {string} optionKey
         */
        function toggleDiffViewOption(optionKey) {
            closeDiffViewOptions();
            diffViewOptions.set(optionKey, !diffViewOptions.get(optionKey));
        }

        /**
         * Toggle the side-by-side-diff view. This would be triggered from a keyboard shortcut
         */
        function changeDiffType() {
            closeDiffViewOptions();
            diffViewOptions.set('diffType', diffViewOptions.get('diffType') === 'unified' ? 'side-by-side' : 'unified');
        }

        function init() {
            // If an item has a matching diff option set it to the value.
            // default to false
            (0, _jquery2.default)('#diff-options-dropdown').find(ddCoreItems).each(function () {
                var $el = (0, _jquery2.default)(this);
                var key = $el.attr('data-key');
                var val = $el.attr('data-value');
                var storedValue = diffViewOptions.get(key);
                var isChecked = storedValue === undefined ? defaultOptions[key] === val : storedValue === val || storedValue === true;
                $el.toggleClass('aui-dropdown2-checked checked', Boolean(isChecked)).attr('aria-checked', Boolean(isChecked));
            });
            var $sideBySideDiffTypeItem = (0, _jquery2.default)('.diff-type-options .aui-dropdown2-radio[data-value="side-by-side"]');

            // If we can have a side-by-side view and it's not disabled, remove the
            // disabled class from the menu item
            if (diffViewOptions.getOverrides().diffType !== 'unified') {
                $sideBySideDiffTypeItem.removeClass('aui-dropdown2-disabled').attr('aria-disabled', false);
            } else {
                // If side-by-side is disabled for the current file, add a tooltip explaining why
                $sideBySideDiffTypeItem.tooltip({
                    gravity: 'e',
                    delayIn: 0,
                    title: 'data-file-type-compatibility'
                });
            }
        }

        destroyables.push(_shortcuts2.default.bind('requestIgnoreWhitespace', toggleDiffViewOption.bind(null, 'ignoreWhitespace')));
        destroyables.push(_shortcuts2.default.bind('requestHideComments', toggleDiffViewOption.bind(null, 'hideComments')));
        destroyables.push(_shortcuts2.default.bind('requestHideEdiff', toggleDiffViewOption.bind(null, 'hideEdiff')));
        destroyables.push(_shortcuts2.default.bind('changeDiffTypeRequested', changeDiffType));
        destroyables.push(_events2.default.chainWith($document).on('aui-dropdown2-item-check aui-dropdown2-item-uncheck', ddCoreItems, itemCheckStateChanged).on('aui-dropdown2-show', ddList, optionsDropdownShown).on('aui-dropdown2-hide', ddList, optionsDropdownHidden).destroy);

        init();

        return {
            destroy: _lodash2.default.partial(_function2.default.applyAll, destroyables)
        };
    };

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _chaperone2 = babelHelpers.interopRequireDefault(_chaperone);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    var ddTrigger = '#diff-options-dropdown-trigger';

    _chaperone2.default.registerFeature('side-by-side-diff-discovery', [{
        id: 'side-by-side-diff-discovery',
        selector: '.diff-view-options',
        title: _aui2.default.I18n.getText('bitbucket.web.diff.sidebyside.feature.discovery.title'),
        content: _aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.diff.sidebyside.feature.discovery.content')),
        width: 330,
        alignment: 'bottom right',
        once: true
    }]);

    var defaultOptions = {
        diffType: 'unified'
    };

    module.exports = exports['default'];
});