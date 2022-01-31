define('bitbucket/internal/feature/dashboard/components/pull-request-suggestion', ['module', 'exports', '@atlassian/aui', 'classnames', 'react', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/aui-react/spinner', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/time', 'bitbucket/internal/widget/icons/icons', '../components/suggestion-commits-table', './pull-request-suggestion-web-section'], function (module, exports, _aui, _classnames, _react, _navbuilder, _spinner, _analytics, _time, _icons, _suggestionCommitsTable, _pullRequestSuggestionWebSection) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _spinner2 = babelHelpers.interopRequireDefault(_spinner);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var customMapping = {
        aMomentAgo: function aMomentAgo() {
            return _aui.I18n.getText('bitbucket.web.dashboard.pullrequest.suggestions.updated.date.format.a.moment.ago');
        },
        oneMinuteAgo: function oneMinuteAgo() {
            return _aui.I18n.getText('bitbucket.web.dashboard.pullrequest.suggestions.updated.date.format.one.minute.ago');
        },
        xMinutesAgo: function xMinutesAgo(param) {
            return _aui.I18n.getText('bitbucket.web.dashboard.pullrequest.suggestions.updated.date.format.x.minutes.ago', param);
        },
        oneHourAgo: function oneHourAgo() {
            return _aui.I18n.getText('bitbucket.web.dashboard.pullrequest.suggestions.updated.date.format.one.hour.ago');
        },
        xHoursAgo: function xHoursAgo(param) {
            return _aui.I18n.getText('bitbucket.web.dashboard.pullrequest.suggestions.updated.date.format.x.hours.ago', param);
        },
        oneDayAgo: function oneDayAgo() {
            return _aui.I18n.getText('bitbucket.web.dashboard.pullrequest.suggestions.updated.date.format.one.day.ago');
        },
        xDaysAgo: function xDaysAgo(param) {
            return _aui.I18n.getText('bitbucket.web.dashboard.pullrequest.suggestions.updated.date.format.x.days.ago', param);
        },
        oneWeekAgo: function oneWeekAgo() {
            return _aui.I18n.getText('bitbucket.web.dashboard.pullrequest.suggestions.updated.date.format.one.week.ago');
        }
    };

    var onDescriptionClick = function onDescriptionClick(e) {
        if (e.target.classList.contains('recent-branch-name')) {
            _analytics2.default.add('dashboard.pullrequest-suggestion.branch-name.clicked');
        }
    };

    var onCreateClick = function onCreateClick(changeTime) {
        _analytics2.default.add('dashboard.pullrequest-suggestion.pullrequest-create.clicked', {
            pushAge: Date.now() - changeTime
        });
    };

    function _default(_ref) {
        var suggestion = _ref.suggestion,
            _onClick = _ref.onClick,
            webSections = _ref.webSections;
        var _suggestion$open = suggestion.open,
            open = _suggestion$open === undefined ? false : _suggestion$open,
            _suggestion$loading = suggestion.loading,
            loading = _suggestion$loading === undefined ? false : _suggestion$loading,
            _suggestion$commits = suggestion.commits,
            commits = _suggestion$commits === undefined ? [] : _suggestion$commits,
            repository = suggestion.repository;

        var project = repository.project;
        var baseUrl = _navbuilder2.default.project(project).repo(repository);
        var compareLink = aui.buttons.button({
            href: baseUrl.compare().sourceBranch(suggestion.refChange.ref.id).build(),
            text: suggestion.refChange.ref.displayId,
            type: 'link',
            extraClasses: 'recent-branch-name'
        });
        var fullRepoName = bitbucket.internal.feature.repository.repositoryItemContent({
            repository: repository
        });

        return _react2.default.createElement(
            'div',
            {
                className: (0, _classnames2.default)('pull-request-suggestion', {
                    'show-commit-details': open,
                    'loading-commit-details': loading
                })
            },
            _react2.default.createElement(
                'table',
                { className: 'suggestion-details' },
                _react2.default.createElement(
                    'tbody',
                    null,
                    _react2.default.createElement(
                        'tr',
                        null,
                        _react2.default.createElement(
                            'td',
                            { className: 'table-expander-wrapper' },
                            _react2.default.createElement(
                                'button',
                                {
                                    className: 'table-expander',
                                    onClick: function onClick(e) {
                                        e.preventDefault();
                                        _onClick(suggestion);
                                    }
                                },
                                _react2.default.createElement(_icons.ChevronRightIcon, null)
                            )
                        ),
                        _react2.default.createElement(
                            'td',
                            { className: 'summary' },
                            _react2.default.createElement(
                                'span',
                                { className: 'meta' },
                                _react2.default.createElement('span', {
                                    className: 'description',
                                    onClick: onDescriptionClick,
                                    dangerouslySetInnerHTML: {
                                        __html: _aui.I18n.getText('bitbucket.web.dashboard.pullrequest.suggestions.activity.title', compareLink, fullRepoName)
                                    },
                                    role: 'presentation'
                                }),
                                _react2.default.createElement(
                                    'time',
                                    {
                                        title: (0, _time.format)(suggestion.changeTime, 'full', customMapping),
                                        dateTime: (0, _time.format)(suggestion.changeTime, 'timestamp', customMapping)
                                    },
                                    (0, _time.format)(suggestion.changeTime, 'shortAge', customMapping)
                                )
                            )
                        ),
                        webSections.map(function (section) {
                            return _react2.default.createElement(_pullRequestSuggestionWebSection.WebSectionCell, {
                                key: section.key,
                                webSection: section,
                                suggestion: suggestion
                            });
                        }),
                        _react2.default.createElement(
                            'td',
                            { className: 'create-pr' },
                            _react2.default.createElement(
                                'a',
                                {
                                    href: baseUrl.createPullRequest().sourceBranch(suggestion.refChange.ref.id).build(),
                                    className: 'aui-button',
                                    onClick: function onClick() {
                                        return onCreateClick(suggestion.changeTime);
                                    }
                                },
                                _aui.I18n.getText('bitbucket.web.dashboard.pullrequest.suggestions.create')
                            )
                        )
                    )
                )
            ),
            loading ? _react2.default.createElement(_spinner2.default, { size: _spinner.SpinnerSize.MEDIUM }) : _react2.default.createElement(_suggestionCommitsTable.SuggestionCommitsTable, {
                project: project,
                repository: repository,
                commits: commits,
                customTimeMapping: customMapping,
                open: open
            })
        );
    }
    exports.default = _default;
    module.exports = exports['default'];
});