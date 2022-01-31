define('bitbucket/internal/util/get-id', ['exports', 'lodash'], function (exports, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getIdString = exports.getId = exports.defaultIdField = undefined;
    var defaultIdField = exports.defaultIdField = 'id';

    var getId = exports.getId = function getId() {
        var idField = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultIdField;
        return function (entity) {
            return (0, _lodash.isFunction)(idField) ? idField(entity) : (0, _lodash.get)(entity, idField);
        };
    };

    var getIdString = exports.getIdString = function getIdString() {
        var idField = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultIdField;
        return function (entity) {
            var id = (0, _lodash.isFunction)(idField) ? idField(entity) : (0, _lodash.get)(entity, idField);

            return id && String(id);
        };
    };
});