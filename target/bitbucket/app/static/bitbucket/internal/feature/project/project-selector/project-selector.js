define('bitbucket/internal/feature/project/project-selector/project-selector', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/project', 'bitbucket/internal/util/events', 'bitbucket/internal/widget/searchable-selector/searchable-selector'], function (module, exports, _jquery, _lodash, _navbuilder, _project, _events, _searchableSelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _project2 = babelHelpers.interopRequireDefault(_project);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _searchableSelector2 = babelHelpers.interopRequireDefault(_searchableSelector);

    /**
     * A searchable selector for choosing a Project
     * @extends {SearchableSelector}
     * @return {ProjectSelector}  The new ProjectSelector instance
     *
     * @param {HTMLElement|jQuery}  trigger     The trigger (usually a button) to bind opening the selector to.
     * @param {Object}              options     A hash of options, valid options are specified in ProjectSelector.prototype.defaults
     */
    function ProjectSelector(trigger, options) {
        return this.init.apply(this, arguments);
    }

    _jquery2.default.extend(ProjectSelector.prototype, _searchableSelector2.default.prototype);

    /**
     * Default options.
     * All options can also be specified as functions that return the desired type (except params that expect a function).
     * Full option documentation can be found on SearchableSelector.prototype.defaults
     * @inheritDocs
     */
    ProjectSelector.prototype.defaults = _jquery2.default.extend(true, {}, _searchableSelector2.default.prototype.defaults, {
        url: function url() {
            return _navbuilder2.default.rest().projects().withParams({
                avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                    size: 'xsmall'
                }),
                permission: 'PROJECT_ADMIN'
            }).build();
        },
        searchable: true,
        queryParamKey: 'name',
        extraClasses: 'project-selector',
        resultsTemplate: bitbucket.internal.feature.project.projectSelectorResults,
        triggerContentTemplate: bitbucket.internal.feature.project.projectSelectorTriggerContent,
        searchPlaceholder: 'Search for a project',
        namespace: 'project-selector',
        itemSelectedEvent: 'bitbucket.internal.feature.project.projectSelector.projectChanged',
        itemDataKey: 'project',
        paginationContext: 'project-selector'
    });

    ProjectSelector.constructDataPageFromPreloadArray = _searchableSelector2.default.constructDataPageFromPreloadArray;

    /**
     * Build a Project from the metadata on the trigger.
     * @override
     * @return {Project} The newly created Project
     */
    ProjectSelector.prototype._getItemFromTrigger = function () {
        var $triggerItem = this.$trigger.find('.project');
        return new _project2.default(this._buildObjectFromElementDataAttributes($triggerItem));
    };

    /**
     * @param project
     */
    ProjectSelector.prototype.setSelectedItem = function (project) {
        if (project instanceof _project2.default && !project.isEqual(this._selectedItem)) {
            this._itemSelected(project);
        }
    };

    /**
     * Handle an item being selected.
     * This creates a new Project from the item data,
     * triggers the stash.feature.project.projectSelector.projectChanged event with the new Project,
     * sets the selectedItem to the new Project and updates the trigger and form field (if supplied)
     * @override
     *
     * @param {Object|Project}  projectData     The JSON data or Project model for the selected item.
     */
    ProjectSelector.prototype._itemSelected = function (projectData) {
        var project;
        if (projectData instanceof _project2.default) {
            project = projectData;
            projectData = projectData.toJSON();
        } else {
            projectData = _lodash2.default.pick(projectData, _lodash2.default.keys(_project2.default.prototype.namedAttributes));
            project = new _project2.default(projectData);
        }
        this._selectedItem = project;
        if (this._getOptionVal('field')) {
            (0, _jquery2.default)(this._getOptionVal('field')).val(project.getId());
        }
        this.updateTrigger({ project: projectData }, project.getName());
        _events2.default.trigger(this._getOptionVal('itemSelectedEvent'), this, project, this._getOptionVal('context'));
    };

    exports.default = ProjectSelector;
    module.exports = exports['default'];
});