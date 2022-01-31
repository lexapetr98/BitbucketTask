define('bitbucket/internal/model/pull-request', ['module', 'exports', 'backbone-brace', 'bitbucket/internal/model/participant', 'bitbucket/internal/model/participant-collection', 'bitbucket/internal/model/revision-reference'], function (module, exports, _backboneBrace, _participant, _participantCollection, _revisionReference) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _participant2 = babelHelpers.interopRequireDefault(_participant);

    var _participantCollection2 = babelHelpers.interopRequireDefault(_participantCollection);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    exports.default = _backboneBrace2.default.Model.extend({
        namedAttributes: {
            id: null,
            link: null,
            links: Object,
            /**
            * The fromRef is a Ref to the source/from branch. This is the "until"/"new" side of any diff.
            */
            fromRef: _revisionReference2.default,
            /**
            * The toRef is a Ref to the target/to branch. This is the "since"/"old" side of any diff.
            */
            toRef: _revisionReference2.default,
            author: _participant2.default,
            reviewers: _participantCollection2.default,
            participants: _participantCollection2.default,
            state: null,
            open: 'boolean',
            closed: 'boolean',
            locked: 'boolean',
            title: null,
            createdDate: Date,
            updatedDate: Date,
            closedDate: Date,
            version: null,
            description: null,
            descriptionAsHtml: null,
            // attributes has been deprecated for removal in 4.0
            attributes: null,
            properties: null
        },
        addParticipant: function addParticipant(participant) {
            var exists = this.getParticipants().findByUser(participant.getUser());

            if (!exists) {
                this.getParticipants().add(participant);
            }
        }
    }, {
        state: {
            OPEN: 'OPEN',
            MERGED: 'MERGED',
            DECLINED: 'DECLINED'
        }
    });
    module.exports = exports['default'];
});