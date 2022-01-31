define('bitbucket/internal/impl/data-provider/pull-request-list', ['module', 'exports', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/data-provider/pull-request-list', 'bitbucket/internal/util/object'], function (module, exports, _lodash, _navbuilder, _pullRequestList, _object) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pullRequestList2 = babelHelpers.interopRequireDefault(_pullRequestList);

    var _object2 = babelHelpers.interopRequireDefault(_object);

    function PullRequestListDataProvider(options) {
        _pullRequestList2.default.apply(this, arguments);
    }
    _object2.default.inherits(PullRequestListDataProvider, _pullRequestList2.default);

    PullRequestListDataProvider.prototype._getBuilder = function () {
        return _navbuilder2.default.rest().currentRepo().allPullRequests().withParams({
            avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                size: 'medium'
            }),
            order: 'newest'
        }).withParams(filterParams(this.filter));
    };

    PullRequestListDataProvider.prototype._transform = function (data) {
        return data.values || [];
    };

    PullRequestListDataProvider.prototype._errorTransform = function (errors) {
        return errors;
    };

    /**
     * Translate the filter values to REST params.
     * Any null values will not be passed along
     *
     * @param {Object} filter - the current filter state
     * @returns {Object}
     */
    function filterParams(filter) {
        var params = {};

        if (filter.target_ref_id) {
            params.at = filter.target_ref_id;
        }

        if (filter.state) {
            params.state = filter.state;
        }

        var participants = [maybeParticipant('AUTHOR', filter.author_id), maybeParticipant('REVIEWER', filter.reviewer_id)].filter(_lodash2.default.identity);

        participants.forEach(function (participant, i) {
            i++;
            params['role.' + i] = participant.role;
            params['username.' + i] = participant.username;
        });

        function maybeParticipant(role, username) {
            if (!username) {
                return null;
            }
            return {
                role: role,
                username: username
            };
        }

        return params;
    }

    exports.default = PullRequestListDataProvider;
    module.exports = exports['default'];
});