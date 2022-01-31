define('bitbucket/internal/feature/commit/commit-badge/commit-badge', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function create(commit) {
        var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            filePath = _ref.filePath,
            repository = _ref.repository;

        return (0, _jquery2.default)(bitbucket.internal.feature.commit.commitBadge.oneline({
            commit: commit,
            filePath: filePath,
            repository: repository,
            withAvatar: true
        }));
    }

    exports.default = {
        create: create
    };
    module.exports = exports['default'];
});