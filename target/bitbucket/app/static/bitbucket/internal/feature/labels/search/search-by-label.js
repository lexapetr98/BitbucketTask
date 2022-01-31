define('bitbucket/internal/feature/labels/search/search-by-label', ['exports', '@atlassian/aui', 'react', 'react-dom', 'react-redux', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/enums', 'bitbucket/internal/feature/repository/filterable-repository-table/action-creators', 'bitbucket/internal/feature/repository/filterable-repository-table/actions', 'bitbucket/internal/feature/repository/filterable-repository-table/filterable-repository-table', 'bitbucket/internal/widget/filterable-entity-table/entity-rest-actor', 'bitbucket/internal/widget/filterable-entity-table/filterable-entity-table', 'bitbucket/internal/widget/filterable-entity-table/store'], function (exports, _aui, _react, _reactDom, _reactRedux, _navbuilder, _avatar, _enums, _actionCreators, _actions, _filterableRepositoryTable, _entityRestActor, _filterableEntityTable, _store) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.init = init;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _filterableRepositoryTable2 = babelHelpers.interopRequireDefault(_filterableRepositoryTable);

    var _store2 = babelHelpers.interopRequireDefault(_store);

    function init(el, _ref, labelName) {
        var repositoryPage = _ref.repositoryPage;

        var urlBuilder = function urlBuilder() {
            return _navbuilder2.default.rest('labels').addPathComponents('labels', labelName).withParams({
                avatarSize: _avatar.AvatarSize.SMALL,
                type: 'repository'
            });
        };

        var entityName = _enums.EntityGroups.REPOSITORIES;
        var loadAction = _actions.LOAD_REPOSITORIES;

        var store = (0, _store2.default)({
            actors: [(0, _entityRestActor.loadEntitiesRestActor)({
                loadAction: loadAction,
                urlBuilder: urlBuilder
            })],
            entityName: entityName,
            loadAction: loadAction
        });

        var ConnectedTable = (0, _filterableEntityTable.connectEntityTable)(entityName, loadAction, _filterableRepositoryTable2.default);

        repositoryPage && store.dispatch((0, _actionCreators.populateRepositories)(repositoryPage));

        _reactDom2.default.render(_react2.default.createElement(
            _reactRedux.Provider,
            { store: store },
            _react2.default.createElement(ConnectedTable, {
                bufferPx: 0,
                emptyState: _react2.default.createElement(
                    'h3',
                    { className: 'entity-empty' },
                    _aui.I18n.getText('bitbucket.web.label.search.empty')
                ),
                showProject: true,
                showPublic: true
            })
        ), el);
    }
});