define('bitbucket/internal/util/scope-type', ['exports', 'bitbucket/internal/model/scope-type'], function (exports, _scopeType) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.scopeNavMethod = exports.resolveForScopeType = undefined;

    var _scopeType2 = babelHelpers.interopRequireDefault(_scopeType);

    /**
     * Provide resolved map with booleans that indicate which of the scope types is the passed scope.
     * @param {string} scopeType
     * @example
     *     const resolvedScopeType = resolveForScopeType('REPOSITORY');
     *     console.log(resolvedScopeType.REPOSITORY); // true
     *     console.log(resolvedScopeType.PROJECT); // false
     * @returns {Object<string, boolean>}
     */
    function resolveForScopeType(scopeType) {
        return Object.keys(_scopeType2.default).reduce(function (obj, key) {
            obj[key] = key === scopeType;
            return obj;
        }, {});
    }

    /**
     * Given a scope type will return the appropriate nav builder method to use.
     * @param {string} scopeType
     * @returns {string}
     */
    function scopeNavMethod(scopeType) {
        return scopeType === _scopeType2.default.REPOSITORY ? 'currentRepo' : 'currentProject';
    }

    exports.resolveForScopeType = resolveForScopeType;
    exports.scopeNavMethod = scopeNavMethod;
});