define('bitbucket/internal/feature/project/filterable-project-table/action-creators', ['exports', './actions'], function (exports, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.populateProjects = undefined;
    var populateProjects = exports.populateProjects = function populateProjects(projectPage) {
        return {
            type: _actions.LOAD_PROJECTS_SUCCESS,
            payload: projectPage
        };
    };
});