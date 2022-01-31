define('bitbucket/internal/feature/comments/utils', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    /**
     * Returns selected text in the provided comment (if any)
     *
     * @param {Object} comment
     * @returns {string | undefined}
     */
    var getCommentSelection = function getCommentSelection(comment) {
        var selection = window.getSelection();

        if (!selection) {
            return;
        }

        // we can use the selection if it's within the content of this comment text, however if you double-click
        // to select a whole paragraph and it's the last paragraph then the selection.focusNode (end of selection) is
        // actually the ul.actions so we allow that too.
        var anchorNode = selection.anchorNode,
            focusNode = selection.focusNode;


        //In Internet Explorer node.contains only works with elements, not other node types (like text nodes)
        //https://developer.mozilla.org/en-US/docs/Web/API/Node/contains#Browser_compatibility
        //If the anchorNode or focusNode is a non-ELEMENT_NODE, use its parent for the contains check instead
        //Can remove when we drop IE11 (works correctly in Edge)
        if (anchorNode && anchorNode.nodeType !== Node.ELEMENT_NODE) {
            anchorNode = anchorNode.parentNode;
        }

        if (focusNode && focusNode.nodeType !== Node.ELEMENT_NODE) {
            focusNode = focusNode.parentNode;
        }

        var message = comment.querySelector('.message');
        var actions = comment.querySelector('.actions');

        if (message.contains(anchorNode) && (message.contains(focusNode) || actions === focusNode)) {
            var text = sanitiseText(selection.toString());
            selection.removeAllRanges();
            return text;
        }
    };

    /**
     * Sanitises an input text string to ensure that it is valid task text - ie. a trimmed single line
     *
     * @param {string} text
     * @returns {string}
     */
    var sanitiseText = function sanitiseText(text) {
        return text.trim().replace(/\s+/gm, ' ');
    };

    exports.getCommentSelection = getCommentSelection;
    exports.sanitiseText = sanitiseText;
});