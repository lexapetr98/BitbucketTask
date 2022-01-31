define('bitbucket/internal/widget/filterable-entity-table/entity-rest-actor', ['exports', 'icepick', 'bitbucket/util/server', 'bitbucket/internal/bbui/paged-table/paged-table', 'bitbucket/internal/util/analytics'], function (exports, _icepick, _server, _pagedTable, _analytics) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.loadEntitiesRestActor = exports.searchResponseTransformer = undefined;

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    /**
     * Pluck the entity page out of the search response and copy `nextStart` to `nextPageStart`
     * to conform with our standard paging.
     *
     * @param {String} entityName
     *
     * @returns {function(response: Object)}
     *
     */
    var searchResponseTransformer = exports.searchResponseTransformer = function searchResponseTransformer(entityName) {
        return function (response) {
            var searchEntityData = response[entityName];

            return searchEntityData ? (0, _icepick.set)(searchEntityData, 'nextPageStart', searchEntityData.nextPageStart || searchEntityData.nextStart) : response;
        };
    };

    /**
     * Rest actor for loading paged, filtered entities.
     * Supports a search fallback urlBuilder to handle disabled or incorrectly configured elastic search
     *
     * @param {Object} options
     * @param {String} options.loadAction
     * @param {bitbucket/util/navbuilder.Builder} options.urlBuilder
     * @param {bitbucket/util/navbuilder.Builder} [options.fallbackBuilder]
     * @param {Function} [options.responseTransformer]
     * @param {Object} [options.statusCode]
     *
     * @returns {function({type: String, payload?: Object, meta: Object}, Function)}
     */
    var loadEntitiesRestActor = exports.loadEntitiesRestActor = function loadEntitiesRestActor(_ref) {
        var loadAction = _ref.loadAction,
            urlBuilder = _ref.urlBuilder,
            fallbackBuilder = _ref.fallbackBuilder,
            responseTransformer = _ref.responseTransformer,
            statusCode = _ref.statusCode;

        var useFallback = false;

        return function (_ref2, dispatch) {
            var type = _ref2.type,
                _ref2$payload = _ref2.payload,
                payload = _ref2$payload === undefined ? {} : _ref2$payload,
                meta = _ref2.meta;

            if (type !== loadAction) {
                return;
            }

            var _payload$start = payload.start,
                start = _payload$start === undefined ? 0 : _payload$start,
                _payload$limit = payload.limit,
                limit = _payload$limit === undefined ? _pagedTable.DEFAULT_PAGE_SIZE : _payload$limit,
                filter = payload.filter;


            var fallback = function fallback() {
                useFallback = true;

                dispatch({
                    type: loadAction + '_FALLBACK'
                });

                _analytics2.default.add('entity-rest-actor.fallback.used');

                return (0, _server.rest)({
                    url: fallbackBuilder({ filter: filter }).withParams({ start: start, limit: limit }).build()
                });
            };

            (0, _server.rest)({
                url: (useFallback ? fallbackBuilder : urlBuilder)({ filter: filter }).withParams({ start: start, limit: limit }).build(),
                statusCode: babelHelpers.extends({}, statusCode, !useFallback && fallbackBuilder && {
                    // The order of args for a failed request is `jqXhr`, `textStatus`, `errorThrown`,
                    // a successful request will have the `data` as the first arg and the `jqXhr` as the 3rd arg.
                    // (See bitbucket/util/server: ajaxPipe() -> fail() vs ajaxPipe() -> done())
                    // Since this only cares about error cases, it will use the args in that order.
                    // To short-circuit, the first check is for the `textStatus`, since that is
                    // the 2nd arg in both cases.
                    '*': function _(jqXhr, textStatus) {
                        if (textStatus === 'error' && jqXhr && jqXhr.status >= 400) {
                            return true;
                        }
                        return false;
                    },
                    404: fallback,
                    500: fallback,
                    503: fallback
                })
            }).done(function (data) {
                dispatch({
                    type: type + '_SUCCESS',
                    payload: responseTransformer ? responseTransformer(data) : data,
                    meta: babelHelpers.extends({}, meta, { filter: filter })
                });
            }).fail(function (err) {
                dispatch({
                    type: type + '_FAILURE',
                    payload: err,
                    meta: babelHelpers.extends({}, meta, { filter: filter })
                });
            });
        };
    };
});