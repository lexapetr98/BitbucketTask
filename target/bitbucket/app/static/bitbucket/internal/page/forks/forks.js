define('bitbucket/internal/page/forks/forks', ['exports', '@atlassian/aui', 'react', 'react-dom', 'react-redux', 'bitbucket/util/navbuilder', 'bitbucket/util/state', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/enums', 'bitbucket/internal/feature/repository/filterable-fork-table/filterable-fork-table', 'bitbucket/internal/feature/repository/filterable-repository-table/actions', 'bitbucket/internal/util/analytics', 'bitbucket/internal/widget/filterable-entity-table/entity-rest-actor', 'bitbucket/internal/widget/filterable-entity-table/filterable-entity-table', 'bitbucket/internal/widget/filterable-entity-table/store'], function (exports, _aui, _react, _reactDom, _reactRedux, _navbuilder, _state, _avatar, _enums, _filterableForkTable, _actions, _analytics, _entityRestActor, _filterableEntityTable, _store) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.init = init;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _filterableForkTable2 = babelHelpers.interopRequireDefault(_filterableForkTable);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _store2 = babelHelpers.interopRequireDefault(_store);

    /* globals bitbucket_help_url:false */
    var isOwnPersonalRepo = function isOwnPersonalRepo(currentUser, _ref) {
        var project = _ref.project;
        return currentUser && project.key.toLowerCase() === '~' + currentUser.name.toLowerCase();
    };

    var buildEmptyState = function buildEmptyState(currentUser, repository, hasRepoCreate) {
        return _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement('p', {
                dangerouslySetInnerHTML: {
                    __html: _aui.I18n.getText('bitbucket.web.repository.forks.description.html', bitbucket_help_url('bitbucket.help.forks'))
                }
            }),
            isOwnPersonalRepo(currentUser, repository) ? _react2.default.createElement(
                'div',
                { className: 'forks-empty-state' },
                _react2.default.createElement('div', { className: 'forks-empty-state-hero' }),
                _react2.default.createElement(
                    'h3',
                    null,
                    _aui.I18n.getText('bitbucket.web.repository.forks.empty.heading.personal')
                ),
                _react2.default.createElement(
                    'p',
                    null,
                    _aui.I18n.getText('bitbucket.web.repository.forks.empty.description.personal')
                )
            ) : _react2.default.createElement(
                'div',
                { className: 'forks-empty-state' },
                _react2.default.createElement('div', { className: 'forks-empty-state-hero' }),
                _react2.default.createElement(
                    'h3',
                    null,
                    _aui.I18n.getText('bitbucket.web.repository.forks.empty.heading')
                ),
                _react2.default.createElement(
                    'p',
                    null,
                    _aui.I18n.getText('bitbucket.web.repository.forks.empty.description')
                ),
                hasRepoCreate && // User must have a project to fork into
                _react2.default.createElement(
                    'a',
                    {
                        className: 'aui-button aui-button-primary fork-this-repository',
                        href: _navbuilder2.default.project(repository.project).repo(repository).fork().build(),
                        onClick: function onClick() {
                            return _analytics2.default.add('repository-fork-list.create.clicked', {
                                'is.empty.state': true
                            });
                        }
                    },
                    _aui.I18n.getText('bitbucket.web.repository.forks.empty.fork.button')
                )
            )
        );
    };

    var urlBuilder = function urlBuilder(_ref2) {
        var filter = _ref2.filter;
        return _navbuilder2.default.rest('search').currentRepo().forks().withParams({ filter: filter, avatarSize: _avatar.AvatarSize.SMALL });
    };

    var fallbackBuilder = function fallbackBuilder() {
        return _navbuilder2.default.rest().currentRepo().forks().withParams({ avatarSize: _avatar.AvatarSize.SMALL });
    };

    function init(el, hasRepoCreate) {
        var currentUser = _state2.default.getCurrentUser();
        var entityName = _enums.EntityGroups.REPOSITORIES;
        var loadAction = _actions.LOAD_REPOSITORIES;
        var repository = _state2.default.getRepository();

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

        var ConnectedTable = (0, _filterableEntityTable.connectEntityTable)(entityName, loadAction, _filterableForkTable2.default);

        _reactDom2.default.render(_react2.default.createElement(
            _reactRedux.Provider,
            { store: store },
            _react2.default.createElement(ConnectedTable, {
                bufferPx: document.getElementById('footer').getBoundingClientRect().height,
                emptyState: buildEmptyState(currentUser, repository, hasRepoCreate),
                filterable: true,
                onRepoClick: function onRepoClick(fork, filter, forks) {
                    _analytics2.default.add('repository-fork-list.item.clicked', {
                        'filter.length': filter.length,
                        'fork.id': fork.id,
                        'is.own.fork': isOwnPersonalRepo(currentUser, fork),
                        'origin.id': repository.id,
                        'project.id': fork.project.id,
                        'result.index': forks.indexOf(fork),
                        'results.size': forks.length
                    });
                }
            })
        ), el);

        var createForkListButton = document.querySelector('.aui-page-header-actions .fork-repo');
        createForkListButton && createForkListButton.addEventListener('click', function () {
            return _analytics2.default.add('repository-fork-list.create.clicked', {
                'is.empty.state': false
            });
        });
    }
});