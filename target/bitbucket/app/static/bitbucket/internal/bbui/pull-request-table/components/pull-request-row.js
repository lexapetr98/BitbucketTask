define('bitbucket/internal/bbui/pull-request-table/components/pull-request-row', ['module', 'exports', 'classnames', 'prop-types', 'react'], function (module, exports, _classnames, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var propTypes = {
        children: _propTypes2.default.node.isRequired,
        focused: _propTypes2.default.bool,
        prNeedsWork: _propTypes2.default.bool
    };

    var PullRequestRow = function PullRequestRow(props) {
        return _react2.default.createElement(
            'tr',
            {
                className: (0, _classnames2.default)('pull-request-row', {
                    focused: props.focused,
                    prNeedsWork: props.prNeedsWork
                })
            },
            props.children
        );
    };

    PullRequestRow.propTypes = propTypes;

    exports.default = PullRequestRow;
    module.exports = exports['default'];
});