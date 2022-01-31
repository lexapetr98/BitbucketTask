define('bitbucket/internal/model/participant-collection', ['module', 'exports', 'backbone-brace', 'lodash', 'bitbucket/internal/model/participant'], function (module, exports, _backboneBrace, _lodash, _participant) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _participant2 = babelHelpers.interopRequireDefault(_participant);

    var approvalOrder = {
        APPROVED: 1,
        NEEDS_WORK: 2,
        UNAPPROVED: 3
    };

    exports.default = _backboneBrace2.default.Collection.extend({
        model: _participant2.default,
        /* This is also used by SortParticipantsFunction */
        comparator: function comparator(a, b) {
            return approvalOrder[a.getStatus()] - approvalOrder[b.getStatus()] || a.getUser().getDisplayName().localeCompare(b.getUser().getDisplayName());
        },
        findByUser: function findByUser(user) {
            return _lodash2.default.find(this.models, function (participant) {
                return participant.getUser().getName() === user.getName();
            });
        }
    });
    module.exports = exports['default'];
});