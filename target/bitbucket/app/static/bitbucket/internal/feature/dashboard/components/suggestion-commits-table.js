define('bitbucket/internal/feature/dashboard/components/suggestion-commits-table', ['exports', '@atlassian/aui', 'react', 'bitbucket/util/navbuilder', 'bitbucket/internal/util/parse-commit-message', 'bitbucket/internal/util/time'], function (exports, _aui, _react, _navbuilder, _parseCommitMessage, _time) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SuggestionCommitsTable = undefined;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _parseCommitMessage2 = babelHelpers.interopRequireDefault(_parseCommitMessage);

    var SuggestionCommitRow = function SuggestionCommitRow(_ref) {
        var project = _ref.project,
            repository = _ref.repository,
            commit = _ref.commit,
            customTimeMapping = _ref.customTimeMapping,
            visible = _ref.visible;

        var message = _parseCommitMessage2.default.splitIntoSubjectAndBody(commit.message);
        return _react2.default.createElement(
            'tr',
            null,
            _react2.default.createElement(
                'td',
                { className: 'commit' },
                _react2.default.createElement(
                    'a',
                    {
                        className: 'commitid',
                        href: _navbuilder2.default.project(project).repo(repository).commit(commit.id).build(),
                        'data-commitid': commit.id,
                        'data-commit-message': commit.message,
                        tabIndex: visible ? null : -1
                    },
                    commit.displayId
                )
            ),
            _react2.default.createElement(
                'td',
                { className: 'message' },
                _react2.default.createElement(
                    'span',
                    { className: 'message-subject', title: commit.message },
                    message.subject
                ),
                _react2.default.createElement(
                    'span',
                    { className: 'message-body', title: commit.message },
                    message.body
                )
            ),
            _react2.default.createElement(
                'td',
                { className: 'timestamp' },
                _react2.default.createElement(
                    'time',
                    {
                        title: (0, _time.format)(commit.authorTimestamp, 'full', customTimeMapping),
                        dateTime: (0, _time.format)(commit.authorTimestamp, 'timestamp', customTimeMapping)
                    },
                    (0, _time.format)(commit.authorTimestamp, 'shortAge', customTimeMapping)
                )
            )
        );
    };

    var SuggestionCommitsTable = exports.SuggestionCommitsTable = function SuggestionCommitsTable(_ref2) {
        var project = _ref2.project,
            repository = _ref2.repository,
            commits = _ref2.commits,
            open = _ref2.open;

        return _react2.default.createElement(
            'div',
            { className: 'suggested-commits-table', 'aria-hidden': !open },
            _react2.default.createElement(
                'span',
                { className: 'commits-count' },
                commits.length < 5 ? _aui.I18n.getText('bitbucket.web.dashboard.pullrequest.suggestions.commit.count', commits.length) : _aui.I18n.getText('bitbucket.web.dashboard.pullrequest.suggestions.commit.max.count')
            ),
            _react2.default.createElement(
                'table',
                { className: 'commits-table aui' },
                _react2.default.createElement(
                    'tbody',
                    null,
                    commits.map(function (commit) {
                        return _react2.default.createElement(SuggestionCommitRow, {
                            key: commit.id,
                            project: project,
                            repository: repository,
                            commit: commit,
                            visible: open
                        });
                    })
                )
            )
        );
    };
});