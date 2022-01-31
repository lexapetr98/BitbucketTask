define('bitbucket/internal/feature/dashboard/selectors/pull-requests', ['exports', 'lodash', 'reselect', '../action-creators/load-pull-requests', '../more-items-type'], function (exports, _lodash, _reselect, _loadPullRequests, _moreItemsType) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getLastPageMeta = exports.getPullRequestVisibleCount = exports.getPullRequestIds = exports.getPullRequests = undefined;
    exports.hasMorePullRequestsForType = hasMorePullRequestsForType;
    exports.countLocallyLoadedRequests = countLocallyLoadedRequests;
    exports.getPullRequestsForType = getPullRequestsForType;
    exports.getPullRequestCountsForType = getPullRequestCountsForType;
    exports.getPullRequestsForTypes = getPullRequestsForTypes;
    exports.getPullRequestCountsForTypes = getPullRequestCountsForTypes;

    var _moreItemsType2 = babelHelpers.interopRequireDefault(_moreItemsType);

    var getPullRequests = exports.getPullRequests = function getPullRequests(state) {
        return state.entities.pullRequests;
    };
    var getPullRequestIds = exports.getPullRequestIds = function getPullRequestIds(type) {
        return function (state) {
            return (0, _lodash.get)(state.paging.pullRequests, [type, 'ids'], []);
        };
    };
    var getPullRequestVisibleCount = exports.getPullRequestVisibleCount = function getPullRequestVisibleCount(type) {
        return function (state) {
            return (0, _lodash.get)(state.paging.pullRequests, [type, 'visibleCount'], 0);
        };
    };
    var getLastPageMeta = exports.getLastPageMeta = function getLastPageMeta(type) {
        return function (state) {
            return (0, _lodash.get)(state.paging.pullRequests, [type, 'lastPageMeta']);
        };
    };

    function hasMorePullRequestsForType(type) {
        return (0, _reselect.createSelector)([getPullRequestIds(type), getPullRequestVisibleCount(type), getLastPageMeta(type)], function (ids, visibleCount, lastPageMeta) {
            if (visibleCount < ids.length) {
                return _moreItemsType2.default.LOCAL;
            } else if (ids.length >= _loadPullRequests.MAX_PAGE_SIZE || (0, _lodash.get)(lastPageMeta, 'isLastPage', true)) {
                return _moreItemsType2.default.NONE;
            }
            return _moreItemsType2.default.REMOTE;
        });
    }

    function countLocallyLoadedRequests(type) {
        return (0, _reselect.createSelector)([getPullRequestIds(type)], function (ids) {
            return ids.length;
        });
    }

    function getPullRequestsForType(type) {
        return (0, _reselect.createSelector)([getPullRequests, getPullRequestIds(type), getPullRequestVisibleCount(type)], function (pullRequests, pullRequestIds, visibleCount) {
            return pullRequestIds.slice(0, visibleCount).map(function (id) {
                return pullRequests[id];
            });
        });
    }

    function getPullRequestCountsForType(type) {
        return (0, _reselect.createSelector)([getPullRequestIds(type)], function (pullRequestIds) {
            return {
                pullRequestCount: pullRequestIds.length,
                type: type
            };
        });
    }

    function getPullRequestsForTypes(types) {
        var inputSelectors = types.map(function (type) {
            return getPullRequestsForType(type);
        });
        return (0, _reselect.createSelector)(inputSelectors, function () {
            for (var _len = arguments.length, pullRequests = Array(_len), _key = 0; _key < _len; _key++) {
                pullRequests[_key] = arguments[_key];
            }

            return (0, _lodash.flatten)(pullRequests);
        });
    }

    function getPullRequestCountsForTypes(types) {
        var inputSelectors = types.map(function (type) {
            return getPullRequestCountsForType(type);
        });
        return (0, _reselect.createSelector)(inputSelectors, function () {
            for (var _len2 = arguments.length, pullRequests = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                pullRequests[_key2] = arguments[_key2];
            }

            return pullRequests.reduce(function (obj, item) {
                return babelHelpers.extends({}, obj, babelHelpers.defineProperty({}, item.type, item.pullRequestCount));
            }, {});
        });
    }
});