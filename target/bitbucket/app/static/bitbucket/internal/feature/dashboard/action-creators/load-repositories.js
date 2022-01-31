define('bitbucket/internal/feature/dashboard/action-creators/load-repositories', ['exports', '../actions'], function (exports, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.clearRepositories = exports.loadRepositoriesFailure = exports.loadRepositories = exports.populateRepositories = undefined;
    exports.loadRepositoriesSuccess = loadRepositoriesSuccess;
    var populateRepositories = exports.populateRepositories = function populateRepositories(payload, _ref) {
        var repoType = _ref.repoType;
        return loadRepositoriesSuccess(payload, { repoType: repoType });
    };

    var loadRepositories = exports.loadRepositories = function loadRepositories(_ref2) {
        var repoType = _ref2.repoType,
            query = _ref2.query;
        return {
            type: _actions.LOAD_REPOSITORIES,
            meta: { repoType: repoType, query: query }
        };
    };

    var loadRepositoriesFailure = exports.loadRepositoriesFailure = function loadRepositoriesFailure(_ref3) {
        var repoType = _ref3.repoType;
        return {
            type: _actions.LOAD_REPOSITORIES_FAILURE,
            meta: { repoType: repoType }
        };
    };

    var clearRepositories = exports.clearRepositories = function clearRepositories(_ref4) {
        var repoType = _ref4.repoType;
        return {
            type: _actions.CLEAR_REPOSITORIES,
            meta: { repoType: repoType }
        };
    };

    function loadRepositoriesSuccess(payload, _ref5) {
        var repoType = _ref5.repoType,
            query = _ref5.query,
            nextSearch = _ref5.nextSearch;

        return {
            type: _actions.LOAD_REPOSITORIES_SUCCESS,
            payload: payload,
            meta: { repoType: repoType, query: query, nextSearch: nextSearch }
        };
    }
});