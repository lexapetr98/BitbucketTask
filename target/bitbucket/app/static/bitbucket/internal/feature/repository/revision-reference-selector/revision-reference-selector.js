define('bitbucket/internal/feature/repository/revision-reference-selector/revision-reference-selector', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/repository', 'bitbucket/internal/model/revision-reference', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/events', 'bitbucket/internal/widget/searchable-selector/searchable-selector'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _pageState, _repository, _revisionReference, _ajax, _events, _searchableSelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _repository2 = babelHelpers.interopRequireDefault(_repository);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _searchableSelector2 = babelHelpers.interopRequireDefault(_searchableSelector);

    /**
     * A searchable selector for choosing RevisionReferences (branches, tags & commits)
     * @extends {SearchableSelector}
     * @return {RevisionReferenceSelector}  The new RevisionReferenceSelector instance
     *
     * @param {HTMLElement|jQuery}  trigger     The trigger (usually a button) to bind opening the selector to.
     * @param {Object}              options     A hash of options, valid options are specified in RevisionReferenceSelector.prototype.defaults
     */
    function RevisionReferenceSelector(trigger, options) {
        return this.init.apply(this, arguments);
    }

    _jquery2.default.extend(RevisionReferenceSelector.prototype, _searchableSelector2.default.prototype);

    /**
     * Add the current revision reference type and the repository to each item in a collection of results.
     * Is used as the dataTransform function on REST and preloaded results.
     * @return {Object} The modified collection of results
     *
     * @param {Object} results The collection of results
     */
    RevisionReferenceSelector.prototype._addRefTypeAndRepositoryToResults = function (results) {
        if (results && results.values) {
            var newResults = _jquery2.default.extend(true, {}, results); //Deep clone;
            var refType = this._getCurrentType();

            _lodash2.default.forEach(newResults.values, _lodash2.default.bind(function (ref) {
                ref.type = refType;
                if (!ref.repository) {
                    ref.repository = this.repository && this.repository.toJSON();
                }
            }, this));

            return newResults;
        }

        return results;
    };

    /**
     * Default options.
     * All options can also be specified as functions that return the desired type (except params that expect a function).
     * Full option documentation can be found on SearchableSelector.prototype.defaults
     * @inheritDocs
     *
     * @param {Repository}  repository      The repository that the selector will retrieve revisions from
     * @param {Object}      show            A hash of which tabs to show or hide
     */
    RevisionReferenceSelector.prototype.defaults = _jquery2.default.extend(true, {}, _searchableSelector2.default.prototype.defaults, {
        tabs: [{
            label: 'Branches',
            type: _revisionReference2.default.type.BRANCH,
            url: function url() {
                return this.getBranchesUrl();
            },
            resultsTemplate: bitbucket.internal.feature.repository.revisionReferenceSelectorBranchResults,
            searchPlaceholder: _aui2.default.I18n.getText('bitbucket.web.revisionref.selector.branch.search.placeholder')
        }, {
            label: 'Tags',
            type: _revisionReference2.default.type.TAG,
            url: function url() {
                return this.getTagsUrl();
            },
            resultsTemplate: bitbucket.internal.feature.repository.revisionReferenceSelectorTagResults,
            searchPlaceholder: _aui2.default.I18n.getText('bitbucket.web.revisionref.selector.tag.search.placeholder')
        }, {
            label: 'Commits',
            type: _revisionReference2.default.type.COMMIT,
            url: function url() {
                return this.getCommitsUrl();
            },
            resultsTemplate: bitbucket.internal.feature.repository.revisionReferenceSelectorCommitResults,
            searchPlaceholder: _aui2.default.I18n.getText('bitbucket.web.revisionref.selector.commit.search.placeholder')
        }],
        queryParamKey: 'filterText',
        namespace: 'revision-reference-selector',
        itemSelectedEvent: 'bitbucket.internal.feature.repository.revisionReferenceSelector.revisionRefChanged',
        itemUnselectedEvent: 'bitbucket.internal.feature.repository.revisionReferenceSelector.revisionRefUnselected',
        itemDataKey: 'revision-ref',
        statusCodeHandlers: _ajax2.default.ignore404WithinRepository(),
        triggerContentTemplate: bitbucket.internal.feature.repository.revisionReferenceSelectorTriggerContent,
        extraClasses: 'revision-reference-selector',
        repository: function repository() {
            return _pageState2.default.getRepository();
        },
        show: { branches: true, tags: true, commits: false },
        dataTransform: RevisionReferenceSelector.prototype._addRefTypeAndRepositoryToResults,
        postOptionsInit: function postOptionsInit() {
            this.setRepository(this._getOptionVal('repository'));
        },
        paginationContext: 'revision-reference-selector'
    });

    /**
     * Initialise the selector
     * @override
     * @return {RevisionReferenceSelector} The initialised RevisionReferenceSelector.
     *
     * @param {HTMLElement|jQuery}  trigger     The trigger (usually a button) to bind opening the selector to.
     * @param {Object}              options     A hash of options, valid options are specified in RevisionReferenceSelector.prototype.defaults
     */
    RevisionReferenceSelector.prototype.init = function (trigger, options) {
        _searchableSelector2.default.prototype.init.apply(this, arguments);

        return this;
    };

    /**
     * Merge the supplied options with the defaults and remove tabs that aren't going to be shown.
     * @override
     *
     * @param {Object}  options A hash of options, valid options are specified in RevisionReferenceSelector.prototype.defaults
     */
    RevisionReferenceSelector.prototype.setOptions = function (options) {
        if (options.extraClasses) {
            options.extraClasses = this.defaults.extraClasses + ' ' + _jquery2.default.trim(options.extraClasses);
        }
        options = _jquery2.default.extend(true, {}, this.defaults, options);
        var typesMap = {
            branches: _revisionReference2.default.type.BRANCH.id,
            tags: _revisionReference2.default.type.TAG.id,
            commits: _revisionReference2.default.type.COMMIT.id
        };
        var typesToShow = _lodash2.default.filter(typesMap, function (type, key) {
            //Only show types with enabled in the `show` options.
            return options.show[key];
        });

        //Remove any tabs whose type is not in `typesToShow`
        options.tabs = _lodash2.default.filter(options.tabs, function (tab) {
            return _lodash2.default.includes(typesToShow, tab.type.id);
        });

        this.options = options;
    };

    /**
     * Build a RevisionReference from the metadata on the trigger.
     * @override
     * @return {RevisionReference} The newly created RevisionReference
     */
    RevisionReferenceSelector.prototype._getItemFromTrigger = function () {
        var $triggerItem = this.$trigger.find('.name');

        return new _revisionReference2.default(_jquery2.default.extend({}, this._buildObjectFromElementDataAttributes($triggerItem), {
            displayId: $triggerItem.text(),
            repository: this.repository
        }));
    };

    /**
     * Get the url for the branches REST endpoint for the current repository
     * @return  {string}    The url to the rest endpoint for branches
     */
    RevisionReferenceSelector.prototype.getBranchesUrl = function () {
        return _navbuilder2.default.rest().project(this.repository.getProject()).repo(this.repository).branches().build();
    };

    /**
     * Get the url for the tags REST endpoint for the current repository
     * @return  {string}    The url to the rest endpoint for tags
     */
    RevisionReferenceSelector.prototype.getTagsUrl = function () {
        return _navbuilder2.default.rest().project(this.repository.getProject()).repo(this.repository).tags().build();
    };

    /**
     * Get the url for the commits REST endpoint for the current repository
     * @return  {string}    The url to the rest endpoint for commits
     */
    RevisionReferenceSelector.prototype.getCommitsUrl = function () {
        return _navbuilder2.default.rest().project(this.repository.getProject()).repo(this.repository).commits().build();
    };

    /**
     * Get the current repository
     * @return {Repository}     The current repository
     */
    RevisionReferenceSelector.prototype.getRepository = function () {
        return this.repository;
    };

    /**
     * Update the current repository.
     * Resets state for the current scrollable and trigger and hides the dialog.
     *
     * @param {Repository}  repository  The new repository
     */
    RevisionReferenceSelector.prototype.setRepository = function (repository) {
        var currentRepository = this.repository;

        if (repository instanceof _repository2.default && !repository.isEqual(currentRepository)) {
            //Changing repository to the same repository should be a no-op.
            this.repository = repository;

            if (currentRepository) {
                //Only reset the scrollable and trigger, close the dialog and trigger the event when we are changing between repositories, not setting the repo for the first time.
                var currentScrollable = this._getCurrentScrollable();

                if (currentScrollable) {
                    //We don't call _populateScrollable, because after changing repository it doesn't make sense to show the preload data
                    this._emptyScrollable(currentScrollable);
                    currentScrollable.init();
                }
                this.clearSelection();
                this.dialog.hide();

                _events2.default.trigger('bitbucket.internal.feature.repository.revisionReferenceSelector.repoChanged', this, repository, this._getOptionVal('context'));
            }
        }
    };

    /**
     * Get the RevisionReference type of the current tab.
     * @return {Object} The current tab type
     */
    RevisionReferenceSelector.prototype._getCurrentType = function () {
        return this.tabs[this.currentTabId || 0].type;
    };

    /**
     * Set the selected item.
     * Updates the trigger and fires the event if the item is different to the previous item.
     * @override
     *
     * @param {Object} revisionRef The RevisionReference to select.
     */
    RevisionReferenceSelector.prototype.setSelectedItem = function (revisionRef) {
        if (revisionRef instanceof _revisionReference2.default && !revisionRef.isEqual(this._selectedItem)) {
            this._itemSelected(revisionRef);
        }
    };

    RevisionReferenceSelector.prototype.clearSelection = function () {
        _searchableSelector2.default.prototype.clearSelection.apply(this, arguments);
        // null arg in place of revisionRef from the itemSelectedEvent
        _events2.default.trigger(this._getOptionVal('itemUnselectedEvent'), this, null, this._getOptionVal('context'));
    };

    /**
     * Handle an item being selected.
     * This creates a new RevisionReference from the item data,
     * triggers the 'stash.feature.repository.revisionReferenceSelector.revisionRefChanged' event with the new RevisionReference,
     * sets the selectedItem to the new RevisionReference and updates the trigger and form field (if supplied)
     * @override
     *
     * @param {Object|RevisionReference}  refDataOrRevisionReference     The JSON data or a RevisionReference for the selected item.
     */
    RevisionReferenceSelector.prototype._itemSelected = function (refDataOrRevisionReference) {
        var refData;
        var ref;

        if (refDataOrRevisionReference instanceof _revisionReference2.default) {
            refData = refDataOrRevisionReference.toJSON();
            ref = refDataOrRevisionReference;
        } else {
            refData = _lodash2.default.pick(refDataOrRevisionReference, _lodash2.default.keys(_revisionReference2.default.prototype.namedAttributes));
            ref = new _revisionReference2.default(refData);
        }

        this._selectedItem = ref;

        if (this._getOptionVal('field')) {
            (0, _jquery2.default)(this._getOptionVal('field')).val(refData.id).trigger('change');
        }

        var titleContent = bitbucket.internal.feature.repository.revisionReferenceSelectorTitle({
            ref: refData
        });

        this.updateTrigger({ ref: refData }, titleContent);

        _events2.default.trigger(this._getOptionVal('itemSelectedEvent'), this, ref, this._getOptionVal('context'));
    };

    exports.default = RevisionReferenceSelector;
    module.exports = exports['default'];
});