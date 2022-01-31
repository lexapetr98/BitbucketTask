define('bitbucket/internal/feature/dashboard/reducers/paging/pull-requests', ['exports', 'lodash', 'bitbucket/internal/bbui/utils/pull-request-unique-id', 'bitbucket/internal/util/reducers', '../../actions'], function (exports, _lodash, _pullRequestUniqueId, _reducers, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.DEFAULT_VISIBLE_COUNT = undefined;

    var _pullRequestUniqueId2 = babelHelpers.interopRequireDefault(_pullRequestUniqueId);

    var _reduceByType;

    // exported for testing
    var DEFAULT_VISIBLE_COUNT = exports.DEFAULT_VISIBLE_COUNT = 5;

    exports.default = (0, _reducers.reduceByType)({}, (_reduceByType = {}, babelHelpers.defineProperty(_reduceByType, _actions.LOAD_PULL_REQUESTS_SUCCESS, function (state, action) {
        var page = action.payload;
        var ids = page.values.map(_pullRequestUniqueId2.default);
        var defaultVisibleCount = (0, _lodash.get)(action, 'meta.defaultVisibleCount', DEFAULT_VISIBLE_COUNT);

        // the only time we do a "placebo" load more is for the initial default view, so any other time
        // visibleCount should just track the length of the ids above
        var visibleCount = (0, _lodash.get)(state, [action.meta.type, 'visibleCount'], defaultVisibleCount);
        visibleCount = visibleCount > DEFAULT_VISIBLE_COUNT ? ids.length : Math.min(ids.length, DEFAULT_VISIBLE_COUNT);

        return babelHelpers.extends({}, state, babelHelpers.defineProperty({}, action.meta.type, {
            lastPageMeta: (0, _lodash.omit)(page, 'values'),
            ids: ids,
            visibleCount: visibleCount
        }));
    }), babelHelpers.defineProperty(_reduceByType, _actions.SHOW_MORE_PULL_REQUESTS, function (state, action) {
        var stateForType = state[action.meta.type];
        var visibleCount = stateForType.ids.length;
        return babelHelpers.extends({}, state, babelHelpers.defineProperty({}, action.meta.type, babelHelpers.extends({}, stateForType, {
            visibleCount: visibleCount
        })));
    }), _reduceByType));
});