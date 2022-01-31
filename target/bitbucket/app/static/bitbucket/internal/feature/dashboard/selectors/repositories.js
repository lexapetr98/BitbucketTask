define('bitbucket/internal/feature/dashboard/selectors/repositories', ['exports', 'lodash', 'reselect'], function (exports, _lodash, _reselect) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.repositoriesSelector = exports.repositoriesPagingSelector = exports.getRepositoryPagingInfo = exports.getRepositories = undefined;
    var getRepositories = exports.getRepositories = function getRepositories(state) {
        return state.entities.repositories;
    };
    var getRepositoryPagingInfo = exports.getRepositoryPagingInfo = function getRepositoryPagingInfo(state) {
        return (0, _lodash.get)(state.paging.repositories, state.ui.repositories.activeType);
    };

    var repositoriesPagingSelector = exports.repositoriesPagingSelector = (0, _reselect.createSelector)([getRepositoryPagingInfo], function (pagingInfo) {
        var props = {
            isLastPage: true
        };

        if (pagingInfo) {
            if (pagingInfo.loadMoreCallback) {
                props.loadMore = pagingInfo.loadMoreCallback;
            } else {
                props.nextStart = pagingInfo.lastPageMeta.nextStart;
            }
            props.isLastPage = pagingInfo.lastPageMeta.isLastPage;
            props.start = pagingInfo.lastPageMeta.start;
            props.nextStart = pagingInfo.lastPageMeta.nextStart;
            props.count = pagingInfo.lastPageMeta.count;
        }

        return props;
    });

    var repositoriesSelector = exports.repositoriesSelector = (0, _reselect.createSelector)([getRepositories, getRepositoryPagingInfo], function (repositories, pagingInfo) {
        return pagingInfo ? pagingInfo.repositories.map(function (key) {
            return repositories[key];
        }) : null; // differentiate from an empty result
    });
});