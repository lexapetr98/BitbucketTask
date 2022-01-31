define('bitbucket/internal/page/project/overview/project-overview', ['exports', 'react', 'react-dom', 'react-redux', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/enums', 'bitbucket/internal/feature/repository/filterable-repository-table/actions', 'bitbucket/internal/feature/repository/filterable-repository-table/filterable-repository-table', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/notifications/notifications', 'bitbucket/internal/widget/filterable-entity-table/entity-rest-actor', 'bitbucket/internal/widget/filterable-entity-table/filterable-entity-table', 'bitbucket/internal/widget/filterable-entity-table/store'], function (exports, _react, _reactDom, _reactRedux, _navbuilder, _avatar, _enums, _actions, _filterableRepositoryTable, _analytics, _notifications, _entityRestActor, _filterableEntityTable, _store) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.init = init;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _filterableRepositoryTable2 = babelHelpers.interopRequireDefault(_filterableRepositoryTable);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _notifications2 = babelHelpers.interopRequireDefault(_notifications);

    var _store2 = babelHelpers.interopRequireDefault(_store);

    var urlBuilder = function urlBuilder(_ref) {
        var filter = _ref.filter;

        if (filter) {
            return _navbuilder2.default.rest('search').currentProject().allRepos().withParams({ filter: filter, avatarSize: _avatar.AvatarSize.SMALL });
        }
        return fallbackBuilder();
    };

    var fallbackBuilder = function fallbackBuilder() {
        return _navbuilder2.default.rest().currentProject().allRepos().withParams({ avatarSize: _avatar.AvatarSize.SMALL });
    };

    var bindCreateAnalytics = function bindCreateAnalytics(el, isEmptyState) {
        return el && el.addEventListener('click', function () {
            _analytics2.default.add('project-repository-list.create.clicked', {
                'is.empty.state': !!isEmptyState
            });

            //Legacy event, avoid using
            _analytics2.default.add('repository-list.create.clicked');
        });
    };

    function init(el, _ref2) {
        var repositoryPage = _ref2.repositoryPage;

        _notifications2.default.showFlashes();

        bindCreateAnalytics(document.querySelector('.create-repository-link.repository-list-link'));

        bindCreateAnalytics(document.querySelector('.project-welcome-mat.create-repository-mat'), true);

        if (repositoryPage && !repositoryPage.size && repositoryPage.isLastPage) {
            //If we have a initial page from the server, and it's empty and is the last page, don't initialise the repo table
            return;
        }

        var entityName = _enums.EntityGroups.REPOSITORIES;
        var loadAction = _actions.LOAD_REPOSITORIES;

        var store = (0, _store2.default)({
            actors: [(0, _entityRestActor.loadEntitiesRestActor)({
                loadAction: loadAction,
                urlBuilder: urlBuilder,
                fallbackBuilder: fallbackBuilder,
                responseTransformer: (0, _entityRestActor.searchResponseTransformer)(entityName)
            })],
            entityName: entityName,
            loadAction: loadAction
        });

        var ConnectedTable = (0, _filterableEntityTable.connectEntityTable)(entityName, loadAction, _filterableRepositoryTable2.default);

        _reactDom2.default.render(_react2.default.createElement(
            _reactRedux.Provider,
            { store: store },
            _react2.default.createElement(ConnectedTable, {
                bufferPx: document.getElementById('footer').getBoundingClientRect().height,
                filterable: true,
                onRepoClick: function onRepoClick(repository, filter, repositories) {
                    _analytics2.default.add('project-repository-list.item.clicked', {
                        'filter.length': filter.length,
                        'project.id': repository.project.id,
                        'repository.id': repository.id,
                        'result.index': repositories.indexOf(repository),
                        'results.size': repositories.length
                    });
                }
            })
        ), el);
    }
});