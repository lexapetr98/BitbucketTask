define('bitbucket/internal/widget/filterable-entity-table/store', ['module', 'exports', 'icepick', 'lodash', 'redux', 'bitbucket/internal/util/reducers', 'bitbucket/internal/util/redux', './actions'], function (module, exports, _icepick, _lodash, _redux, _reducers, _redux2, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = createStore;


    var NO_FILTER = '';

    function createStore(_ref) {
        var _ref$actors = _ref.actors,
            actors = _ref$actors === undefined ? [] : _ref$actors,
            _ref$entityName = _ref.entityName,
            entityName = _ref$entityName === undefined ? 'ENTITY' : _ref$entityName,
            entityIdField = _ref.entityIdField,
            _ref$loadAction = _ref.loadAction,
            loadAction = _ref$loadAction === undefined ? _actions.LOAD_ENTITIES : _ref$loadAction;

        var loadPageSuccess = loadAction + '_SUCCESS';
        var loadPageFailure = loadAction + '_FAILURE';
        var loadPageFallback = loadAction + '_FALLBACK';

        var byFilter = (0, _reducers.multiKeyedReducer)(function (action) {
            return action.type === loadPageSuccess ? (0, _lodash.get)(action, 'meta.filter', NO_FILTER) : null;
        });

        return _redux2.createActorStore.apply(undefined, [{
            entities: (0, _redux.combineReducers)(babelHelpers.defineProperty({}, entityName, (0, _reducers.entitiesReducer)({ loadPageSuccess: loadPageSuccess }, entityIdField))),
            paging: (0, _redux.combineReducers)(babelHelpers.defineProperty({}, entityName, byFilter((0, _reducers.pagingReducer)(loadPageSuccess, entityIdField)))),
            ui: (0, _redux.combineReducers)(babelHelpers.defineProperty({}, entityName, (0, _redux.combineReducers)({
                loading: (0, _reducers.toggleReducer)({
                    on: [loadAction],
                    off: [loadPageSuccess, loadPageFailure]
                }),
                filter: (0, _reducers.reduceByType)(NO_FILTER, babelHelpers.defineProperty({}, _actions.FILTER_CHANGED, function (state, _ref2) {
                    var _ref2$payload = _ref2.payload,
                        filter = _ref2$payload === undefined ? NO_FILTER : _ref2$payload;
                    return filter;
                })),
                filterable: (0, _reducers.toggleReducer)({
                    initialValue: null, // only specified if we're using the fallback
                    off: [loadPageFallback]
                }),
                requestFailed: (0, _reducers.toggleReducer)({ on: [loadPageFailure] })
            })))
        }, {}].concat(babelHelpers.toConsumableArray(actors)));
    }
    module.exports = exports['default'];
});