define('bitbucket/internal/model/conflict-change', ['module', 'exports', 'backbone-brace', 'bitbucket/internal/model/file-change-types', 'bitbucket/internal/model/path'], function (module, exports, _backboneBrace, _fileChangeTypes, _path) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _fileChangeTypes2 = babelHelpers.interopRequireDefault(_fileChangeTypes);

    var _path2 = babelHelpers.interopRequireDefault(_path);

    var ConflictChange = _backboneBrace2.default.Model.extend({
        namedAttributes: {
            srcPath: _path2.default,
            path: _path2.default,
            type: null
        },
        initialize: function initialize() {
            this.setType(ConflictChange._mapChangeType(this.getType(), this.getSrcPath(), this.getPath()));
        }
    }, {
        _mapChangeType: function _mapChangeType(modState, srcPath, path) {
            return modState === _fileChangeTypes2.default.MOVE && srcPath && srcPath.isSameDirectory(path) ? _fileChangeTypes2.default.RENAME : _fileChangeTypes2.default.changeTypeFromId(modState);
        }
    });

    exports.default = ConflictChange;
    module.exports = exports['default'];
});