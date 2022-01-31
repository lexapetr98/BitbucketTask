define('bitbucket/internal/widget/time', ['module', 'exports', 'react', 'bitbucket/internal/util/time'], function (module, exports, _react, _time) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _react2 = babelHelpers.interopRequireDefault(_react);

    exports.default = function (_ref) {
        var unixTime = _ref.unixTime,
            type = _ref.type,
            customMapping = _ref.customMapping,
            className = _ref.className;
        return _react2.default.createElement(
            'time',
            {
                dateTime: (0, _time.format)(unixTime, 'timestamp'),
                title: (0, _time.format)(unixTime, 'full'),
                className: className
            },
            (0, _time.format)(unixTime, type, customMapping)
        );
    };

    module.exports = exports['default'];
});