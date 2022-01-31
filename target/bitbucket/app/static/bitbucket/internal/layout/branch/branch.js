define('bitbucket/internal/layout/branch/branch', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/repository/revision-reference-selector/revision-reference-selector', 'bitbucket/internal/layout/branch/branch-layout-analytics', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/revision-reference', 'bitbucket/internal/util/events', 'bitbucket/internal/util/shortcuts'], function (module, exports, _jquery, _lodash, _navbuilder, _revisionReferenceSelector, _branchLayoutAnalytics, _pageState, _revisionReference, _events, _shortcuts) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _revisionReferenceSelector2 = babelHelpers.interopRequireDefault(_revisionReferenceSelector);

    var _branchLayoutAnalytics2 = babelHelpers.interopRequireDefault(_branchLayoutAnalytics);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    function onReady(revisionSelector, refQueryParam) {
        refQueryParam = refQueryParam || 'at';
        var addUrlToResults = function addUrlToResults(results) {
            results = _revisionReferenceSelector2.default.prototype._addRefTypeAndRepositoryToResults.call(this, results);

            var uri = _navbuilder2.default.parse(window.location.href);

            _lodash2.default.forEach(_lodash2.default.reject(results.values, 'url'), function (ref) {
                var refUri = uri.clone();
                refUri.replaceQueryParam(refQueryParam, ref.id);
                ref.url = refUri.query() + (refUri.anchor() ? refUri.anchor() : '');
            });

            return results;
        };

        var revisionReferenceSelector = new _revisionReferenceSelector2.default((0, _jquery2.default)(revisionSelector), {
            id: 'repository-layout-revision-selector-dialog',
            dataTransform: addUrlToResults
        });
        _shortcuts2.default.bind('branchSelector', _lodash2.default.ary(_jquery2.default.fn.click.bind(revisionReferenceSelector.$trigger), 0));

        _pageState2.default.setRevisionRef(revisionReferenceSelector.getSelectedItem());

        /* Cascade changes upward */
        _events2.default.on('bitbucket.internal.feature.repository.revisionReferenceSelector.revisionRefChanged', function (revisionReference) {
            if (this === revisionReferenceSelector) {
                _events2.default.trigger('bitbucket.internal.layout.branch.revisionRefChanged', this, revisionReference);
                _pageState2.default.setRevisionRef(revisionReferenceSelector.getSelectedItem());
            }
        });

        /* React to page changes */
        _events2.default.on('bitbucket.internal.page.*.revisionRefChanged', function (revisionReference) {
            revisionReferenceSelector.setSelectedItem(_revisionReference2.default.hydrateDeprecated(revisionReference));
        });

        // The 'branch' context is deprecated in 3.0.1 for removal in 4.0. use the 'repository' context instead
        _events2.default.on('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', function (keyboardShortcuts) {
            keyboardShortcuts.enableContext('branch');
        });
        var $actionsTrigger = (0, _jquery2.default)('#branch-actions');
        var $actionsMenu = (0, _jquery2.default)('#branch-actions-menu');
        $actionsMenu.on('aui-dropdown2-show', function () {
            _events2.default.trigger('bitbucket.internal.layout.branch.actions.dropdownShown');
            // Focus dropdown2 trigger because if coming from an open branch-selector, the hidecallback will focus
            // the branch selector trigger, hiding the branch-actions dropdown
            $actionsTrigger.focus();
            // dropdown items are client-web-items
            (0, _jquery2.default)(this).html(bitbucket.internal.layout.branch.actionsDropdownMenu({
                repository: _pageState2.default.getRepository().toJSON(),
                atRevisionRef: _pageState2.default.getRevisionRef().toJSON()
            }));
        }).on('aui-dropdown2-hide', function () {
            _events2.default.trigger('bitbucket.internal.layout.branch.actions.dropdownHidden');
        });

        _branchLayoutAnalytics2.default.initLayoutAnalytics($actionsMenu);
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});