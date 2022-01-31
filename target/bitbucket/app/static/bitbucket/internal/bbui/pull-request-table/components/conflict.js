define('bitbucket/internal/bbui/pull-request-table/components/conflict', ['module', 'exports', '@atlassian/aui', 'classnames', 'prop-types', 'react', 'bitbucket/internal/enums'], function (module, exports, _aui, _classnames, _propTypes, _react, _enums) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var propTypes = {
        pullRequest: _propTypes2.default.object.isRequired
    };

    var cellClassName = 'conflict';

    var Conflict = function Conflict(_ref) {
        var pullRequest = _ref.pullRequest;

        var _ref2 = pullRequest.properties.mergeResult || {},
            outcome = _ref2.outcome,
            current = _ref2.current;

        return _react2.default.createElement(
            'td',
            { className: cellClassName },
            outcome === _enums.MergeOutcome.CONFLICTED && pullRequest.state === _enums.PullRequestState.OPEN && _react2.default.createElement(
                'span',
                {
                    className: (0, _classnames2.default)('aui-lozenge', 'aui-lozenge-moved', 'conflicted', {
                        'aui-lozenge-subtle': !current
                    }),
                    title: current ? _aui.I18n.getText('bitbucket.web.pullrequest.conflict.tooltip') : _aui.I18n.getText('bitbucket.web.pullrequest.conflict.tooltip.cached')
                },
                _aui.I18n.getText('bitbucket.web.pullrequest.conflict')
            )
        );
    };

    Conflict.Header = function () {
        return _react2.default.createElement('th', { className: cellClassName });
    };
    Conflict.propTypes = propTypes;

    exports.default = Conflict;
    module.exports = exports['default'];
});