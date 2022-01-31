define('bitbucket/internal/feature/dashboard/reducers/entities/pull-request-suggestions', ['module', 'exports', 'bitbucket/internal/util/reducers', '../../actions', '../../util/suggestion-unique-id'], function (module, exports, _reducers, _actions, _suggestionUniqueId) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _suggestionUniqueId2 = babelHelpers.interopRequireDefault(_suggestionUniqueId);

    exports.default = (0, _reducers.reduceByType)({}, babelHelpers.defineProperty({}, _actions.LOAD_PULL_REQUEST_SUGGESTIONS_SUCCESS, function (state, action) {
        // we always throw away the previous PR suggestions so we don't get duplicates listed
        return action.payload.values.reduce(function (suggestionsById, suggestion) {
            suggestionsById[(0, _suggestionUniqueId2.default)(suggestion)] = suggestion;
            return suggestionsById;
        }, {});
    }));
    module.exports = exports['default'];
});