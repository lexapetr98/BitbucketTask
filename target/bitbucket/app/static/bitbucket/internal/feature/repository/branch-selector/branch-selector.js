define('bitbucket/internal/feature/repository/branch-selector/branch-selector', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/internal/feature/repository/revision-reference-selector/revision-reference-selector'], function (module, exports, _aui, _jquery, _revisionReferenceSelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _revisionReferenceSelector2 = babelHelpers.interopRequireDefault(_revisionReferenceSelector);

    /**
     * A convenience wrapper around RevisionReferenceSelector for showing a selector with only branches.
     * @return {RevisionReferenceSelector} The new RevisionReferenceSelector instance
     *
     * @param {HTMLElement|jQuery}  trigger     The trigger (usually a button) to bind opening the selector to.
     * @param {Object}              options     A hash of options, valid options are specified in RevisionReferenceSelector.prototype.defaults
     */
    function BranchSelector(trigger, options) {
        //A branch selector is just a branches only `RevisionReferenceSelector`
        options = _jquery2.default.extend({
            show: { branches: true, tags: false, commits: false },
            triggerPlaceholder: _aui2.default.I18n.getText('bitbucket.web.branch.selector.default'),
            paginationContext: 'branch-selector'
        }, options);

        return new _revisionReferenceSelector2.default(trigger, options);
    }

    exports.default = BranchSelector;
    module.exports = exports['default'];
});