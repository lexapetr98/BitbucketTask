define('bitbucket/internal/feature/timezone/timezone', ['module', 'exports', 'jquery', 'lodash'], function (module, exports, _jquery, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    /**
     * Formats a select2 item by calling the appropriate soy template.
     *
     * @param item
     * @param item.element {Array<HTMLElement>}
     * @returns {String} a HTML string
     */
    function formatResult(item) {
        if (item.element.length > 0 && item.element[0].tagName.toLowerCase() === 'optgroup') {
            return bitbucket.internal.feature.timezone.regionHeader({
                label: item.text
            });
        }

        var $tz = (0, _jquery2.default)(item.element);
        return bitbucket.internal.feature.timezone.selection({
            displayName: $tz.attr('data-display-name'),
            extraClasses: $tz.attr('class'),
            label: $tz.attr('data-label'),
            offset: formatOffset($tz.attr('data-offset')),
            value: $tz.val()
        });
    }

    function formatOffset(offset) {
        if (offset === 'Z') {
            return '±00:00';
        }
        return offset;
    }

    function filterMatcher(term, text, opt) {
        if (!term) {
            return true;
        }
        term = term.toLowerCase();

        var $opt = (0, _jquery2.default)(opt);
        return [$opt.attr('data-label'), $opt.attr('data-display-name'), formatOffset($opt.attr('data-offset')), $opt.val()].some(function matches(val) {
            return val && _lodash2.default.includes(val.toLowerCase(), term);
        });
    }

    function onReady(id) {
        (0, _jquery2.default)('#' + id).auiSelect2({
            formatSelection: formatResult,
            formatResult: formatResult,
            matcher: filterMatcher,
            escapeMarkup: _lodash2.default.identity
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});