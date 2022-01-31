define('bitbucket/internal/bbui/pull-request-table/components/count-cell', ['module', 'exports', 'classnames', 'prop-types', 'react', 'bitbucket/internal/util/text'], function (module, exports, _classnames, _propTypes, _react, _text) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var UNCAPPED_MAX = 99;

    var propTypes = {
        count: _propTypes2.default.number,
        icon: _propTypes2.default.node.isRequired,
        tooltip: _propTypes2.default.string.isRequired,
        className: _propTypes2.default.string
    };

    var CountCell = function CountCell(props) {
        return _react2.default.createElement(
            'td',
            { className: (0, _classnames2.default)('count-column-value', props.className) },
            props.count > 0 && _react2.default.createElement(
                'span',
                { title: props.tooltip },
                props.icon,
                _react2.default.createElement(
                    'span',
                    null,
                    ' '
                ),
                _react2.default.createElement(
                    'span',
                    { className: 'count' },
                    (0, _text.capInt)(props.count, UNCAPPED_MAX)
                )
            )
        );
    };

    CountCell.Header = function () {
        return _react2.default.createElement('th', { className: 'count-column' });
    };

    CountCell.propTypes = propTypes;

    CountCell.defaultProps = {
        count: 0
    };

    exports.default = CountCell;
    module.exports = exports['default'];
});