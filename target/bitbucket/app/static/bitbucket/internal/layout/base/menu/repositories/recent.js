define('bitbucket/internal/layout/base/menu/repositories/recent', ['module', 'exports', 'jquery', 'react', 'react-dom', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/feature/repository/search-results/search-results-list', 'bitbucket/internal/util/html', 'bitbucket/internal/util/shortcuts'], function (module, exports, _jquery, _react, _reactDom, _events, _navbuilder, _server, _searchResultsList, _html, _shortcuts) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _searchResultsList2 = babelHelpers.interopRequireDefault(_searchResultsList);

    var _html2 = babelHelpers.interopRequireDefault(_html);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    var MAX_REPO_ITEM_COUNT = 10;

    function initMenu(menuTriggerId) {
        var $menuTrigger = (0, _jquery2.default)('#' + menuTriggerId);
        var $menu = (0, _jquery2.default)('#' + _html2.default.sanitizeId($menuTrigger.attr('aria-controls'))).addClass('recent-repositories-menu');

        $menu.find('.aui-dropdown2-section').addClass('repository-list-container').find('ul').addClass('repository-list');

        var REPOLIST_CONTAINER_ID = 'recent-repositories-list-container';
        var $repoList = $menu.find('.recent-repositories-section ul');
        var $loading = (0, _jquery2.default)(bitbucket.internal.layout.menu.loadingRecentReposMenuItem());

        _shortcuts2.default.bind('recentRepositories', function () {
            return $menuTrigger.click();
        });

        // Trigger UI events
        $menu.on('aui-dropdown2-show', function () {
            _events2.default.trigger('bitbucket.internal.ui.nav.repositories.opened');
        });
        $menu.find('.public-repo-list-link-section').on('click', 'a', function () {
            _events2.default.trigger('bitbucket.internal.ui.nav.repositories.public.clicked');
        });

        var recentRepoItemClick = function recentRepoItemClick(e) {
            _events2.default.trigger('bitbucket.internal.ui.nav.repositories.item.clicked', null, {
                repositoryId: e.currentTarget.dataset.repositoryId
            });
        };

        $repoList.append($loading);

        var fetchRecentRepos = function fetchRecentRepos() {
            _server2.default.rest({
                url: _navbuilder2.default.rest().profile().recent().repos().withParams({
                    avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                        size: 'medium'
                    }),
                    limit: MAX_REPO_ITEM_COUNT
                }).build(),
                statusCode: {
                    '*': false
                }
            }).done(function (data) {
                if (data && data.size) {
                    $repoList.replaceWith('<div id="' + REPOLIST_CONTAINER_ID + '"/>');
                    _reactDom2.default.render(_react2.default.createElement(_searchResultsList2.default, {
                        repositories: data.values,
                        onItemClick: recentRepoItemClick
                    }), document.getElementById(REPOLIST_CONTAINER_ID));
                } else {
                    $repoList.append((0, _jquery2.default)(bitbucket.internal.layout.menu.noRecentReposMenuItem()));
                }
                // Fire an event with the recent repository data so that other parts of Stash have access to it
                _events2.default.trigger('bitbucket.internal.feature.repositories.recent.loaded', this, data);
            }).fail(function () {
                $repoList.append((0, _jquery2.default)(bitbucket.internal.layout.menu.errorLoadingRecentReposMenuItem()));
            }).always(function () {
                $loading.remove();
            });
        };

        //Load only once all other resources have loaded
        (0, _jquery2.default)(window).on('load', fetchRecentRepos);
    }

    exports.default = {
        initMenu: initMenu
    };
    module.exports = exports['default'];
});