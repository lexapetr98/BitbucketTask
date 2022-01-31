define('bitbucket/internal/widget/filterable-entity-table/action-creators', ['exports', 'bitbucket/internal/bbui/paged-table/paged-table', './actions'], function (exports, _pagedTable, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.entityActionCreators = undefined;
    var entityActionCreators = exports.entityActionCreators = function entityActionCreators() {
        var loadAction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _actions.LOAD_ENTITIES;
        return {
            loadEntities: function loadEntities() {
                var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                    _ref$start = _ref.start,
                    start = _ref$start === undefined ? 0 : _ref$start,
                    _ref$limit = _ref.limit,
                    limit = _ref$limit === undefined ? _pagedTable.DEFAULT_PAGE_SIZE : _ref$limit,
                    filter = _ref.filter;

                return {
                    type: loadAction,
                    payload: {
                        filter: filter,
                        limit: limit,
                        start: start
                    }
                };
            },
            setFilter: function setFilter(filter) {
                return {
                    type: _actions.FILTER_CHANGED,
                    payload: filter
                };
            }
        };
    };
});