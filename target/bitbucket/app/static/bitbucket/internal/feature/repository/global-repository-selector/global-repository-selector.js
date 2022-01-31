define('bitbucket/internal/feature/repository/global-repository-selector/global-repository-selector', ['module', 'exports', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/repository/base-repository-selector/base-repository-selector'], function (module, exports, _jquery, _navbuilder, _baseRepositorySelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _baseRepositorySelector2 = babelHelpers.interopRequireDefault(_baseRepositorySelector);

    /**
     * A searchable selector for choosing Repositories
     * @extends {SearchableSelector}
     * @return {GlobalRepositorySelector}  The new GlobalRepositorySelector instance
     *
     * @param {HTMLElement|jQuery}  trigger     The trigger (usually a button) to bind opening the selector to.
     * @param {Object}              options     A hash of options, valid options are specified in GlobalRepositorySelector.prototype.defaults
     */
    function GlobalRepositorySelector(trigger, options) {
        return this.init.apply(this, arguments);
    }

    _jquery2.default.extend(GlobalRepositorySelector.prototype, _baseRepositorySelector2.default.prototype);

    GlobalRepositorySelector.constructDataPageFromPreloadArray = _baseRepositorySelector2.default.constructDataPageFromPreloadArray;

    /**
     * Default options.
     * All options can also be specified as functions that return the desired type (except params that expect a function).
     * Full option documentation can be found on SearchableSelector.prototype.defaults
     * @inheritDocs
     *
     * @param repository {Repository} The repository for which to select related repositories.
     */
    GlobalRepositorySelector.prototype.defaults = _jquery2.default.extend(true, {}, _baseRepositorySelector2.default.prototype.defaults, {
        url: _navbuilder2.default.rest().allRepos().withParams({
            avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                size: 'xsmall'
            })
        }).build(),
        queryParamsBuilder: function queryParamsBuilder(searchTerm, start, limit) {
            searchTerm = _jquery2.default.trim(searchTerm);
            var params = {
                start: start,
                limit: limit,
                permission: this._getOptionVal('permission')
            };
            var indexOfSeparator = searchTerm.lastIndexOf('/');
            if (indexOfSeparator === -1) {
                params.name = searchTerm;
            } else {
                params.projectname = searchTerm.substr(0, indexOfSeparator);
                params.name = searchTerm.substr(indexOfSeparator + 1);
            }
            return params;
        },
        searchable: true,
        permission: 'REPO_READ'
    });

    exports.default = GlobalRepositorySelector;
    module.exports = exports['default'];
});