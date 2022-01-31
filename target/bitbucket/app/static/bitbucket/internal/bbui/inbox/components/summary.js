define('bitbucket/internal/bbui/inbox/components/summary', ['module', 'exports', '@atlassian/aui', 'prop-types', 'react', 'bitbucket/internal/impl/urls', 'bitbucket/internal/widget/icons/icons'], function (module, exports, _aui, _propTypes, _react, _urls, _icons) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _urls2 = babelHelpers.interopRequireDefault(_urls);

    var Summary = function (_Component) {
        babelHelpers.inherits(Summary, _Component);

        function Summary() {
            babelHelpers.classCallCheck(this, Summary);
            return babelHelpers.possibleConstructorReturn(this, (Summary.__proto__ || Object.getPrototypeOf(Summary)).apply(this, arguments));
        }

        babelHelpers.createClass(Summary, [{
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(newProps) {
                return this.props.pullRequest.id !== newProps.pullRequest.id || this.props.pullRequest.title !== newProps.pullRequest.title || this.props.pullRequest.toRef.id !== newProps.pullRequest.toRef.id || this.props.pullRequest.updatedDate !== newProps.pullRequest.updatedDate;
            }
        }, {
            key: 'render',
            value: function render() {
                var pullRequest = this.props.pullRequest;
                return _react2.default.createElement(
                    'td',
                    { className: 'summary' },
                    _react2.default.createElement(
                        'div',
                        { className: 'title-and-target-branch' },
                        _react2.default.createElement(
                            'a',
                            {
                                className: 'pull-request-title',
                                title: pullRequest.title,
                                href: _urls2.default.inboxPullRequest(pullRequest.toRef.repository.project, pullRequest.toRef.repository, pullRequest)
                            },
                            pullRequest.title
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'pull-request-project-repo' },
                        _react2.default.createElement(
                            'span',
                            { className: 'project-name' },
                            pullRequest.toRef.repository.project.name
                        ),
                        _react2.default.createElement(_icons.ChevronRightIcon, null),
                        _react2.default.createElement(
                            'span',
                            { className: 'repo-name' },
                            pullRequest.toRef.repository.name
                        )
                    )
                );
            }
        }]);
        return Summary;
    }(_react.Component);

    Summary.propTypes = {
        pullRequest: _propTypes2.default.object.isRequired
    };


    Summary.Header = function () {
        return _react2.default.createElement(
            'th',
            { className: 'summary', scope: 'col' },
            _aui2.default.I18n.getText('bitbucket.pull.request.table.title.summary')
        );
    };

    exports.default = Summary;
    module.exports = exports['default'];
});