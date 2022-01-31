define('bitbucket/internal/util/focus-snapshot', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    exports.default = function () {
        var $el;
        var selection;
        return {
            save: function save() {
                var element = document.activeElement;
                if (element) {
                    $el = (0, _jquery2.default)(element);
                    if ($el.is(':text, textarea')) {
                        selection = $el.getSelection(); // requires rangy (rangy-input.js)
                    }
                }
            },
            restore: function restore() {
                if ($el) {
                    $el.focus();
                    if (selection) {
                        $el.setSelection(selection.start, selection.end);
                    }
                }
            }
        };
    }();

    module.exports = exports['default'];
});