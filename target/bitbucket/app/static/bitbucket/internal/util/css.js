define('bitbucket/internal/util/css', ['module', 'exports', 'bitbucket/internal/util/function'], function (module, exports, _function) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _function2 = babelHelpers.interopRequireDefault(_function);

    function getSheet() {
        var style = document.createElement('style');
        style.appendChild(document.createTextNode(''));
        document.head.appendChild(style);
        return style.sheet;
    }

    var indices = [];

    var sheet = getSheet();

    var cssUtil = {
        chain: function chain() {
            var removals = [];

            return {
                appendRule: function appendRule(ruleString) {
                    removals.push(cssUtil.appendRule(ruleString));
                    return this;
                },
                destroy: function destroy() {
                    _function2.default.applyAll(removals);
                    removals = [];
                }
            };
        },
        appendRule: function appendRule(ruleString) {
            var token = {};
            var index = indices.length;
            indices.push(token);
            sheet.insertRule(ruleString, index);

            return function remove() {
                var index = indices.indexOf(token);
                if (index !== -1) {
                    sheet.deleteRule(index);
                    indices.splice(index, 1);
                }
            };
        },
        __sheet: sheet // Visible for testing
    };

    exports.default = cssUtil;
    module.exports = exports['default'];
});