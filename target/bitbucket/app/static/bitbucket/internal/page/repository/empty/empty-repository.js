define('bitbucket/internal/page/repository/empty/empty-repository', ['module', 'exports', 'jquery', 'bitbucket/util/state', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _state, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    function updateInstructions(module, cloneUrl) {
        (0, _jquery2.default)('#empty-repository-instructions').html(bitbucket.internal.page.emptyRepositoryInstructions({
            repository: _state2.default.getRepository(),
            cloneUrl: cloneUrl,
            currentUser: _state2.default.getCurrentUser()
        }));
    }

    _events2.default.on('bitbucket.internal.feature.repository.clone.protocol.initial', updateInstructions);
    _events2.default.on('bitbucket.internal.feature.repository.clone.protocol.changed', updateInstructions);

    function onReady() {
        if ((0, _jquery2.default)('#empty-repository-instructions:empty').length) {
            updateInstructions(null, _state2.default.getRepository().cloneUrl);
        }
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});