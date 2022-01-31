define('bitbucket/internal/feature/settings/hooks/store', ['module', 'exports', 'bitbucket/internal/bbui/utils/thunk-middleware', 'bitbucket/internal/feature/settings/hooks/reducers/entities', 'bitbucket/internal/feature/settings/hooks/reducers/paging', 'bitbucket/internal/feature/settings/hooks/reducers/ui', 'bitbucket/internal/util/redux'], function (module, exports, _thunkMiddleware, _entities, _paging, _ui, _redux) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function () {
        return (0, _redux.legacyCustomCreateStore)({
            paging: _paging2.default,
            entities: _entities2.default,
            ui: _ui2.default
        }, {}, _thunkMiddleware2.default);
    };

    var _thunkMiddleware2 = babelHelpers.interopRequireDefault(_thunkMiddleware);

    var _entities2 = babelHelpers.interopRequireDefault(_entities);

    var _paging2 = babelHelpers.interopRequireDefault(_paging);

    var _ui2 = babelHelpers.interopRequireDefault(_ui);

    module.exports = exports['default'];
});