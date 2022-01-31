define('bitbucket/internal/feature/repository/filterable-repository-table/action-creators', ['exports', './actions'], function (exports, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.populateRepositories = undefined;
    var populateRepositories = exports.populateRepositories = function populateRepositories(repositoryPage) {
        return {
            type: _actions.LOAD_REPOSITORIES_SUCCESS,
            payload: repositoryPage
        };
    };
});