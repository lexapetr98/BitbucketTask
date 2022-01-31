define('bitbucket/internal/util/time', ['module', 'exports', '@atlassian/aui', 'lodash', 'moment', 'bitbucket/internal/util/text'], function (module, exports, _aui, _lodash, _moment, _text) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _moment2 = babelHelpers.interopRequireDefault(_moment);

    var _text2 = babelHelpers.interopRequireDefault(_text);

    var hasOwn = Object.prototype.hasOwnProperty;
    var dateFormatCache = {};
    var dateTokenizer = /d{1,2}|'[^']+'|M{1,4}|y{2,4}|h{1,2}|H{1,2}|m{2}|s{2}|S{1,4}|Z{1,2}|z{1,2}|a|:|-|\/|\s+/g;

    function Type(str, isAge) {
        this.key = str;
        this.isAge = isAge;
    }

    Type.types = ['shortAge', 'longAge', 'short', 'long', 'full', 'timestamp'].reduce(function (types, type) {
        types[type] = new Type(type, (0, _lodash.includes)(type.toLowerCase(), 'age'));
        return types;
    }, {});

    function getTextForRelativeAge(age, type, param, customMapping) {
        if (customMapping) {
            return getTextForCustomAge(age, param, customMapping);
        }

        return type === Type.types.shortAge ? getTextForShortAge(age, param) : getTextForLongAge(age, param);
    }

    function getTextForShortAge(age, param) {
        switch (age) {
            case 'absolute':
                return param;
            case 'aMomentAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.short.a.moment.ago');
            case 'oneMinuteAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.short.one.minute.ago');
            case 'xMinutesAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.short.x.minutes.ago', param);
            case 'oneHourAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.short.one.hour.ago');
            case 'xHoursAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.short.x.hours.ago', param);
            case 'oneDayAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.short.one.day.ago');
            case 'xDaysAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.short.x.days.ago', param);
            case 'oneWeekAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.short.one.week.ago');
            default:
                return null;
        }
    }

    function getTextForLongAge(age, param) {
        switch (age) {
            case 'absolute':
                return param;
            case 'aMomentAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.long.a.moment.ago');
            case 'oneMinuteAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.long.one.minute.ago');
            case 'xMinutesAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.long.x.minutes.ago', param);
            case 'oneHourAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.long.one.hour.ago');
            case 'xHoursAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.long.x.hours.ago', param);
            case 'oneDayAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.long.one.day.ago');
            case 'xDaysAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.long.x.days.ago', param);
            case 'oneWeekAgo':
                return _aui2.default.I18n.getText('bitbucket.date.format.long.one.week.ago');
            default:
                return null;
        }
    }

    function getTextForCustomAge(age, param, customMapping) {
        switch (age) {
            case 'absolute':
                return customMapping.absolute ? customMapping.absolute(param) : param;
            case 'aMomentAgo':
                return customMapping.aMomentAgo(param);
            case 'oneMinuteAgo':
                return customMapping.oneMinuteAgo(param);
            case 'xMinutesAgo':
                return customMapping.xMinutesAgo(param);
            case 'oneHourAgo':
                return customMapping.oneHourAgo(param);
            case 'xHoursAgo':
                return customMapping.xHoursAgo(param);
            case 'oneDayAgo':
                return customMapping.oneDayAgo(param);
            case 'xDaysAgo':
                return customMapping.xDaysAgo(param);
            case 'oneWeekAgo':
                return customMapping.oneWeekAgo(param);
            default:
                return null;
        }
    }

    function toMomentFormat(javaDateFormat) {
        if (hasOwn.call(dateFormatCache, javaDateFormat)) {
            return dateFormatCache[javaDateFormat];
        }
        var momentDateFormat = '';
        var token;
        dateTokenizer.exec('');
        while (token = dateTokenizer.exec(javaDateFormat)) {
            token = token[0];
            switch (token.charAt(0)) {
                case "'":
                    momentDateFormat += '[' + token.substring(1, token.length - 1) + ']';
                    break;
                case 'd':
                /* falls through */
                case 'y':
                /* falls through */
                case 'a':
                    momentDateFormat += token.toUpperCase();
                    break;
                default:
                    momentDateFormat += token;
            }
        }
        dateFormatCache[javaDateFormat] = momentDateFormat;
        return momentDateFormat;
    }

    function getFormatString(type) {
        /*global date_format: false */
        switch (type.key) {
            case 'short':
            case 'shortAge':
                return date_format('bitbucket.date.format.short');
            case 'long':
            case 'longAge':
                return date_format('bitbucket.date.format.long');
            case 'full':
                return date_format('bitbucket.date.format.full');
            case 'timestamp':
                return date_format('bitbucket.date.format.timestamp');
            default:
                return null;
        }
    }

    function getTimezoneOffset() {
        var contentElement = document.getElementById('content');
        if (contentElement) {
            return parseInt(contentElement.getAttribute('data-timezone'), 10);
        }
        return 0;
    }

    function getFormattedTimezoneOffset(hourMinuteSeparator, optOffset) {
        var offset = typeof optOffset === 'number' ? optOffset : getTimezoneOffset();
        var abs = Math.abs(offset);
        var hour = Math.floor(abs / 60);
        var minute = abs % 60;
        var ret = '';

        ret += offset <= 0 ? '+' : '-'; // flip the sign
        ret += _text2.default.padLeft(hour.toString(), 2, '0');
        ret += hourMinuteSeparator || '';
        ret += _text2.default.padLeft(minute.toString(), 2, '0');
        return ret;
    }

    function localiseTimezone(date, optOffset) {
        var converted = date.clone();
        var offset = typeof optOffset === 'number' ? optOffset : getTimezoneOffset();
        if (-date.utcOffset() !== offset) {
            // set the time correctly for the new timezone
            converted.add(-date.utcOffset() - offset, 'm');
        }
        return converted;
    }

    function isYesterday(now, date) {
        var end = now.clone().add(1, 'd').hours(0).minutes(0).seconds(0).milliseconds(0).subtract(-date.utcOffset() - getTimezoneOffset(), 'm');
        while (end > now) {
            end.subtract(1, 'd');
        }
        var start = end.clone().subtract(1, 'd');
        return start <= date && date < end;
    }

    function getMinutesBetween(start, end) {
        return Math.floor(end.diff(start, 'minutes', true));
    }

    function getHoursBetween(start, end) {
        var hourDiff = end.diff(start, 'hours', true); // Moment's diff does a floor rather than a round so we pass 'true' for a float value
        return Math.round(hourDiff); // Then round it ourself
    }

    function getDaysBetween(start, end) {
        return Math.floor(end.diff(start, 'days', true));
    }

    /**
     * Formats the input date using a named `type`, with an optional offset for timezone handling
     * @param {MomentDate} date - The date to be formatted
     * @param {String} type - either 'shortAge', 'longAge', 'short', 'long', 'full' or 'timestamp'
     * @param {Number} optOffset - the timezone offset
     * @returns {String}
     */
    function formatDateWithFormatString(date, type, optOffset) {
        var offset = typeof optOffset === 'number' ? optOffset : getTimezoneOffset();

        var localisedDate = localiseTimezone(date, offset);

        //We need to replace timezones with the timezone from exports.getTimezoneOffset(), which moment can't do.
        var formatString = toMomentFormat(getFormatString(type)).replace(/Z+/g, function (input) {
            //intentional simplification: treat three or more Zs as ZZ.
            return '[' + getFormattedTimezoneOffset(input.length === 1 ? '' : ':', offset) + ']';
        });

        return localisedDate.format(formatString);
    }

    /**
     * Compares the input date to the current date and returns a relative time
     * @param {MomentDate} date - The date to compare against
     * @param {String} type - either 'shortAge', 'longAge', 'short', 'long', 'full' or 'timestamp'
     * @param {MomentDate} now - the current date, or creates a new moment() instance with the current date.
     * @param {Object} customMapping - and object with methods that override the standard relative age i18n strings
     * @returns {String}
     */
    function formatDateWithRelativeAge(date, type, now, customMapping) {
        now = now || (0, _moment2.default)();

        if (date <= now) {
            if (date > now.clone().subtract(1, 'm')) {
                return getTextForRelativeAge('aMomentAgo', type, null, customMapping);
            } else if (date > now.clone().subtract(2, 'm')) {
                return getTextForRelativeAge('oneMinuteAgo', type, null, customMapping);
            } else if (date > now.clone().subtract(50, 'm')) {
                return getTextForRelativeAge('xMinutesAgo', type, getMinutesBetween(date, now), customMapping);
            } else if (date > now.clone().subtract(90, 'm')) {
                return getTextForRelativeAge('oneHourAgo', type, null, customMapping);
            } else if (isYesterday(now, date) && date < now.clone().subtract(5, 'h')) {
                return getTextForRelativeAge('oneDayAgo', type, null, customMapping);
            } else if (date > now.clone().subtract(1, 'd')) {
                return getTextForRelativeAge('xHoursAgo', type, getHoursBetween(date, now), customMapping);
            } else if (date > now.clone().subtract(7, 'd')) {
                return getTextForRelativeAge('xDaysAgo', type, Math.max(getDaysBetween(date, now), 2), customMapping); // if it's not yesterday then don't say it's one day ago
            } else if (date > now.clone().subtract(8, 'd')) {
                return getTextForRelativeAge('oneWeekAgo', type, null, customMapping);
            }
        }

        return getTextForRelativeAge('absolute', type, formatDateWithFormatString(date, type), customMapping);
    }

    function formatDate(momentDate, type, customMapping) {
        if (momentDate && type) {
            if (type.isAge) {
                return formatDateWithRelativeAge(momentDate, type, null, customMapping);
            }
            return formatDateWithFormatString(momentDate, type);
        }
        return null;
    }

    /**
     * Converts a date into a specified format
     * @param {Date|Number|String} dateOrNumberOrString - the date to format. Supports all formats in {@link http://momentjs.com/docs/#/parsing/|moment.js}
     * @param {String} typeString - either 'shortAge', 'longAge', 'short', 'long', 'full' or 'timestamp'
     * @param {Object} customMapping - and object with methods that override the standard relative age i18n strings
     * @returns {String}
     */
    function format(dateOrNumberOrString, typeString, customMapping) {
        return formatDate(dateOrNumberOrString ? (0, _moment2.default)(dateOrNumberOrString) : null, Type.types[typeString], customMapping);
    }

    exports.default = {
        format: format,
        FormatType: Type,
        getTimezoneOffset: getTimezoneOffset,
        formatDateWithFormatString: formatDateWithFormatString,
        formatDateWithRelativeAge: formatDateWithRelativeAge
    };
    module.exports = exports['default'];
});