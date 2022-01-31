define('bitbucket/internal/bbui/utils/actors', ['exports', 'lodash', 'bitbucket/util/server'], function (exports, _lodash, _server) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.restActor = restActor;
    function restActor(_ref, dispatch) {
        var type = _ref.type,
            payload = _ref.payload,
            meta = _ref.meta;

        var restMeta = (0, _lodash.get)(meta, 'rest');
        if (!restMeta) {
            return;
        }

        var otherMeta = babelHelpers.extends({}, (0, _lodash.omit)(meta, 'rest'), {
            originalPayload: payload
        });

        (0, _server.rest)(restMeta).done(function (data) {
            dispatch({
                type: type + '_SUCCESS',
                payload: data,
                meta: otherMeta
            });
        }).fail(function (err) {
            dispatch({
                type: type + '_FAILURE',
                payload: err,
                meta: otherMeta
            });
        });
    }
});