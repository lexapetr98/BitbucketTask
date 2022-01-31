define('bitbucket/internal/widget/duration', ['module', 'exports', '@atlassian/aui', 'react'], function (module, exports, _aui, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _toUnits = function _toUnits(value, _ref, ret) {
        var _ref2 = babelHelpers.toArray(_ref),
            _ref2$ = babelHelpers.slicedToArray(_ref2[0], 2),
            label = _ref2$[0],
            unitValue = _ref2$[1],
            units = _ref2.slice(1);

        ret[label] = Math.floor(value / unitValue);
        if (!units.length) {
            return ret;
        }
        return _toUnits(value % unitValue, units, ret);
    };

    var asUnits = function asUnits(units) {
        var orderedUnits = Object.entries(units).sort(function (a, b) {
            return b[1] - a[1];
        }); // largest to smallest
        return function (value) {
            return _toUnits(value, orderedUnits, {});
        };
    };

    var asTimeUnits = asUnits({
        s: 1000,
        m: 1000 * 60,
        h: 1000 * 60 * 60,
        d: 1000 * 60 * 60 * 24
    });

    var Duration = function Duration(_ref3) {
        var durationMillis = _ref3.durationMillis,
            className = _ref3.className;

        var units = asTimeUnits(durationMillis);
        var iso8601Duration = 'P' + (units.d || '') + 'T' + (units.h | 0) + 'H' + (units.m | 0) + 'M' + (units.s | 0) + 'S';
        var prettyUnits = [units.d && _aui.I18n.getText('bitbucket.web.duration.unit.days', units.d), units.h && _aui.I18n.getText('bitbucket.web.duration.unit.hours', units.h), units.m && _aui.I18n.getText('bitbucket.web.duration.unit.minutes.short', units.m), _aui.I18n.getText('bitbucket.web.duration.unit.seconds', units.s)].filter(function (a) {
            return a;
        });
        return _react2.default.createElement(
            'time',
            { dateTime: iso8601Duration, title: prettyUnits.join(' '), className: className },
            prettyUnits[0]
        );
    };

    exports.default = Duration;
    module.exports = exports['default'];
});