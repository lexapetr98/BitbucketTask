define('bitbucket/internal/widget/avatar-list/avatar-list', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/widget/overflowing-list'], function (module, exports, _jquery, _lodash, _overflowingList) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _overflowingList2 = babelHelpers.interopRequireDefault(_overflowingList);

    function AvatarList(listSelector, participantCollection, options) {
        AvatarList.init();

        options = _jquery2.default.extend({}, AvatarList.defaults, options);

        this._$list = (0, _jquery2.default)(listSelector);

        options.getItemHtml = options.getAvatarHtml;
        this._overflowingList = new _overflowingList2.default(this._$list, participantCollection, options);

        var self = this;

        var approvalHandler = function approvalHandler(participant) {
            var $avatars = self._$list.find(".user-avatar[data-username='" + participant.getUser().getName() + "']");
            $avatars.toggleClass('badge-hidden', !participant.getApproved());
        };

        participantCollection.on('change:approved', approvalHandler);
    }
    AvatarList.defaults = {
        itemSelector: '.participant-item',
        overflowMenuClass: 'aui-style-default aui-dropdown2-tailed avatar-dropdown',
        getAvatarHtml: function getAvatarHtml(participant, isOverflowed) {
            return bitbucket.internal.widget.avatarList.participantAvatar({
                participant: participant.toJSON(),
                extraClasses: 'participant-item',
                withName: isOverflowed
            });
        }
    };

    AvatarList.prototype.contains = function (username) {
        return _lodash2.default.some(this._overflowingList._items, function (participant) {
            return participant.getUser().getName() === username;
        });
    };

    AvatarList.prototype.addAvatar = function (avatarData) {
        this._overflowingList.addItem(avatarData);
    };

    AvatarList.init = function () {
        (0, _jquery2.default)('.avatar-tooltip > .aui-avatar-inner > img').tooltip({
            hoverable: false,
            offset: 5,
            gravity: function gravity() {
                // Always position on screen
                return _jquery2.default.fn.tipsy.autoNS.call(this) + _jquery2.default.fn.tipsy.autoWE.call(this);
            },
            delayIn: 0,
            live: true
        });

        AvatarList.init = _jquery2.default.noop;
    };

    exports.default = AvatarList;
    module.exports = exports['default'];
});