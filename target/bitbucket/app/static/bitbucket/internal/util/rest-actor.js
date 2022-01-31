define('bitbucket/internal/util/rest-actor', ['exports', 'lodash', 'bitbucket/util/server'], function (exports, _lodash, _server) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.restActorForType = exports.requestFailure = exports.requestSuccess = exports.REQUEST_SUCCESS = exports.REQUEST_FAILURE = exports.duplicateStrategy = undefined;


    var ABORT_OLD = 'ABORT_OLD';
    var DEFAULT = 'DEFAULT';
    // const QUEUE = 'QUEUE'; //TODO: Not implemented yet
    var DROP_NEW = 'DROP_NEW';

    var duplicateStrategy = exports.duplicateStrategy = {
        ABORT_OLD: ABORT_OLD,
        DEFAULT: DEFAULT,
        // QUEUE,
        DROP_NEW: DROP_NEW
    };

    var REQUEST_FAILURE = exports.REQUEST_FAILURE = 'REQUEST_FAILURE';
    var REQUEST_SUCCESS = exports.REQUEST_SUCCESS = 'REQUEST_SUCCESS';

    var requestSuccess = exports.requestSuccess = function requestSuccess(action, request, dispatch) {
        return function (data) {
            return dispatch({
                type: (0, _lodash.get)(action, 'meta.successType', REQUEST_SUCCESS),
                payload: data,
                meta: { originalAction: action, request: request }
            });
        };
    };

    var requestFailure = exports.requestFailure = function requestFailure(action, request, dispatch) {
        return function (xhr, textStatus, err, response) {
            return dispatch({
                type: (0, _lodash.get)(action, 'meta.failureType', REQUEST_FAILURE),
                payload: { textStatus: textStatus, err: err, response: response },
                meta: { originalAction: action, request: request }
            });
        };
    };

    var restActorForType = exports.restActorForType = function restActorForType(type, requestBuilder) {
        var _requests;

        var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
            _ref$duplicateStrateg = _ref.duplicateStrategy,
            duplicateStrategy = _ref$duplicateStrateg === undefined ? DEFAULT : _ref$duplicateStrateg;

        // The request cache is local to the restActor.
        // Multiple rest actors could therefore make overlapping requests to the same url,
        // without any duplicate request strategy being applied.
        // At the same time making it global would mean potentially conflicting duplicate request strategies
        // This feels like the most logical choice
        var requests = (_requests = {}, babelHelpers.defineProperty(_requests, _server.method.DELETE, {}), babelHelpers.defineProperty(_requests, _server.method.GET, {}), babelHelpers.defineProperty(_requests, _server.method.PATCH, {}), babelHelpers.defineProperty(_requests, _server.method.POST, {}), babelHelpers.defineProperty(_requests, _server.method.PUT, {}), _requests);

        return function (action, dispatch) {
            if (action.type !== type) {
                return;
            }

            var requestConfig = requestBuilder(action);

            requestConfig.type = requestConfig.type || _server.method.GET;

            var maybeExistingRequest = (0, _lodash.get)(requests, [requestConfig.type, requestConfig.url]);

            if (duplicateStrategy === DROP_NEW && maybeExistingRequest) {
                return;
            }

            if (duplicateStrategy === ABORT_OLD && maybeExistingRequest && maybeExistingRequest.abort) {
                maybeExistingRequest.abort();
            }

            var request = (0, _server.rest)(requestConfig).done(requestSuccess(action, requestConfig, dispatch)).fail(requestFailure(action, requestConfig, dispatch));

            if (duplicateStrategy === DROP_NEW || duplicateStrategy === ABORT_OLD) {
                (0, _lodash.set)(requests, [requestConfig.type, requestConfig.url], request.always(function () {
                    if ((0, _lodash.get)(requests, [requestConfig.type, requestConfig.url]) === request) {
                        (0, _lodash.unset)(requests, [requestConfig.type, requestConfig.url]);
                    }
                }));
            }
        };
    };
});