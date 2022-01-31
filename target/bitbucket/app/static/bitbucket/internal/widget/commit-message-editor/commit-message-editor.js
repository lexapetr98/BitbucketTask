define('bitbucket/internal/widget/commit-message-editor/commit-message-editor', ['exports', '@atlassian/aui', 'lodash', 'bitbucket/internal/feature/file-content/editor-mode', 'bitbucket/internal/feature/file-content/stash-codemirror/stash-codemirror'], function (exports, _aui, _lodash, _editorMode, _stashCodemirror) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getCommitMessageEditor = getCommitMessageEditor;

    var _editorMode2 = babelHelpers.interopRequireDefault(_editorMode);

    var _stashCodemirror2 = babelHelpers.interopRequireDefault(_stashCodemirror);

    var subjectDelimiter = '\n\n';

    var onBlur = function onBlur(editor) {
        var value = editor.getDoc().getValue();
        var initialValue = editor.state.initialValue;


        if (value === initialValue || value === '' + initialValue + subjectDelimiter) {
            setTimeout(function () {
                editor.setValue(initialValue);
                shrinkWrapEditor(editor);
            }, 250); //defer the editor resize to avoid layout changes cancelling the click event of the newly `focus`ed element.
        }
    };

    var onFocus = function onFocus(editor) {
        var value = editor.getDoc().getValue();
        var initialValue = editor.state.initialValue;


        if (value === initialValue) {
            if (!(0, _lodash.includes)(value, subjectDelimiter)) {
                // If the value doesn't have a subject, assume the initial value is all subject and
                // add the delimiter to the end
                editor.setValue('' + value + subjectDelimiter);
                shrinkWrapEditor(editor);

                //Encourage people to add body content after the subjectDelimiter
                editor.setCursor(Infinity, 0);
            }
        }
    };

    var shrinkWrapEditor = function shrinkWrapEditor(editor) {
        var wrapperEl = editor.getWrapperElement();
        var scrollEl = wrapperEl.querySelector('.CodeMirror-scroll');
        var sizerEl = wrapperEl.querySelector('.CodeMirror-sizer');

        scrollEl.style.minHeight = sizerEl.clientHeight + 'px';
    };

    var ignoreTab = function ignoreTab(editor, e) {
        if (e.keyCode === _aui.keyCode.TAB) {
            e.codemirrorIgnore = true;
        }
    };

    /**
     * Get the commit message editor instance for a given textarea. Will create a new instance if one is not already present.
     *
     * @param {HTMLElement} textarea - The textarea that is / will become a CodeMirror editor
     * @returns {CodeMirror} a CodeMirror editor instance
     */
    function getCommitMessageEditor(textarea) {
        var editor = (0, _lodash.get)(textarea, 'nextSibling.CodeMirror');

        if (editor) {
            editor.setValue(textarea.value);
            editor.off('focus', onFocus);
            editor.off('blur', onBlur);
            editor.off('keydown', ignoreTab);
        } else {
            new _stashCodemirror2.default(textarea, {
                autoResizing: true,
                editorMode: _editorMode2.default.EDIT,
                fromTextArea: true,
                lineNumbers: false,
                lineWrapping: true,
                theme: 'commit-message',
                keyMap: 'default'
            });

            editor = (0, _lodash.get)(textarea, 'nextSibling.CodeMirror');
            // Kinda hax but it means we have the same kind of editor instance in both cases
            // (rather than one CodeMirror and one StashCodeMirror)

            editor.on('change', function () {
                //Update the textarea value
                editor.save();
            });
        }

        editor.state.initialValue = editor.getDoc().getValue();

        editor.on('blur', onBlur);
        editor.on('focus', onFocus);
        editor.on('keydown', ignoreTab);

        return editor;
    }
});