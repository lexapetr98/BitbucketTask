define('bitbucket/internal/bbui/ref-label/ref-label', ['module', 'exports', 'prop-types', 'react', '../aui-react/avatar'], function (module, exports, _propTypes, _react, _avatar) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var propTypes = {
        accessibilityText: _propTypes2.default.string,
        repository: _propTypes2.default.any,
        scmRef: _propTypes2.default.any.isRequired,
        title: _propTypes2.default.string
    };

    var RefLabel = function RefLabel(props) {
        var ref = props.scmRef;
        var repo = props.repository;
        var accessibilityText = props.accessibilityText || AJS.I18n.getText('refLabel.branch.ariaLabel', ref.displayId);

        return _react2.default.createElement(
            'span',
            { className: 'ref-label', title: props.title },
            repo && _react2.default.createElement(
                'span',
                { className: 'repository' },
                repo.project && _react2.default.createElement(_avatar.ProjectAvatar, { size: 'xsmall', project: repo.project }),
                _react2.default.createElement(
                    'span',
                    { className: 'name' },
                    repo.name
                )
            ),
            _react2.default.createElement(
                'span',
                { className: 'ref ' + (ref.type || 'branch') },
                _react2.default.createElement(
                    'span',
                    { className: 'name', 'aria-label': accessibilityText },
                    ref.displayId
                )
            )
        );
    };

    RefLabel.propTypes = propTypes;

    exports.default = RefLabel;
    module.exports = exports['default'];
});