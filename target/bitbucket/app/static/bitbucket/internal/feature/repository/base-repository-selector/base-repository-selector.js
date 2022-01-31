define('bitbucket/internal/feature/repository/base-repository-selector/base-repository-selector', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/model/repository', 'bitbucket/internal/util/events', 'bitbucket/internal/widget/searchable-selector/searchable-selector'], function (module, exports, _aui, _jquery, _lodash, _repository, _events, _searchableSelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _repository2 = babelHelpers.interopRequireDefault(_repository);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _searchableSelector2 = babelHelpers.interopRequireDefault(_searchableSelector);

    /**
     * A searchable selector for choosing Repositories
     * @extends {SearchableSelector}
     * @return {BaseRepositorySelector}  The new BaseRepositorySelector instance
     *
     * @param {HTMLElement|jQuery}  trigger     The trigger (usually a button) to bind opening the selector to.
     * @param {Object}              options     A hash of options, valid options are specified in BaseRepositorySelector.prototype.defaults
     */
    function BaseRepositorySelector(trigger, options) {
        return this.init.apply(this, arguments);
    }
    _jquery2.default.extend(BaseRepositorySelector.prototype, _searchableSelector2.default.prototype);

    BaseRepositorySelector.constructDataPageFromPreloadArray = _searchableSelector2.default.constructDataPageFromPreloadArray;

    /**
     * Default options.
     * All options can also be specified as functions that return the desired type (except params that expect a function).
     * Full option documentation can be found on SearchableSelector.prototype.defaults
     * @inheritDocs
     *
     * @param repository {Repository} The repository for which to select related repositories.
     */
    BaseRepositorySelector.prototype.defaults = _jquery2.default.extend(true, {}, _searchableSelector2.default.prototype.defaults, {
        searchable: false,
        extraClasses: 'base-repository-selector',
        resultsTemplate: bitbucket.internal.feature.repository.baseRepositorySelectorResults,
        triggerContentTemplate: bitbucket.internal.feature.repository.baseRepositorySelectorTriggerContent,
        searchPlaceholder: _aui2.default.I18n.getText('bitbucket.web.repository.selector.search.placeholder'),
        namespace: 'base-repository-selector',
        itemSelectedEvent: 'bitbucket.internal.feature.repository.repositorySelector.repositoryChanged',
        itemDataKey: 'repository',
        paginationContext: 'base-repository-selector'
    });

    /**
     * Build a Repository from the metadata on the trigger.
     * @override
     * @return {Repository} The newly created Repository
     */
    BaseRepositorySelector.prototype._getItemFromTrigger = function () {
        var $triggerItem = this.$trigger.find('.repository');
        return new _repository2.default(_jquery2.default.extend({}, this._buildObjectFromElementDataAttributes($triggerItem), {
            name: $triggerItem.children('.name').text() || undefined
        }));
    };

    /**
     *
     * @param repository
     */
    BaseRepositorySelector.prototype.setSelectedItem = function (repository) {
        if (repository instanceof _repository2.default && !repository.isEqual(this._selectedItem)) {
            this._itemSelected(repository);
        }
    };

    /**
     * Handle an item being selected.
     * This creates a new Repository from the item data,
     * triggers the 'stash.feature.repository.repositorySelector.repositoryChanged' event with the new Repository,
     * sets the selectedItem to the new Repository and updates the trigger and form field (if supplied)
     * @override
     *
     * @param {Object|Repository}  repositoryData     The JSON data or Repository model for the selected item.
     */
    BaseRepositorySelector.prototype._itemSelected = function (repositoryData) {
        var repository;
        if (repositoryData instanceof _repository2.default) {
            repository = repositoryData;
            repositoryData = repositoryData.toJSON();
        } else {
            repositoryData = _lodash2.default.pick(repositoryData, _lodash2.default.keys(_repository2.default.prototype.namedAttributes));
            repository = new _repository2.default(repositoryData);
        }
        this._selectedItem = repository;
        if (this._getOptionVal('field')) {
            (0, _jquery2.default)(this._getOptionVal('field')).val(repositoryData.id);
        }
        var titleContent = repository.getProject().getName() + ' / ' + repository.getName();
        this.updateTrigger({ repository: repositoryData }, titleContent);
        _events2.default.trigger(this._getOptionVal('itemSelectedEvent'), this, repository, this._getOptionVal('context'));
    };

    exports.default = BaseRepositorySelector;
    module.exports = exports['default'];
});