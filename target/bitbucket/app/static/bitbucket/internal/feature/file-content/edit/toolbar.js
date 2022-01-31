define('bitbucket/internal/feature/file-content/edit/toolbar', ['exports', 'jquery', 'bitbucket/util/state'], function (exports, _jquery, _state) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.add = add;
    exports.remove = remove;
    exports.toggleToolbars = toggleToolbars;

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    function add() {
        (0, _jquery2.default)('.content-view').before(bitbucket.internal.feature.edit.fileEditToolbar({
            repository: _state2.default.getRepository(),
            ref: _state2.default.getRef(),
            pathComponents: _state2.default.getFilePath().components.map(function (text) {
                return { text: text };
            })
        })).after(bitbucket.internal.feature.edit.fileEditFooter());

        (0, _jquery2.default)('.edit-toolbar .breadcrumbs').tipsy({
            gravity: 'n',
            className: 'breadcrumb-tipsy',
            opacity: 0.98
        });
    }

    function remove() {
        (0, _jquery2.default)('.edit-toolbar').remove();
    }

    function toggleToolbars(show) {
        show ? add() : remove();
    }
});