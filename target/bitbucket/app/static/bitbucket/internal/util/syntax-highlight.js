define('bitbucket/internal/util/syntax-highlight', ['module', 'exports', 'codemirror', 'jquery', 'bitbucket/internal/util/determine-language'], function (module, exports, _codemirror, _jquery, _determineLanguage) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _codemirror2 = babelHelpers.interopRequireDefault(_codemirror);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _determineLanguage2 = babelHelpers.interopRequireDefault(_determineLanguage);

    /**
     * Highlight a code block element.
     * The code element is expected to have a data-language attribute and be inside of a pre element.
     * i.e. pre > code[data-language]
     *
     * @param {jQuery|HTMLElement} el - A code element.
     */
    function highlightCodeblock(el) {
        var $el = (0, _jquery2.default)(el);
        if (!$el.length) {
            return;
        }

        var mode = $el.attr('data-language');

        _determineLanguage2.default.getCodeMirrorModeForName(mode).then(runMode).fail(wrmFail);

        /**
         * Run the CodeMirror mode over the text. CodeMirror will dump the output back in to the given element.
         */
        function runMode(codeMirrorMode) {
            _codemirror2.default.runMode($el.text(), codeMirrorMode.mime || { name: mode }, $el[0]);
        }

        function wrmFail(reason) {
            console.warn(reason || mode + ' could not be loaded for syntax highlighting.');
        }
    }

    /**
     * Highlight all <code>pre > code[data-language]</code> blocks in a given container
     *
     * @param {jQuery|HTMLElement} container
     */
    /**
     * Syntax highlights a <pre><code data-language=""></code></pre>} block
     */
    function highlightContainer(container) {
        (0, _jquery2.default)(container).find('pre > code[data-language]').each(function () {
            highlightCodeblock(this);
        });
    }

    exports.default = {
        codeblock: highlightCodeblock,
        container: highlightContainer
    };
    module.exports = exports['default'];
});