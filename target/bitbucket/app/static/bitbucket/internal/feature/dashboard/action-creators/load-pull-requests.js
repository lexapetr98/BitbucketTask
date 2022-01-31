define('bitbucket/internal/feature/dashboard/action-creators/load-pull-requests', ['exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/enums', '../actions', '../pull-request-type'], function (exports, _jquery, _lodash, _navbuilder, _server, _avatar, _enums, _actions, _pullRequestType) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.populatePullRequests = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = undefined;

    exports.default = function (type, limit) {
        return function (dispatch) {
            var meta = { type: type };

            dispatch({
                type: _actions.LOAD_PULL_REQUESTS,
                meta: meta
            });

            return getPullRequests(type, { limit: limit }).done(function (data) {
                dispatch(loadPullRequestsSuccess(data, meta));
            }).fail(function (data) {
                dispatch({
                    type: _actions.LOAD_PULL_REQUESTS_FAILURE,
                    payload: data,
                    meta: meta
                });
            });
        };
    };

    exports.updatePullRequestsByTypes = updatePullRequestsByTypes;

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var DEFAULT_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = 25;
    var MAX_PAGE_SIZE = exports.MAX_PAGE_SIZE = 100;
    var CLOSED_SINCE = 60 * 60 * 24 * 7; //1 week
    var CLOSED_PR_LIMIT = 25;
    var PullRequestOrdering = {
        PARTICIPANT_STATUS: 'participant_status',
        CLOSED_DATE: 'closed_date'
    };

    /**
     * @param {PullRequestType} type
     * @returns {Function}
     */


    function getPullRequests(type, _ref) {
        var _ref$limit = _ref.limit,
            limit = _ref$limit === undefined ? DEFAULT_PAGE_SIZE : _ref$limit,
            _ref$statusCode = _ref.statusCode,
            statusCode = _ref$statusCode === undefined ? {} : _ref$statusCode;

        var defaultParams = {
            statusCode: statusCode
        };
        var urlBuilder = _navbuilder2.default.rest().addPathComponents('dashboard', 'pull-requests').withParams({
            avatarSize: _avatar.AvatarSize.MEDIUM,
            order: PullRequestOrdering.PARTICIPANT_STATUS,
            limit: limit
        });

        var url = void 0;
        var request = void 0;
        switch (type) {
            case _pullRequestType.CREATED:
                url = urlBuilder.withParams({
                    state: _enums.PullRequestState.OPEN,
                    role: _enums.ParticipantRole.AUTHOR
                }).build();
                request = (0, _server.rest)(babelHelpers.extends({}, defaultParams, { url: url }));
                break;
            case _pullRequestType.REVIEWING:
                url = urlBuilder.withParams({
                    state: _enums.PullRequestState.OPEN,
                    role: _enums.ParticipantRole.REVIEWER
                }).build();
                request = (0, _server.rest)(babelHelpers.extends({}, defaultParams, { url: url }));
                break;
            case _pullRequestType.CLOSED:
                urlBuilder = urlBuilder.withParams({
                    order: PullRequestOrdering.CLOSED_DATE,
                    closedSince: CLOSED_SINCE,
                    limit: CLOSED_PR_LIMIT
                });

                request = _jquery2.default.when((0, _server.rest)(babelHelpers.extends({}, defaultParams, {
                    url: urlBuilder.withParams({ role: _enums.ParticipantRole.AUTHOR }).build()
                })).then(function (x) {
                    return x;
                }), (0, _server.rest)(babelHelpers.extends({}, defaultParams, {
                    url: urlBuilder.withParams({ role: _enums.ParticipantRole.REVIEWER }).build()
                })).then(function (x) {
                    return x;
                })).then(function (authored, reviewed) {
                    // merge the requests together
                    var closedPRs = (0, _lodash.chain)(authored.values.concat(reviewed.values)).sortBy(function (pr) {
                        return pr.closedDate;
                    }).reverse().take(CLOSED_PR_LIMIT).value();

                    var isLastPage = authored.isLastPage && reviewed.isLastPage && authored.size + reviewed.size <= CLOSED_PR_LIMIT;
                    return {
                        isLastPage: isLastPage,
                        values: closedPRs,
                        size: closedPRs.length
                    };
                });
                break;
        }

        return request;
    }

    var populatePullRequests = exports.populatePullRequests = function populatePullRequests(pullRequests, _ref2) {
        var type = _ref2.type;
        return loadPullRequestsSuccess(pullRequests, { type: type });
    };

    function loadPullRequestsSuccess(payload, _ref3) {
        var type = _ref3.type;

        return {
            type: _actions.LOAD_PULL_REQUESTS_SUCCESS,
            payload: payload,
            meta: type === _pullRequestType.CLOSED ? { type: type, defaultVisibleCount: CLOSED_PR_LIMIT } : { type: type }
        };
    }

    function updatePullRequestsByTypes(countsByType) {
        return function (dispatch) {
            var requests = Object.keys(countsByType).map(function (type) {
                var limit = countsByType[type] <= DEFAULT_PAGE_SIZE ? DEFAULT_PAGE_SIZE : MAX_PAGE_SIZE;
                return getPullRequests(type, {
                    limit: limit,
                    statusCode: { '*': false }
                }).then(function (x) {
                    return {
                        payload: x,
                        type: type
                    };
                });
            });
            return _jquery2.default.when.apply(_jquery2.default, babelHelpers.toConsumableArray(requests)).done(function () {
                for (var _len = arguments.length, results = Array(_len), _key = 0; _key < _len; _key++) {
                    results[_key] = arguments[_key];
                }

                results.forEach(function (result) {
                    dispatch(loadPullRequestsSuccess(result.payload, result));
                });
            });
        };
    }
});