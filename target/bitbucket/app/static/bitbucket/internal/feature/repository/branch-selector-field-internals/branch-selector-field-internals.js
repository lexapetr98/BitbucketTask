define('bitbucket/internal/feature/repository/branch-selector-field-internals/branch-selector-field-internals', ['@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/feature/repository/revision-reference-selector/revision-reference-selector', 'bitbucket/internal/model/revision-reference', 'bitbucket/internal/util/events', 'bitbucket/internal/widget/searchable-selector/searchable-selector'], function (_aui, _jquery, _lodash, _revisionReferenceSelector, _revisionReference, _events, _searchableSelector) {
    'use strict';

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _revisionReferenceSelector2 = babelHelpers.interopRequireDefault(_revisionReferenceSelector);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _searchableSelector2 = babelHelpers.interopRequireDefault(_searchableSelector);

    // HACK: We don't know when these fields might get removed from the DOM. In order to prevent memory leaks,
    // I'm destroying obsolete inputs when certain events happen.
    var fields = [];
    function destroyRemovedFields() {
        var newFields = [];
        var i = fields.length;
        while (i--) {
            if (!fields[i].$input.closest(document.body).length) {
                fields[i].destroy();
            } else {
                newFields.push(fields[i]);
            }
        }
        fields = newFields;
    }
    (0, _jquery2.default)(document).bind('hideLayer', function () {
        // Without timeout the dialogs aren't removed
        setTimeout(destroyRemovedFields, 0);
    });

    function processPreloadData(preloadData) {
        if (!preloadData || !_lodash2.default.isArray(preloadData)) {
            return null;
        }
        // inflate type for each item
        _lodash2.default.forEach(preloadData, function (item) {
            var realType = _revisionReference2.default.type.from(item.type);
            if (realType != null) {
                item.type = realType;
            }
        });
        return _searchableSelector2.default.constructDataPageFromPreloadArray(preloadData);
    }

    _events2.default.on('bitbucket.internal.widget.branchselector.inputAdded', function (id, options) {
        (0, _jquery2.default)(document).ready(function () {
            var $input;

            function initBranchSelectorField() {
                $input = $input.length ? $input : (0, _jquery2.default)('#' + id);

                if (!$input.length) {
                    console.log('Branch selector field (#' + id + ') was not found and not initialised. See https://jira.atlassian.com/browse/STASH-3914');
                }
                var $removeSelection = $input.nextAll('.remove-link');
                var preloadedRefs = processPreloadData(options.preloadData);
                var revisionReferenceSelector = new _revisionReferenceSelector2.default($input.prevAll('.branch-selector-field'), {
                    context: id,
                    field: $input,
                    triggerPlaceholder: options.triggerPlaceholder,
                    show: { tags: options.showTags },
                    preloadData: preloadedRefs,
                    extraClasses: options.extraClasses,
                    paginationContext: 'branch-selector-field'
                });
                if (options.revisionId) {
                    var fromPreloadData = preloadedRefs && _lodash2.default.find(preloadedRefs.values, {
                        id: options.revisionId
                    });
                    if (fromPreloadData) {
                        revisionReferenceSelector.setSelectedItem(new _revisionReference2.default({
                            id: fromPreloadData.id,
                            displayId: fromPreloadData.displayId,
                            type: fromPreloadData.type,
                            isDefault: false
                        }));
                    } else {
                        revisionReferenceSelector.setSelectedItem(_revisionReference2.default.hydrateRefFromId(options.revisionId));
                    }
                }
                $removeSelection.click(function (e) {
                    e.preventDefault();
                    revisionReferenceSelector.clearSelection();
                    $removeSelection.addClass('hidden');
                });
                var refChangedHandler = function refChangedHandler(revisionRef) {
                    if (this === revisionReferenceSelector) {
                        $input.val(revisionRef ? revisionRef.getId() : '');

                        _events2.default.trigger('bitbucket.component.branchSelector.change', null, {
                            elementId: id,
                            ref: revisionRef ? revisionRef.toJSON() : null
                        });

                        if (revisionRef.getType().id === _revisionReference2.default.type.TAG.id) {
                            $removeSelection.text(_aui2.default.I18n.getText('bitbucket.web.branch.selector.remove.tag'));
                        } else {
                            $removeSelection.text(_aui2.default.I18n.getText('bitbucket.web.branch.selector.remove.branch'));
                        }
                        $removeSelection.toggleClass('hidden', !revisionRef);
                    }
                };
                _events2.default.on('bitbucket.internal.feature.repository.revisionReferenceSelector.revisionRefChanged', refChangedHandler);
                fields.push({
                    $input: $input,
                    destroy: function destroy() {
                        _events2.default.off('bitbucket.internal.feature.repository.revisionReferenceSelector.revisionRefChanged', refChangedHandler);
                        revisionReferenceSelector.destroy();
                        revisionReferenceSelector = null;
                    }
                });
            }

            $input = (0, _jquery2.default)('#' + id);
            if ($input.length) {
                initBranchSelectorField();
            } else {
                _lodash2.default.defer(initBranchSelectorField);
            }
        });
    });
});