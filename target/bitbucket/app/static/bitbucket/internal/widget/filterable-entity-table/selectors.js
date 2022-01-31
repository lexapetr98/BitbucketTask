define('bitbucket/internal/widget/filterable-entity-table/selectors', ['exports', 'icepick', 'lodash', 'reselect'], function (exports, _icepick, _lodash, _reselect) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getStateForEntity = exports.getRequestFailedForEntity = exports.getLoadingForEntity = exports.getFilterableForEntity = exports.getEntitiesForEntity = exports.getCurrentPagingForEntity = exports.getCurrentFilterForEntity = undefined;
    var getCurrentFilterForEntity = exports.getCurrentFilterForEntity = function getCurrentFilterForEntity(entity) {
        return function (state) {
            return (0, _lodash.get)(state, ['ui', entity, 'filter']);
        };
    };
    var getCurrentPagingForEntity = exports.getCurrentPagingForEntity = function getCurrentPagingForEntity(entity) {
        return function (state) {
            return (0, _lodash.get)(state, ['paging', entity, getCurrentFilterForEntity(entity)(state)]);
        };
    };
    var getEntitiesForEntity = exports.getEntitiesForEntity = function getEntitiesForEntity(entity) {
        return function (state) {
            return (0, _lodash.get)(state, ['entities', entity]);
        };
    };
    var getFilterableForEntity = exports.getFilterableForEntity = function getFilterableForEntity(entity) {
        return function (state) {
            return (0, _lodash.get)(state, ['ui', entity, 'filterable']);
        };
    };
    var getLoadingForEntity = exports.getLoadingForEntity = function getLoadingForEntity(entity) {
        return function (state) {
            return (0, _lodash.get)(state, ['ui', entity, 'loading']);
        };
    };
    var getRequestFailedForEntity = exports.getRequestFailedForEntity = function getRequestFailedForEntity(entity) {
        return function (state) {
            return (0, _lodash.get)(state, ['ui', entity, 'requestFailed']);
        };
    };
    var getStateForEntity = exports.getStateForEntity = function getStateForEntity(entity) {
        return (0, _reselect.createSelector)([getEntitiesForEntity(entity), getCurrentFilterForEntity(entity), getFilterableForEntity(entity), getLoadingForEntity(entity), getRequestFailedForEntity(entity), getCurrentPagingForEntity(entity)], function () {
            var entities = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var filter = arguments[1];
            var filterable = arguments[2];
            var loading = arguments[3];
            var requestFailed = arguments[4];

            var _ref = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {},
                _ref$ids = _ref.ids,
                ids = _ref$ids === undefined ? [] : _ref$ids,
                _ref$lastPageMeta = _ref.lastPageMeta;

            _ref$lastPageMeta = _ref$lastPageMeta === undefined ? {} : _ref$lastPageMeta;
            var isLastPage = _ref$lastPageMeta.isLastPage,
                limit = _ref$lastPageMeta.limit,
                nextPageStart = _ref$lastPageMeta.nextPageStart;
            return (0, _icepick.freeze)({
                entities: ids.map(function (id) {
                    return entities[id];
                }),
                filter: filter,
                filterable: filterable,
                isLastPage: requestFailed || isLastPage,
                limit: limit,
                loading: loading,
                nextPageStart: nextPageStart
            });
        });
    };
});