define('bitbucket/internal/feature/labels/repository/label-repositories-dialog-content', ['module', 'exports', '@atlassian/aui', 'icepick', 'prop-types', 'react', 'react-redux', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/util/state', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/enums', 'bitbucket/internal/feature/repository/filterable-repository-table/action-creators', 'bitbucket/internal/feature/repository/filterable-repository-table/actions', 'bitbucket/internal/feature/repository/filterable-repository-table/filterable-repository-table', 'bitbucket/internal/util/analytics', 'bitbucket/internal/widget/filterable-entity-table/entity-rest-actor', 'bitbucket/internal/widget/filterable-entity-table/filterable-entity-table', 'bitbucket/internal/widget/filterable-entity-table/store'], function (module, exports, _aui, _icepick, _propTypes, _react, _reactRedux, _navbuilder, _server, _state, _avatar, _enums, _actionCreators, _actions, _filterableRepositoryTable, _analytics, _entityRestActor, _filterableEntityTable, _store) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _filterableRepositoryTable2 = babelHelpers.interopRequireDefault(_filterableRepositoryTable);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _store2 = babelHelpers.interopRequireDefault(_store);

    var ConnectedTable = (0, _filterableEntityTable.connectEntityTable)(_enums.EntityGroups.REPOSITORIES, _actions.LOAD_REPOSITORIES, _filterableRepositoryTable2.default);

    var LabelRepositoriesDialogContent = function (_Component) {
        babelHelpers.inherits(LabelRepositoriesDialogContent, _Component);

        function LabelRepositoriesDialogContent(props) {
            babelHelpers.classCallCheck(this, LabelRepositoriesDialogContent);

            var _this = babelHelpers.possibleConstructorReturn(this, (LabelRepositoriesDialogContent.__proto__ || Object.getPrototypeOf(LabelRepositoriesDialogContent)).call(this, props));

            var urlBuilder = function urlBuilder() {
                return _navbuilder2.default.rest().addPathComponents('labels', _this.props.labelName, 'labeled').withParams({ avatarSize: _avatar.AvatarSize.SMALL, type: 'repository' });
            };

            _this.store = (0, _store2.default)({
                actors: [(0, _entityRestActor.loadEntitiesRestActor)({
                    loadAction: _actions.LOAD_REPOSITORIES,
                    urlBuilder: urlBuilder,
                    responseTransformer: _this.responseTransformer(),
                    statusCode: {
                        404: _server.createEmptyPage //return nothing if by any chance the label has already been deleted
                    }
                })],
                entityName: _enums.EntityGroups.REPOSITORIES,
                loadAction: _actions.LOAD_REPOSITORIES
            });
            return _this;
        }

        babelHelpers.createClass(LabelRepositoriesDialogContent, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var repositoryPage = { isLastPage: false, values: [], size: 0, limit: 25 };
                this.store.dispatch((0, _actionCreators.populateRepositories)(repositoryPage));
            }
        }, {
            key: 'responseTransformer',
            value: function responseTransformer() {
                return function (response) {
                    return (0, _icepick.set)(response, 'values', response.values.filter(function (repository) {
                        return repository.id !== _state2.default.getRepository().id;
                    }));
                };
            }
        }, {
            key: 'render',
            value: function render() {
                var _props = this.props,
                    dialogContentEl = _props.dialogContentEl,
                    scrollToLoad = _props.scrollToLoad;
                // Extend props

                return _react2.default.createElement(
                    _reactRedux.Provider,
                    { store: this.store },
                    _react2.default.createElement(ConnectedTable, {
                        emptyState: _react2.default.createElement(
                            'h3',
                            { className: 'entity-empty' },
                            _aui.I18n.getText('bitbucket.web.label.search.empty')
                        ),
                        showProject: true,
                        showPublic: true,
                        shouldScrollOnFocus: false,
                        scrollElement: dialogContentEl,
                        scrollToLoad: scrollToLoad,
                        onRepoClick: function onRepoClick(repository) {
                            _analytics2.default.add('stash.client.repository.label.dialog.repository.clicked', {
                                'project.id': repository.project.id,
                                'repository.id': repository.id
                            });
                        },
                        showTableIfNoResults: false
                    })
                );
            }
        }]);
        return LabelRepositoriesDialogContent;
    }(_react.Component);

    LabelRepositoriesDialogContent.propTypes = {
        labelName: _propTypes2.default.string.isRequired,
        scrollToLoad: _propTypes2.default.bool
    };
    LabelRepositoriesDialogContent.defaultProps = {
        scrollToLoad: true
    };
    exports.default = LabelRepositoriesDialogContent;
    module.exports = exports['default'];
});