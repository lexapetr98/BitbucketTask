define('bitbucket/internal/model/scope-type', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    // keep in sync with com.atlassian.bitbucket.scope.ScopeType
    var ScopeType = {
        GLOBAL: 'GLOBAL',
        PROJECT: 'PROJECT',
        REPOSITORY: 'REPOSITORY'
    };

    var GLOBAL = ScopeType.GLOBAL,
        PROJECT = ScopeType.PROJECT,
        REPOSITORY = ScopeType.REPOSITORY;
    exports.default = ScopeType;
    exports.GLOBAL = GLOBAL;
    exports.PROJECT = PROJECT;
    exports.REPOSITORY = REPOSITORY;
});