define('bitbucket/internal/feature/pull-request/state-lozenge', ['module', 'exports', '@atlassian/aui', 'classnames', 'prop-types', 'react', 'bitbucket/internal/enums', 'bitbucket/internal/util/time'], function (module, exports, _aui, _classnames, _propTypes, _react, _enums, _time) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _customMapping;

    var propTypes = {
        pullRequest: _propTypes2.default.object.isRequired
    };

    var customMapping = (_customMapping = {}, babelHelpers.defineProperty(_customMapping, _enums.PullRequestState.DECLINED, {
        aMomentAgo: function aMomentAgo() {
            return _aui.I18n.getText('bitbucket.web.pullrequest.declined.date.format.a.moment.ago');
        },
        oneMinuteAgo: function oneMinuteAgo() {
            return _aui.I18n.getText('bitbucket.web.pullrequest.declined.date.format.one.minute.ago');
        },
        xMinutesAgo: function xMinutesAgo(param) {
            return _aui.I18n.getText('bitbucket.web.pullrequest.declined.date.format.x.minutes.ago', param);
        },
        oneHourAgo: function oneHourAgo() {
            return _aui.I18n.getText('bitbucket.web.pullrequest.declined.date.format.one.hour.ago');
        },
        xHoursAgo: function xHoursAgo(param) {
            return _aui.I18n.getText('bitbucket.web.pullrequest.declined.date.format.x.hours.ago', param);
        },
        oneDayAgo: function oneDayAgo() {
            return _aui.I18n.getText('bitbucket.web.pullrequest.declined.date.format.one.day.ago');
        },
        xDaysAgo: function xDaysAgo(param) {
            return _aui.I18n.getText('bitbucket.web.pullrequest.declined.date.format.x.days.ago', param);
        },
        oneWeekAgo: function oneWeekAgo() {
            return _aui.I18n.getText('bitbucket.web.pullrequest.declined.date.format.one.week.ago');
        },
        absolute: function absolute(param) {
            return _aui.I18n.getText('bitbucket.web.pullrequest.declined.date.format.absolute', param);
        }
    }), babelHelpers.defineProperty(_customMapping, _enums.PullRequestState.MERGED, {
        aMomentAgo: function aMomentAgo() {
            return _aui.I18n.getText('bitbucket.web.pullrequest.merged.date.format.a.moment.ago');
        },
        oneMinuteAgo: function oneMinuteAgo() {
            return _aui.I18n.getText('bitbucket.web.pullrequest.merged.date.format.one.minute.ago');
        },
        xMinutesAgo: function xMinutesAgo(param) {
            return _aui.I18n.getText('bitbucket.web.pullrequest.merged.date.format.x.minutes.ago', param);
        },
        oneHourAgo: function oneHourAgo() {
            return _aui.I18n.getText('bitbucket.web.pullrequest.merged.date.format.one.hour.ago');
        },
        xHoursAgo: function xHoursAgo(param) {
            return _aui.I18n.getText('bitbucket.web.pullrequest.merged.date.format.x.hours.ago', param);
        },
        oneDayAgo: function oneDayAgo() {
            return _aui.I18n.getText('bitbucket.web.pullrequest.merged.date.format.one.day.ago');
        },
        xDaysAgo: function xDaysAgo(param) {
            return _aui.I18n.getText('bitbucket.web.pullrequest.merged.date.format.x.days.ago', param);
        },
        oneWeekAgo: function oneWeekAgo() {
            return _aui.I18n.getText('bitbucket.web.pullrequest.merged.date.format.one.week.ago');
        },
        absolute: function absolute(param) {
            return _aui.I18n.getText('bitbucket.web.pullrequest.merged.date.format.absolute', param);
        }
    }), _customMapping);

    var StateLozenge = function StateLozenge(_ref) {
        var pullRequest = _ref.pullRequest;

        var lozengeType = void 0;
        if (pullRequest.state === _enums.PullRequestState.MERGED) {
            lozengeType = 'success';
        } else if (pullRequest.state === _enums.PullRequestState.DECLINED) {
            lozengeType = 'error';
        }

        if (lozengeType) {
            return _react2.default.createElement(
                'span',
                {
                    className: (0, _classnames2.default)('aui-lozenge', 'aui-lozenge-subtle', 'aui-lozenge-' + lozengeType),
                    title: (0, _time.format)(pullRequest.closedDate, 'shortAge', customMapping[pullRequest.state])
                },
                pullRequest.state
            );
        }

        return null;
    };
    StateLozenge.propTypes = propTypes;

    exports.default = StateLozenge;
    module.exports = exports['default'];
});