define('bitbucket/internal/feature/repository/related-repository-selector/related-repository-selector', ['module', 'exports', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/repository/base-repository-selector/base-repository-selector', 'bitbucket/internal/model/page-state'], function (module, exports, _jquery, _navbuilder, _baseRepositorySelector, _pageState) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _baseRepositorySelector2 = babelHelpers.interopRequireDefault(_baseRepositorySelector);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    /**
     * A searchable selector for choosing Repositories
     * @extends {SearchableSelector}
     * @return {RelatedRepositorySelector}  The new RelatedRepositorySelector instance
     *
     * @param {HTMLElement|jQuery}  trigger     The trigger (usually a button) to bind opening the selector to.
     * @param {Object}              options     A hash of options, valid options are specified in RelatedRepositorySelector.prototype.defaults
     */
    function RelatedRepositorySelector(trigger, options) {
        return this.init.apply(this, arguments);
    }

    _jquery2.default.extend(RelatedRepositorySelector.prototype, _baseRepositorySelector2.default.prototype);

    RelatedRepositorySelector.constructDataPageFromPreloadArray = _baseRepositorySelector2.default.constructDataPageFromPreloadArray;

    /**
     * Default options.
     * All options can also be specified as functions that return the desired type (except params that expect a function).
     * Full option documentation can be found on SearchableSelector.prototype.defaults
     * @inheritDocs
     *
     * @param repository {Repository} The repository for which to select related repositories.
     */
    RelatedRepositorySelector.prototype.defaults = _jquery2.default.extend(true, {}, _baseRepositorySelector2.default.prototype.defaults, {
        repository: function repository() {
            return _pageState2.default.getRepository();
        },
        preloadData: function preloadData() {
            var repo = this._getOptionVal('repository') || _pageState2.default.getRepository();

            if (!repo) {
                return null;
            }

            var preload = [repo.toJSON()];

            var origin = repo.getOrigin();
            if (origin) {
                preload.push(origin);
            }

            return RelatedRepositorySelector.constructDataPageFromPreloadArray(preload);
        },
        url: function url() {
            var repo = this._getOptionVal('repository') || _pageState2.default.getRepository();
            return _navbuilder2.default.rest().project(repo.getProject()).repo(repo).related().withParams({
                avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                    size: 'xsmall'
                })
            }).build();
        }
    });

    exports.default = RelatedRepositorySelector;
    module.exports = exports['default'];
});