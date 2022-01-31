define('bitbucket/internal/bbui/pull-request-list/pull-request-list', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'prop-types', 'react', 'bitbucket/internal/enums', 'bitbucket/internal/impl/urls', 'bitbucket/internal/widget/icons/icons', '../aui-react/avatar', '../filter-bar/filter-bar', '../pull-request-list-table/pull-request-list-table', './dom-event'], function (module, exports, _aui, _jquery, _lodash, _propTypes, _react, _enums, _urls, _icons, _avatar, _filterBar, _pullRequestListTable, _domEvent) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _enums2 = babelHelpers.interopRequireDefault(_enums);

    var _urls2 = babelHelpers.interopRequireDefault(_urls);

    var _filterBar2 = babelHelpers.interopRequireDefault(_filterBar);

    var _pullRequestListTable2 = babelHelpers.interopRequireDefault(_pullRequestListTable);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var ALL = 'ALL';

    function renderAuthorItem(selectionOrResult, author) {
        var size = selectionOrResult === 'selection' ? 'xsmall' : 'small';
        return _react2.default.createElement(_avatar.UserAvatar, {
            person: author,
            size: size,
            withName: true,
            withEmail: selectionOrResult === 'result',
            className: 'pull-request-list-filter filter-' + selectionOrResult
        });
    }

    function renderBranchItem(selectionOrResult, branch) {
        return _react2.default.createElement(
            'span',
            { className: 'pull-request-list-filter filter-' + selectionOrResult },
            _react2.default.createElement(
                _icons.BranchIcon,
                null,
                _aui2.default.I18n.getText('bitbucket.component.pull.request.list.branch')
            ),
            _react2.default.createElement(
                'span',
                { className: 'name', title: branch.displayId },
                branch.displayId
            )
        );
    }

    var GettingStarted = function GettingStarted(props) {
        return _react2.default.createElement(
            'div',
            { className: 'pull-request-intro' },
            _react2.default.createElement('div', { className: 'intro-image' }),
            _react2.default.createElement(
                'div',
                { className: 'intro-text' },
                _react2.default.createElement(
                    'h3',
                    null,
                    _aui2.default.I18n.getText('bitbucket.component.pull.request.list.intro.title')
                ),
                _react2.default.createElement(
                    'p',
                    null,
                    _aui2.default.I18n.getText('bitbucket.component.pull.request.list.intro.description')
                )
            ),
            _react2.default.createElement(
                'div',
                { className: 'intro-buttons' },
                _react2.default.createElement(
                    'a',
                    {
                        id: 'empty-list-create-pr-button',
                        className: 'aui-button aui-button-primary',
                        href: _urls2.default.createPullRequest(props.repository)
                    },
                    _aui2.default.I18n.getText('bitbucket.component.pull.request.list.intro.button.create')
                ),
                _react2.default.createElement(
                    'a',
                    {
                        id: 'empty-list-help-button',
                        className: 'aui-button aui-button-link help-button',
                        target: '_blank',
                        href: _urls2.default.help('help.pull.request')
                    },
                    _aui2.default.I18n.getText('bitbucket.component.pull.request.list.intro.button.help')
                )
            )
        );
    };
    GettingStarted.propTypes = {
        repository: _propTypes2.default.object
    };

    var NoResults = function NoResults(props) {
        function resetFilters(e) {
            if ((0, _jquery2.default)(e.target).closest('#reset-filters').length && (0, _domEvent2.default)(e)) {
                props.onResetFilters();
                e.preventDefault();
            }
        }
        return _react2.default.createElement(
            'div',
            { className: 'empty-banner-content' },
            _react2.default.createElement(
                'h3',
                null,
                props.filtered ? _aui2.default.I18n.getText('bitbucket.component.pull.request.filtered.no.matches') : _aui2.default.I18n.getText('bitbucket.component.pull.request.none')
            ),
            _react2.default.createElement('p', {
                dangerouslySetInnerHTML: {
                    __html: props.filtered ? _aui2.default.I18n.getText('bitbucket.component.pull.request.filtered.no.matches.description', '<a id="reset-filters" href="' + _urls2.default.allPullRequests(props.repository, ALL) + '">', '</a>') : _aui2.default.I18n.getText('bitbucket.component.pull.request.none.description', '<a href="' + _urls2.default.createPullRequest(props.repository) + '">', '</a>')
                },
                onClick: resetFilters,
                role: 'presentation'
            })
        );
    };
    NoResults.propTypes = {
        filtered: _propTypes2.default.bool.isRequired,
        repository: _propTypes2.default.object,
        onResetFilters: _propTypes2.default.func
    };

    var PullRequestList = function (_Component) {
        babelHelpers.inherits(PullRequestList, _Component);
        babelHelpers.createClass(PullRequestList, null, [{
            key: 'propTypes',
            get: function get() {
                var handledByUs = ['id', 'label'];

                return {
                    allFetched: _propTypes2.default.bool.isRequired,
                    currentUser: _propTypes2.default.any,
                    initialFilter: _propTypes2.default.shape({
                        state: _propTypes2.default.shape(_lodash2.default.omit(_filterBar.Select.propTypes, handledByUs)).isRequired,
                        author: _propTypes2.default.shape(_lodash2.default.omit(_filterBar.AsyncSelect.propTypes, handledByUs)).isRequired,
                        target_ref: _propTypes2.default.shape(_lodash2.default.omit(_filterBar.AsyncSelect.propTypes, handledByUs)).isRequired,
                        reviewer_self: _propTypes2.default.shape(_lodash2.default.omit(_filterBar.Toggle.propTypes, handledByUs)).isRequired
                    }),
                    focusedIndex: _propTypes2.default.number,
                    gettingStarted: _propTypes2.default.bool,
                    loading: _propTypes2.default.bool.isRequired,
                    openPullRequestCallback: _propTypes2.default.func,
                    onFilterChange: _propTypes2.default.func.isRequired,
                    onMorePrsRequested: _propTypes2.default.func.isRequired,
                    pullRequests: _propTypes2.default.array.isRequired,
                    repository: _propTypes2.default.any.isRequired,
                    selectedAuthor: _propTypes2.default.any,
                    selectedTargetBranch: _propTypes2.default.any
                };
            }
        }]);

        function PullRequestList(props) {
            babelHelpers.classCallCheck(this, PullRequestList);

            var _this = babelHelpers.possibleConstructorReturn(this, (PullRequestList.__proto__ || Object.getPrototypeOf(PullRequestList)).call(this, props));

            _this.onFilterChange = _this.onFilterChange.bind(_this);
            _this.onResetFilters = _this.onResetFilters.bind(_this);

            var stateFilter = props.initialFilter.state.value;
            var isFiltered = Boolean(stateFilter && stateFilter !== ALL || (0, _lodash.chain)(props.initialFilter).pick(['author', 'target_ref', 'reviewer_self']).some(function (_ref) {
                var value = _ref.value;
                return value;
            }).value());
            _this.state = {
                isFiltered: isFiltered,
                stateFilter: stateFilter
            };
            return _this;
        }

        babelHelpers.createClass(PullRequestList, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                if (!this.props.pullRequests.length && !this.props.allFetched) {
                    this.props.onMorePrsRequested();
                }
            }
        }, {
            key: 'onFilterChange',
            value: function onFilterChange(newState) {
                var _this2 = this;

                var cleanState = {
                    state: newState['pr-state-filter'],
                    author_id: newState['pr-author-filter'] || null,
                    target_ref_id: newState['pr-target-branch-filter'] || null,
                    reviewer_self: newState['pr-reviewer-self-filter']
                };
                this.setState({
                    isFiltered: cleanState.state !== ALL || !!cleanState.author_id || !!cleanState.target_ref_id || !!cleanState.reviewer_self,
                    stateFilter: cleanState.state
                }, function () {
                    return _this2.props.onFilterChange(cleanState);
                });
            }
        }, {
            key: 'onResetFilters',
            value: function onResetFilters() {
                this._filterBar.set({
                    'pr-author-filter': null,
                    'pr-state-filter': ALL,
                    'pr-target-branch-filter': null,
                    'pr-reviewer-self-filter': false
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                var noPrs = !this.props.loading && this.props.pullRequests.length === 0;
                var children = [];
                if (noPrs && this.props.gettingStarted) {
                    children.push(_react2.default.createElement(GettingStarted, { key: 'getting-started', repository: this.props.repository }));
                } else {
                    children.push(_react2.default.createElement(
                        _filterBar2.default,
                        {
                            key: 'filter-bar',
                            onChange: this.onFilterChange,
                            ref: function ref(el) {
                                return _this3._filterBar = el;
                            }
                        },
                        _react2.default.createElement(_filterBar.Select, babelHelpers.extends({}, this.props.initialFilter.state, {
                            id: 'pr-state-filter',
                            label: _aui2.default.I18n.getText('bitbucket.component.pull.request.list.state'),
                            menu: {
                                items: [{
                                    id: _enums2.default.PullRequestState.OPEN,
                                    text: _aui2.default.I18n.getText('bitbucket.component.pull.request.list.state.open')
                                }, {
                                    id: _enums2.default.PullRequestState.MERGED,
                                    text: _aui2.default.I18n.getText('bitbucket.component.pull.request.list.state.merged')
                                }, {
                                    id: _enums2.default.PullRequestState.DECLINED,
                                    text: _aui2.default.I18n.getText('bitbucket.component.pull.request.list.state.declined')
                                }, {
                                    id: ALL,
                                    text: _aui2.default.I18n.getText('bitbucket.component.pull.request.list.state.all')
                                }]
                            }
                        })),
                        _react2.default.createElement(_filterBar.AsyncSelect, babelHelpers.extends({}, this.props.initialFilter.author, {
                            id: 'pr-author-filter',
                            label: _aui2.default.I18n.getText('bitbucket.component.pull.request.list.author'),
                            searchPlaceholder: _aui2.default.I18n.getText('bitbucket.component.pull.request.list.search.author'),
                            menu: {
                                id: function id(user) {
                                    return user.name;
                                },
                                initSelection: function initSelection($el, callback) {
                                    var username = $el.val();
                                    if (_this3.props.initialFilter.author.value === username) {
                                        return callback(_this3.props.selectedAuthor);
                                    }
                                    throw new Error('Unexpected value \'' + username + '\' when initializing the author filter.');
                                },
                                formatSelection: renderAuthorItem.bind(null, 'selection'),
                                formatResult: renderAuthorItem.bind(null, 'result'),
                                formatNoMatches: function formatNoMatches() {
                                    return _aui2.default.I18n.getText('bitbucket.component.pull.request.list.search.author.nomatches');
                                },
                                placeholder: _aui2.default.I18n.getText('bitbucket.component.pull.request.list.author'),
                                dropdownCssClass: 'pr-author-dropdown'
                            }
                        })),
                        _react2.default.createElement(_filterBar.AsyncSelect, babelHelpers.extends({}, this.props.initialFilter.target_ref, {
                            id: 'pr-target-branch-filter',
                            label: _aui2.default.I18n.getText('bitbucket.component.pull.request.list.branch.target'),
                            searchPlaceholder: _aui2.default.I18n.getText('bitbucket.component.pull.request.list.search.branch'),
                            menu: {
                                initSelection: function initSelection($el, callback) {
                                    var branch = $el.val();
                                    if (_this3.props.initialFilter.target_ref.value === branch) {
                                        return callback(_this3.props.selectedTargetBranch);
                                    }
                                    throw new Error('Unexpected value \'' + branch + '\' when initializing the target branch filter.');
                                },
                                formatSelection: renderBranchItem.bind(null, 'selection'),
                                formatResult: renderBranchItem.bind(null, 'result'),
                                formatNoMatches: function formatNoMatches() {
                                    return _aui2.default.I18n.getText('bitbucket.component.pull.request.list.search.branch.nomatches');
                                },
                                placeholder: _aui2.default.I18n.getText('bitbucket.component.pull.request.list.branch.target'),
                                dropdownCssClass: 'pr-target-branch-dropdown'
                            }
                        })),
                        this.props.currentUser && _react2.default.createElement(_filterBar.Toggle, babelHelpers.extends({}, this.props.initialFilter.reviewer_self, {
                            id: 'pr-reviewer-self-filter',
                            label: _aui2.default.I18n.getText('bitbucket.component.pull.request.list.reviewer.self')
                        }))
                    ));
                    children.push(noPrs ? _react2.default.createElement(NoResults, {
                        key: 'no-results',
                        filtered: this.state.isFiltered,
                        onResetFilters: this.onResetFilters,
                        repository: this.props.repository
                    }) : _react2.default.createElement(_pullRequestListTable2.default, {
                        key: 'table',
                        focusedIndex: this.props.focusedIndex,
                        pullRequests: this.props.pullRequests,
                        allFetched: this.props.allFetched,
                        onMoreItemsRequested: this.props.onMorePrsRequested,
                        openCallback: this.props.openPullRequestCallback,
                        loading: this.props.loading,
                        showStateLozenge: this.state.stateFilter === ALL
                    }));
                }

                return _react2.default.createElement(
                    'div',
                    { className: 'pull-request-list' },
                    children
                );
            }
        }]);
        return PullRequestList;
    }(_react.Component);

    exports.default = PullRequestList;
    module.exports = exports['default'];
});