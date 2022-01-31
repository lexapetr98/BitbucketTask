define('bitbucket/internal/feature/comments/comment-tips', ['module', 'exports', '@atlassian/aui', 'bitbucket/internal/util/navigator'], function (module, exports, _aui, _navigator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    exports.default = {
        tips: [(0, _navigator.isMac)() ? _aui2.default.I18n.getText('bitbucket.web.comment.tip.cmdEnter') : _aui2.default.I18n.getText('bitbucket.web.comment.tip.ctrlEnter'), _aui2.default.I18n.getText('bitbucket.web.comment.tip.mention'), _aui2.default.I18n.getText('bitbucket.web.comment.tip.markdown', '<a href=bitbucket_help_url(\'bitbucket.help.markup.syntax.guide\') target="_blank">', '</a>')]
    };
    module.exports = exports['default'];
});