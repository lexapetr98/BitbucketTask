define('bitbucket/internal/model/file-change', ['module', 'exports', 'backbone-brace', 'bitbucket/internal/model/commit-range', 'bitbucket/internal/model/conflict', 'bitbucket/internal/model/file-change-types', 'bitbucket/internal/model/path', 'bitbucket/internal/model/repository'], function (module, exports, _backboneBrace, _commitRange, _conflict, _fileChangeTypes, _path, _repository) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _commitRange2 = babelHelpers.interopRequireDefault(_commitRange);

    var _conflict2 = babelHelpers.interopRequireDefault(_conflict);

    var _fileChangeTypes2 = babelHelpers.interopRequireDefault(_fileChangeTypes);

    var _path2 = babelHelpers.interopRequireDefault(_path);

    var _repository2 = babelHelpers.interopRequireDefault(_repository);

    var FileChange = _backboneBrace2.default.Model.extend({
        namedAttributes: {
            repository: _repository2.default,
            commitRange: _commitRange2.default,
            srcPath: _path2.default,
            path: _path2.default,
            line: null,
            search: null,
            type: null,
            nodeType: null,
            conflict: _conflict2.default,
            diff: null,
            srcExecutable: null,
            executable: null
        },
        initialize: function initialize() {
            this.setType(FileChange._mapChangeType(this.getType(), this.getSrcPath(), this.getPath()));
        }
    }, {
        fromDiff: function fromDiff(diffJson, commitRange, repository) {
            return new FileChange({
                repository: repository,
                commitRange: commitRange,
                srcPath: diffJson.source,
                path: diffJson.destination,
                diff: diffJson,
                type: _fileChangeTypes2.default.guessChangeTypeFromDiff(diffJson)
            });
        },
        _mapChangeType: function _mapChangeType(modState, srcPath, path) {
            return modState === _fileChangeTypes2.default.MOVE && srcPath && srcPath.isSameDirectory(path) ? _fileChangeTypes2.default.RENAME : _fileChangeTypes2.default.changeTypeFromId(modState);
        }
    });

    exports.default = FileChange;
    module.exports = exports['default'];
});