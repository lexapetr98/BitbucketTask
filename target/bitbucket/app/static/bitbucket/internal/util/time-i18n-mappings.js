define('bitbucket/internal/util/time-i18n-mappings', ['module', 'exports', '@atlassian/aui'], function (module, exports, _aui) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var commentEditedAgeMapping = {
        aMomentAgo: function aMomentAgo() {
            return _aui2.default.I18n.getText('bitbucket.date.format.edited.a.moment.ago');
        },
        oneMinuteAgo: function oneMinuteAgo() {
            return _aui2.default.I18n.getText('bitbucket.date.format.edited.one.minute.ago');
        },
        xMinutesAgo: function xMinutesAgo(param) {
            return _aui2.default.I18n.getText('bitbucket.date.format.edited.x.minutes.ago', param);
        },
        oneHourAgo: function oneHourAgo() {
            return _aui2.default.I18n.getText('bitbucket.date.format.edited.one.hour.ago');
        },
        xHoursAgo: function xHoursAgo(param) {
            return _aui2.default.I18n.getText('bitbucket.date.format.edited.x.hours.ago', param);
        },
        oneDayAgo: function oneDayAgo() {
            return _aui2.default.I18n.getText('bitbucket.date.format.edited.one.day.ago');
        },
        xDaysAgo: function xDaysAgo(param) {
            return _aui2.default.I18n.getText('bitbucket.date.format.edited.x.days.ago', param);
        },
        oneWeekAgo: function oneWeekAgo() {
            return _aui2.default.I18n.getText('bitbucket.date.format.edited.one.week.ago');
        },
        absolute: function absolute(param) {
            return _aui2.default.I18n.getText('bitbucket.date.format.edited.absolute', param);
        }
    };

    exports.default = {
        commentEditedAge: commentEditedAgeMapping
    };
    module.exports = exports['default'];
});