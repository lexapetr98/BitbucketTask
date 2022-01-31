define('bitbucket/internal/layout/project/project', ['module', 'exports', 'jquery', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/project', 'bitbucket/internal/widget/sidebar/sidebar'], function (module, exports, _jquery, _pageState, _project, _sidebar) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _project2 = babelHelpers.interopRequireDefault(_project);

    var _sidebar2 = babelHelpers.interopRequireDefault(_sidebar);

    exports.default = {
        onReady: function onReady(projectJSON) {
            (0, _jquery2.default)(document).ready(_sidebar2.default.onReady);
            _pageState2.default.setProject(new _project2.default(projectJSON));
        }
    };
    module.exports = exports['default'];
});