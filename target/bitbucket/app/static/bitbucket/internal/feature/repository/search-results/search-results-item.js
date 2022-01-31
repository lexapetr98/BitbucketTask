define('bitbucket/internal/feature/repository/search-results/search-results-item', ['module', 'exports', 'classnames', 'prop-types', 'react', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/enums', 'bitbucket/internal/util/highlight'], function (module, exports, _classnames, _propTypes, _react, _navbuilder, _avatar, _enums, _highlight) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _highlight2 = babelHelpers.interopRequireDefault(_highlight);

    var SearchResultsItem = function (_Component) {
        babelHelpers.inherits(SearchResultsItem, _Component);

        function SearchResultsItem() {
            babelHelpers.classCallCheck(this, SearchResultsItem);
            return babelHelpers.possibleConstructorReturn(this, (SearchResultsItem.__proto__ || Object.getPrototypeOf(SearchResultsItem)).apply(this, arguments));
        }

        babelHelpers.createClass(SearchResultsItem, [{
            key: 'render',
            value: function render() {
                var _props = this.props,
                    repository = _props.repository,
                    id = _props.id,
                    focused = _props.focused,
                    onItemClick = _props.onItemClick,
                    query = _props.query;
                var repoName = repository.name,
                    _repository$project = repository.project,
                    projectName = _repository$project.name,
                    projectType = _repository$project.type,
                    owner = _repository$project.owner;

                if (query && repoName) {
                    repoName = _react2.default.createElement(_highlight2.default, { text: repoName, query: query, leadingOnly: true });
                    projectName = _react2.default.createElement(_highlight2.default, { text: projectName, query: query, leadingOnly: true });
                }

                return _react2.default.createElement(
                    'li',
                    { className: (0, _classnames2.default)('search-results-item', 'repository', { focused: focused }) },
                    _react2.default.createElement(
                        'a',
                        {
                            href: _navbuilder2.default.project(repository.project).repo(repository).build(),
                            className: 'repository-link',
                            'data-entity': 'repository',
                            'data-repository-id': repository.id,
                            'data-repository-slug': repository.slug,
                            'data-project-id': repository.project.id,
                            'data-project-key': repository.project.key,
                            id: id,
                            title: repository.name,
                            onClick: function onClick(e) {
                                return onItemClick(e);
                            }
                        },
                        projectType === _enums.ProjectType.PERSONAL ? _react2.default.createElement(_avatar.UserAvatar, { person: owner, size: _avatar.AvatarTShirtSize.MEDIUM }) : _react2.default.createElement(_avatar.ProjectAvatar, {
                            project: repository.project,
                            size: _avatar.AvatarTShirtSize.MEDIUM
                        }),
                        _react2.default.createElement(
                            'div',
                            { className: 'item-wrapper' },
                            _react2.default.createElement(
                                'strong',
                                { className: 'item-name' },
                                repoName
                            ),
                            _react2.default.createElement(
                                'p',
                                { className: 'item-description' },
                                projectName
                            )
                        )
                    )
                );
            }
        }]);
        return SearchResultsItem;
    }(_react.Component);

    SearchResultsItem.propTypes = {
        repository: _propTypes2.default.object.isRequired,
        id: _propTypes2.default.string,
        focused: _propTypes2.default.bool,
        onItemClick: _propTypes2.default.func,
        query: _propTypes2.default.string
    };
    exports.default = SearchResultsItem;
    module.exports = exports['default'];
});