define('bitbucket/internal/model/conflict', ['module', 'exports', '@atlassian/aui', 'backbone-brace', 'bitbucket/internal/model/conflict-change', 'bitbucket/internal/model/file-change-types'], function (module, exports, _aui, _backboneBrace, _conflictChange, _fileChangeTypes) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _conflictChange2 = babelHelpers.interopRequireDefault(_conflictChange);

    var _fileChangeTypes2 = babelHelpers.interopRequireDefault(_fileChangeTypes);

    var messageMatrix = {};

    messageMatrix[_fileChangeTypes2.default.ADD] = {};
    messageMatrix[_fileChangeTypes2.default.ADD][_fileChangeTypes2.default.ADD] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.add.add');
    messageMatrix[_fileChangeTypes2.default.ADD][_fileChangeTypes2.default.RENAME] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.add.rename');
    messageMatrix[_fileChangeTypes2.default.ADD][_fileChangeTypes2.default.MOVE] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.add.move');

    messageMatrix[_fileChangeTypes2.default.MODIFY] = {};
    messageMatrix[_fileChangeTypes2.default.MODIFY][_fileChangeTypes2.default.MODIFY] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.modify.modify');
    messageMatrix[_fileChangeTypes2.default.MODIFY][_fileChangeTypes2.default.RENAME] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.modify.rename');
    messageMatrix[_fileChangeTypes2.default.MODIFY][_fileChangeTypes2.default.MOVE] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.modify.move');
    messageMatrix[_fileChangeTypes2.default.MODIFY][_fileChangeTypes2.default.DELETE] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.modify.delete');

    messageMatrix[_fileChangeTypes2.default.RENAME] = {};
    messageMatrix[_fileChangeTypes2.default.RENAME][_fileChangeTypes2.default.ADD] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.rename.add');
    messageMatrix[_fileChangeTypes2.default.RENAME][_fileChangeTypes2.default.RENAME] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.rename.rename');
    messageMatrix[_fileChangeTypes2.default.RENAME][_fileChangeTypes2.default.MOVE] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.rename.move');
    messageMatrix[_fileChangeTypes2.default.RENAME][_fileChangeTypes2.default.DELETE] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.rename.delete');

    messageMatrix[_fileChangeTypes2.default.MOVE] = {};
    messageMatrix[_fileChangeTypes2.default.MOVE][_fileChangeTypes2.default.ADD] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.move.add');
    messageMatrix[_fileChangeTypes2.default.MOVE][_fileChangeTypes2.default.RENAME] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.move.rename');
    messageMatrix[_fileChangeTypes2.default.MOVE][_fileChangeTypes2.default.MOVE] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.move.move');
    messageMatrix[_fileChangeTypes2.default.MOVE][_fileChangeTypes2.default.DELETE] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.move.delete');

    messageMatrix[_fileChangeTypes2.default.DELETE] = {};
    messageMatrix[_fileChangeTypes2.default.DELETE][_fileChangeTypes2.default.MODIFY] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.delete.modify');
    messageMatrix[_fileChangeTypes2.default.DELETE][_fileChangeTypes2.default.RENAME] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.delete.rename');
    messageMatrix[_fileChangeTypes2.default.DELETE][_fileChangeTypes2.default.MOVE] = _aui2.default.I18n.getText('bitbucket.web.pullrequest.diff.conflict.title.delete.move');

    var Conflict = _backboneBrace2.default.Model.extend({
        namedAttributes: {
            ourChange: _conflictChange2.default,
            theirChange: _conflictChange2.default
        },
        getConflictMessage: function getConflictMessage() {
            //'our' describes the change that was made on the destination branch relative to a shared
            //ancestor with the incoming branch.
            //'their' describes the change that was made on the incoming branch relative to a shared
            //ancestor with the destination branch
            var destinationModState = this.getOurChange() && this.getOurChange().getType();
            var incomingModState = this.getTheirChange() && this.getTheirChange().getType();

            return messageMatrix[incomingModState] && messageMatrix[incomingModState][destinationModState] || '';
        }
    });

    exports.default = Conflict;
    module.exports = exports['default'];
});