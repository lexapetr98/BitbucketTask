define('bitbucket/internal/page/project-list/project-list', ['exports', 'react', 'react-dom', 'react-redux', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/enums', 'bitbucket/internal/feature/project/filterable-project-table/action-creators', 'bitbucket/internal/feature/project/filterable-project-table/actions', 'bitbucket/internal/feature/project/filterable-project-table/filterable-project-table', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/notifications/notifications', 'bitbucket/internal/widget/filterable-entity-table/entity-rest-actor', 'bitbucket/internal/widget/filterable-entity-table/filterable-entity-table', 'bitbucket/internal/widget/filterable-entity-table/store'], function (exports, _react, _reactDom, _reactRedux, _navbuilder, _avatar, _enums, _actionCreators, _actions, _filterableProjectTable, _analytics, _notifications, _entityRestActor, _filterableEntityTable, _store) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.init = init;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _filterableProjectTable2 = babelHelpers.interopRequireDefault(_filterableProjectTable);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _notifications2 = babelHelpers.interopRequireDefault(_notifications);

    var _store2 = babelHelpers.interopRequireDefault(_store);

    var urlBuilder = function urlBuilder() {
        return _navbuilder2.default.rest().projects().withParams({ avatarSize: _avatar.AvatarSize.SMALL });
    };

    var bindCreateAnalytics = function bindCreateAnalytics(el, isEmptyState) {
        return el && el.addEventListener('click', function () {
            _analytics2.default.add('project-list.create.clicked', {
                'is.empty.state': !!isEmptyState
            });
        });
    };

    function init(el, _ref) {
        var projectPage = _ref.projectPage;

        _notifications2.default.showFlashes();

        bindCreateAnalytics(document.querySelector('.aui-page-header-main .create-project-link'));

        bindCreateAnalytics(document.querySelector('.project-banners .create-project-link'), true);

        if (projectPage && !projectPage.size && projectPage.isLastPage) {
            //If we have a initial page from the server, and it's empty and is the last page, don't initialise the project table
            return;
        }

        var entityName = _enums.EntityGroups.PROJECTS;
        var loadAction = _actions.LOAD_PROJECTS;

        var store = (0, _store2.default)({
            actors: [(0, _entityRestActor.loadEntitiesRestActor)({
                loadAction: loadAction,
                urlBuilder: urlBuilder
            })],
            entityName: entityName,
            loadAction: loadAction
        });

        var ConnectedTable = (0, _filterableEntityTable.connectEntityTable)(entityName, loadAction, _filterableProjectTable2.default);

        projectPage && store.dispatch((0, _actionCreators.populateProjects)(projectPage));

        _reactDom2.default.render(_react2.default.createElement(
            _reactRedux.Provider,
            { store: store },
            _react2.default.createElement(ConnectedTable, {
                bufferPx: document.getElementById('footer').getBoundingClientRect().height,
                onProjectClick: function onProjectClick(project, filter, projects) {
                    _analytics2.default.add('project-list.item.clicked', {
                        'filter.length': filter.length,
                        'project.id': project.id,
                        'result.index': projects.indexOf(project),
                        'results.size': projects.length
                    });
                }
            })
        ), el);
    }
});