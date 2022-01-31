define('bitbucket/internal/feature/pull-request/metadata-generator/metadata-generator', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/parse-commit-message', 'bitbucket/internal/util/text'], function (module, exports, _jquery, _lodash, _parseCommitMessage, _text) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _parseCommitMessage2 = babelHelpers.interopRequireDefault(_parseCommitMessage);

    var _text2 = babelHelpers.interopRequireDefault(_text);

    var handlesNewlinesInTextCorrectly = (0, _jquery2.default)('<div>').text('\n').text().length === 1;

    function generateTitleAndDescriptionFromCommitMessage(commitMessage) {
        var parsedCommitMessage = _parseCommitMessage2.default.splitIntoSubjectAndBody(commitMessage);
        return titleAndDescription(parsedCommitMessage);
    }

    function titleAndDescription(parsedCommitMessage) {
        var croppedTitle = parsedCommitMessage.subject.substring(0, 255);
        return {
            title: croppedTitle,
            description: parsedCommitMessage.body
        };
    }

    function generateDescriptionFromCommitMessages(commitMessages) {
        if (!handlesNewlinesInTextCorrectly) {
            return;
        }

        var description = '';

        // If there's multiple commits put in a list
        if (commitMessages.length > 1) {
            commitMessages = _lodash2.default.map(commitMessages, convertMessageToListItem);
        }

        if (commitMessages.length > 0) {
            description = commitMessages.reverse //oldest commits first.
            ().join('').trim();
        }
        return description;
    }

    function convertMessageToListItem(message) {
        // Compress lines where more than one line is empty into one empty line. Otherwise it would be parsed as the
        // end of the list and the following lines would behave differently (e.g. get turned into code blocks).
        var newlinesReplaced = message.replace(/\n\n+/g, '\n\n');

        // Indent contents so they are nested under the commit list.
        var indentRegex = /\n(.)/g;
        var indentReplacement = '\n' + _text2.default.indent('$1');

        var indented = newlinesReplaced.replace(indentRegex, indentReplacement);

        // For multi-paragraph messages, add empty line so that there's more space between this and next bullet
        var trailer = _lodash2.default.includes(indented, '\n\n') ? '\n\n' : '\n';
        return '* ' + indented + trailer;
    }

    exports.default = {
        generateTitleAndDescriptionFromCommitMessage: generateTitleAndDescriptionFromCommitMessage,
        generateDescriptionFromCommitMessages: generateDescriptionFromCommitMessages
    };
    module.exports = exports['default'];
});