define('bitbucket/internal/bbui/reducers/current-user', ['module', 'exports', 'bitbucket/internal/util/reducers', '../actions/actions'], function (module, exports, _reducers, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = (0, _reducers.reduceByType)({}, babelHelpers.defineProperty({}, _actions.SET_CURRENT_USER, function (state, action) {
        return action.payload;
    }));
    module.exports = exports['default'];
});