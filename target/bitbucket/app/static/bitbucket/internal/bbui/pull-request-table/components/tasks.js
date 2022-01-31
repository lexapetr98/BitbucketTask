define('bitbucket/internal/bbui/pull-request-table/components/tasks', ['module', 'exports', '@atlassian/aui', 'prop-types', 'react', 'bitbucket/internal/widget/icons/icons', './count-cell'], function (module, exports, _aui, _propTypes, _react, _icons, _countCell) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _countCell2 = babelHelpers.interopRequireDefault(_countCell);

    var propTypes = {
        pullRequest: _propTypes2.default.object.isRequired
    };

    var Tasks = function (_Component) {
        babelHelpers.inherits(Tasks, _Component);

        function Tasks() {
            babelHelpers.classCallCheck(this, Tasks);
            return babelHelpers.possibleConstructorReturn(this, (Tasks.__proto__ || Object.getPrototypeOf(Tasks)).apply(this, arguments));
        }

        babelHelpers.createClass(Tasks, [{
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(newProps) {
                return this.props.pullRequest.properties.openTaskCount !== newProps.pullRequest.properties.openTaskCount;
            }
        }, {
            key: 'render',
            value: function render() {
                var pullRequest = this.props.pullRequest;
                return _react2.default.createElement(_countCell2.default, {
                    count: pullRequest.properties.openTaskCount,
                    tooltip: _aui2.default.I18n.getText('bitbucket.web.tasks.openTaskCount', pullRequest.properties.openTaskCount),
                    className: 'tasks',
                    icon: _react2.default.createElement(
                        _icons.TaskIcon,
                        null,
                        _aui2.default.I18n.getText('bitbucket.web.tasks.openTask.label')
                    )
                });
            }
        }]);
        return Tasks;
    }(_react.Component);

    Tasks.Header = _countCell2.default.Header;
    Tasks.propTypes = propTypes;

    exports.default = Tasks;
    module.exports = exports['default'];
});