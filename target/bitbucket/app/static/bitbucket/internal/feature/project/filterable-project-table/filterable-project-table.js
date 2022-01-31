define('bitbucket/internal/feature/project/filterable-project-table/filterable-project-table', ['exports', '@atlassian/aui', 'classnames', 'prop-types', 'react', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/util/highlight', 'bitbucket/internal/widget/filterable-entity-table/filterable-entity-table'], function (exports, _aui, _classnames, _propTypes, _react, _navbuilder, _avatar, _highlight, _filterableEntityTable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ProjectRow = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _highlight2 = babelHelpers.interopRequireDefault(_highlight);

    var _filterableEntityTable2 = babelHelpers.interopRequireDefault(_filterableEntityTable);

    var ProjectWithAvatar = function ProjectWithAvatar(_ref) {
        var filter = _ref.filter,
            onProjectClick = _ref.onProjectClick,
            project = _ref.project,
            refCallback = _ref.refCallback;
        return _react2.default.createElement(
            'span',
            { className: 'project-name' },
            _react2.default.createElement(_avatar.Avatar, {
                avatarSrc: project.avatarUrl,
                size: _avatar.AvatarTShirtSize.SMALL,
                className: 'aui-avatar-project'
            }),
            _react2.default.createElement(
                'a',
                {
                    href: _navbuilder2.default.project(project).build(),
                    onClick: onProjectClick ? function () {
                        return onProjectClick(project);
                    } : null,
                    ref: function ref(el) {
                        return refCallback ? refCallback(el) : null;
                    }
                },
                _react2.default.createElement(_highlight2.default, { text: project.name, query: filter })
            )
        );
    };

    var PublicLozenge = function PublicLozenge() {
        return _react2.default.createElement(
            'span',
            { className: 'aui-lozenge aui-lozenge-subtle public-lozenge' },
            _aui.I18n.getText('bitbucket.web.repository.public.lozenge')
        );
    };

    var Header = function Header() {
        return _react2.default.createElement(
            'tr',
            null,
            _react2.default.createElement(
                'th',
                { className: 'project-name', scope: 'col' },
                _aui.I18n.getText('bitbucket.web.project.col.name')
            ),
            _react2.default.createElement(
                'th',
                { className: 'project-key', scope: 'col' },
                _aui.I18n.getText('bitbucket.web.project.col.key')
            ),
            _react2.default.createElement(
                'th',
                { className: 'project-description', scope: 'col' },
                _aui.I18n.getText('bitbucket.web.project.col.description')
            )
        );
    };

    /*eslint-disable react/prefer-stateless-function*/

    var ProjectRow = exports.ProjectRow = function (_PureComponent) {
        babelHelpers.inherits(ProjectRow, _PureComponent);

        function ProjectRow() {
            babelHelpers.classCallCheck(this, ProjectRow);
            return babelHelpers.possibleConstructorReturn(this, (ProjectRow.__proto__ || Object.getPrototypeOf(ProjectRow)).apply(this, arguments));
        }

        babelHelpers.createClass(ProjectRow, [{
            key: 'render',
            value: function render() {
                var _props = this.props,
                    filter = _props.filter,
                    focused = _props.focused,
                    onProjectClick = _props.onProjectClick,
                    primaryRefCallback = _props.primaryRefCallback,
                    project = _props.project;


                return _react2.default.createElement(
                    'tr',
                    { className: (0, _classnames2.default)({ focused: focused }) },
                    _react2.default.createElement(
                        'td',
                        { className: 'project-name' },
                        _react2.default.createElement(ProjectWithAvatar, {
                            filter: filter,
                            onProjectClick: onProjectClick,
                            refCallback: primaryRefCallback,
                            project: project
                        }),
                        project.public && _react2.default.createElement(PublicLozenge, null)
                    ),
                    _react2.default.createElement(
                        'td',
                        { className: 'project-key' },
                        project.key
                    ),
                    _react2.default.createElement(
                        'td',
                        { className: 'project-description' },
                        _react2.default.createElement(
                            'span',
                            { title: project.description },
                            project.description
                        )
                    )
                );
            }
        }]);
        return ProjectRow;
    }(_react.PureComponent);

    ProjectRow.propTypes = {
        focused: _propTypes2.default.bool,
        onProjectClick: _propTypes2.default.func,
        primaryRefCallback: _propTypes2.default.func,
        project: _propTypes2.default.object
    };

    var FilterableProjectTable = function (_FilterableEntityTabl) {
        babelHelpers.inherits(FilterableProjectTable, _FilterableEntityTabl);

        function FilterableProjectTable() {
            var _ref2;

            var _temp, _this2, _ret;

            babelHelpers.classCallCheck(this, FilterableProjectTable);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this2 = babelHelpers.possibleConstructorReturn(this, (_ref2 = FilterableProjectTable.__proto__ || Object.getPrototypeOf(FilterableProjectTable)).call.apply(_ref2, [this].concat(args))), _this2), _this2.onProjectClick = function (project) {
                var _this2$props = _this2.props,
                    entities = _this2$props.entities,
                    filter = _this2$props.filter,
                    onProjectClick = _this2$props.onProjectClick;


                onProjectClick && onProjectClick(project, filter, entities);
            }, _this2.row = function (_ref3) {
                var project = _ref3.item,
                    focused = _ref3.focused,
                    primaryRefCallback = _ref3.primaryRefCallback;
                return _react2.default.createElement(ProjectRow, {
                    filter: _this2.props.filter,
                    focused: focused,
                    key: project.id,
                    onProjectClick: _this2.onProjectClick,
                    primaryRefCallback: primaryRefCallback,
                    project: project
                });
            }, _temp), babelHelpers.possibleConstructorReturn(_this2, _ret);
        }

        return FilterableProjectTable;
    }(_filterableEntityTable2.default);

    FilterableProjectTable.defaultProps = babelHelpers.extends({}, _filterableEntityTable2.default.defaultProps, {
        className: 'filterable-project-table',
        filterable: false,
        header: Header,
        lastPageMessage: _aui.I18n.getText('bitbucket.web.project.allfetched'),
        loadMoreMessage: _aui.I18n.getText('bitbucket.web.project.loadmore'),
        noItemsMessage: _aui.I18n.getText('bitbucket.web.project.nonefound'),
        filterPlaceholder: _aui.I18n.getText('bitbucket.web.project.filter.placeholder')
    });
    FilterableProjectTable.propTypes = babelHelpers.extends({}, _filterableEntityTable2.default.propTypes, {
        onProjectClick: _propTypes2.default.func,
        primaryRefCallback: _propTypes2.default.func
    });
    exports.default = FilterableProjectTable;
});