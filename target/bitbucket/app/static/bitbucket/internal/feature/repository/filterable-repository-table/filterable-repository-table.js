define('bitbucket/internal/feature/repository/filterable-repository-table/filterable-repository-table', ['exports', '@atlassian/aui', 'classnames', 'prop-types', 'react', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/enums', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/highlight', 'bitbucket/internal/widget/filterable-entity-table/filterable-entity-table', 'bitbucket/internal/widget/icons/icons'], function (exports, _aui, _classnames, _propTypes, _react, _navbuilder, _avatar, _enums, _analytics, _highlight, _filterableEntityTable, _icons) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.RepositoryRow = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _highlight2 = babelHelpers.interopRequireDefault(_highlight);

    var _filterableEntityTable2 = babelHelpers.interopRequireDefault(_filterableEntityTable);

    var ProjectWithAvatar = function ProjectWithAvatar(_ref) {
        var filter = _ref.filter,
            onClick = _ref.onClick,
            project = _ref.project;

        var isNormalProject = project.type === _enums.ProjectType.NORMAL;

        return _react2.default.createElement(
            'span',
            { className: 'project-name' },
            _react2.default.createElement(_avatar.Avatar, {
                avatarSrc: project.avatarUrl,
                size: _avatar.AvatarTShirtSize.SMALL,
                isProject: isNormalProject
            }),
            _react2.default.createElement(
                'a',
                {
                    href: _navbuilder2.default.project(project).build(),
                    onClick: onClick ? function () {
                        return onClick(project);
                    } : null
                },
                _react2.default.createElement(_highlight2.default, { text: project.name, query: filter })
            )
        );
    };

    var RepositoryIcon = function RepositoryIcon(_ref2) {
        var origin = _ref2.origin;

        if (origin) {
            return _react2.default.createElement(
                _icons.ForkSmallIcon,
                {
                    className: 'repository-icon',
                    title: _aui.I18n.getText('bitbucket.web.repository.is.a.fork.of', origin.project.name, origin.name)
                },
                _aui.I18n.getText('bitbucket.web.repository.repository.forked')
            );
        }

        return _react2.default.createElement(
            _icons.RepositorySmallIcon,
            { className: 'repository-icon' },
            _aui.I18n.getText('bitbucket.web.repository.repository')
        );
    };

    var PublicLozenge = function PublicLozenge() {
        return _react2.default.createElement(
            'span',
            { className: 'aui-lozenge aui-lozenge-subtle public-lozenge' },
            _aui.I18n.getText('bitbucket.web.repository.public.lozenge')
        );
    };

    /*eslint-disable react/prefer-stateless-function*/

    var RepositoryRow = exports.RepositoryRow = function (_PureComponent) {
        babelHelpers.inherits(RepositoryRow, _PureComponent);

        function RepositoryRow() {
            babelHelpers.classCallCheck(this, RepositoryRow);
            return babelHelpers.possibleConstructorReturn(this, (RepositoryRow.__proto__ || Object.getPrototypeOf(RepositoryRow)).apply(this, arguments));
        }

        babelHelpers.createClass(RepositoryRow, [{
            key: 'render',
            value: function render() {
                var _props = this.props,
                    filter = _props.filter,
                    focused = _props.focused,
                    onProjectClick = _props.onProjectClick,
                    onRepoClick = _props.onRepoClick,
                    primaryRefCallback = _props.primaryRefCallback,
                    repository = _props.repository,
                    showProject = _props.showProject,
                    showPublic = _props.showPublic;


                return _react2.default.createElement(
                    'tr',
                    { className: (0, _classnames2.default)({ focused: focused }) },
                    _react2.default.createElement(
                        'td',
                        null,
                        showProject ? _react2.default.createElement(ProjectWithAvatar, {
                            filter: filter,
                            project: repository.project,
                            onClick: onProjectClick
                        }) : _react2.default.createElement(RepositoryIcon, repository),
                        _react2.default.createElement(
                            'span',
                            { className: 'repository-name' },
                            _react2.default.createElement(
                                'a',
                                {
                                    href: _navbuilder2.default.project(repository.project).repo(repository).build(),
                                    onClick: onRepoClick ? function () {
                                        return onRepoClick(repository);
                                    } : null,
                                    ref: function ref(el) {
                                        return primaryRefCallback ? primaryRefCallback(el) : null;
                                    }
                                },
                                _react2.default.createElement(_highlight2.default, { text: repository.name, query: filter })
                            )
                        ),
                        showPublic && (repository.public || repository.project.public) && _react2.default.createElement(PublicLozenge, null)
                    )
                );
            }
        }]);
        return RepositoryRow;
    }(_react.PureComponent);

    RepositoryRow.propTypes = {
        focused: _propTypes2.default.bool,
        onProjectClick: _propTypes2.default.func,
        onRepoClick: _propTypes2.default.func,
        primaryRefCallback: _propTypes2.default.func,
        repository: _propTypes2.default.object,
        showProject: _propTypes2.default.bool,
        showPublic: _propTypes2.default.bool
    };
    RepositoryRow.defaultProps = {
        showProject: false,
        showPublic: true
    };

    var FilterableRepositoryTable = function (_FilterableEntityTabl) {
        babelHelpers.inherits(FilterableRepositoryTable, _FilterableEntityTabl);

        function FilterableRepositoryTable() {
            var _ref3;

            var _temp, _this2, _ret;

            babelHelpers.classCallCheck(this, FilterableRepositoryTable);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this2 = babelHelpers.possibleConstructorReturn(this, (_ref3 = FilterableRepositoryTable.__proto__ || Object.getPrototypeOf(FilterableRepositoryTable)).call.apply(_ref3, [this].concat(args))), _this2), _this2.onProjectClick = function (project) {
                var _this2$props = _this2.props,
                    filter = _this2$props.filter,
                    onProjectClick = _this2$props.onProjectClick;


                onProjectClick && onProjectClick(project, filter);
            }, _this2.onRepoClick = function (repository) {
                var _this2$props2 = _this2.props,
                    entities = _this2$props2.entities,
                    filter = _this2$props2.filter,
                    onRepoClick = _this2$props2.onRepoClick;


                onRepoClick && onRepoClick(repository, filter, entities);

                //Legacy event, avoid using
                _analytics2.default.add('repository-list.item.clicked', {
                    'repository.id': repository.id,
                    'project.id': repository.project.id
                });
            }, _this2.row = function (_ref4) {
                var repository = _ref4.item,
                    focused = _ref4.focused,
                    primaryRefCallback = _ref4.primaryRefCallback;
                return _react2.default.createElement(RepositoryRow, {
                    filter: _this2.props.filter,
                    focused: focused,
                    key: repository.id,
                    onProjectClick: _this2.onProjectClick,
                    onRepoClick: _this2.onRepoClick,
                    repository: repository,
                    showProject: _this2.props.showProject,
                    showPublic: _this2.props.showPublic,
                    primaryRefCallback: primaryRefCallback
                });
            }, _temp), babelHelpers.possibleConstructorReturn(_this2, _ret);
        }

        return FilterableRepositoryTable;
    }(_filterableEntityTable2.default);

    FilterableRepositoryTable.propTypes = babelHelpers.extends({}, _filterableEntityTable2.default.propTypes, {
        onProjectClick: _propTypes2.default.func,
        onRepoClick: _propTypes2.default.func,
        showProject: _propTypes2.default.bool,
        showPublic: _propTypes2.default.bool
    });
    FilterableRepositoryTable.defaultProps = babelHelpers.extends({}, _filterableEntityTable2.default.defaultProps, {
        className: 'filterable-repository-table',
        header: function header() {
            return _react2.default.createElement(
                'tr',
                null,
                _react2.default.createElement(
                    'th',
                    null,
                    _aui.I18n.getText('bitbucket.web.repository.col.name')
                )
            );
        },
        lastPageMessage: _aui.I18n.getText('bitbucket.web.repository.allfetched'),
        loadMoreMessage: _aui.I18n.getText('bitbucket.web.repository.loadmore'),
        noItemsMessage: _aui.I18n.getText('bitbucket.web.repository.nonefound'),
        showProject: false,
        showPublic: true,
        filterPlaceholder: _aui.I18n.getText('bitbucket.web.repository.filter.placeholder')
    });
    exports.default = FilterableRepositoryTable;
});