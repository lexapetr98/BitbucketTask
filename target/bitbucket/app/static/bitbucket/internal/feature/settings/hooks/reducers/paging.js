define('bitbucket/internal/feature/settings/hooks/reducers/paging', ['module', 'exports', 'lodash', 'redux', 'bitbucket/internal/util/reducers', '../actions'], function (module, exports, _lodash, _redux, _reducers, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = (0, _redux.combineReducers)({
        hooks: (0, _reducers.reduceByType)({}, babelHelpers.defineProperty({}, _actions.LOAD_HOOKS_SUCCESS, function (state, _ref) {
            var type = _ref.meta.type,
                page = _ref.payload;

            var oldIds = (0, _lodash.get)(state, [type, 'ids'], []);

            return babelHelpers.extends({}, state, babelHelpers.defineProperty({}, type, {
                lastPageMeta: (0, _lodash.omit)(page, 'values'),
                ids: oldIds.concat(page.values.map(function (hook) {
                    return hook.details.key;
                }))
            }));
        }))
    });
    module.exports = exports['default'];
});