define('bitbucket/internal/page/branches/branches', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/repository/branch-table/branch-table', 'bitbucket/internal/model/revision-reference', 'bitbucket/internal/page/branches/branches-page-analytics', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/events', 'bitbucket/internal/util/history', 'bitbucket/internal/widget/error-dialog/error-dialog'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _branchTable, _revisionReference, _branchesPageAnalytics, _ajax, _events, _history, _errorDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _branchTable2 = babelHelpers.interopRequireDefault(_branchTable);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    var _branchesPageAnalytics2 = babelHelpers.interopRequireDefault(_branchesPageAnalytics);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    var _errorDialog2 = babelHelpers.interopRequireDefault(_errorDialog);

    var isInitial = void 0;
    var branchTable = void 0;
    var currentBaseRef = void 0;

    /**
     * Get the url to the passed ref. If no ref is passed it will return the URL to the branch list
     * @param {Object?} ref
     * @returns {string}
     */
    var getBranchListUrl = function getBranchListUrl(ref) {
        return _navbuilder2.default.currentRepo().branches(ref).build();
    };

    var pagePopToDefaultBaseRef = function pagePopToDefaultBaseRef() {
        window.location = getBranchListUrl();
    };

    /**
     * Show an error dialog and maybe revert back to the previous base ref
     * @param {Object} response
     * @param {Array<Object>} response.errors
     * @returns {Promise} - a jQuery Deferred
     */
    function invalidBaseRefHandler(_ref) {
        var errors = _ref.errors;

        var errorDialog = new _errorDialog2.default({
            panelContent: bitbucket.internal.widget.paragraph({
                text: (0, _lodash.get)(errors, '0.message', _aui2.default.I18n.getText('bitbucket.web.unknownerror'))
            }),
            titleText: _aui2.default.I18n.getText('bitbucket.web.branch.list.notfound')
        });

        if (isInitial) {
            errorDialog.dialogOptions.okButtonText = _aui2.default.I18n.getText('bitbucket.web.branch.list.back');
        }

        // if there is no ref to fall back to, pop the page to the branch list with no ref selected.
        errorDialog.addOkListener(function () {
            return isInitial ? pagePopToDefaultBaseRef() : _history2.default.back();
        });
        errorDialog.show();

        // return an empty deferred to skip _all_ error handling except this one
        // (if returns true -> default REST error handling, if returns false -> default PagedTable error handling)
        return _jquery2.default.Deferred();
    }

    function bindBaseBranch(branchTable) {
        _events2.default.on('bitbucket.internal.page.branches.revisionRefRemoved', function (deletedRef) {
            if (branchTable.isCurrentBase(deletedRef)) {
                pagePopToDefaultBaseRef();
            } else {
                branchTable.remove(deletedRef);
            }
        });
        _events2.default.on('bitbucket.internal.layout.branch.revisionRefChanged', function (selectedRef) {
            var baseRef = selectedRef.toJSON();
            if (baseRef.id === currentBaseRef.id) {
                return;
            }

            _history2.default.pushState({
                baseRef: baseRef,
                isInitial: false
            }, null, getBranchListUrl(baseRef));
        });

        _events2.default.on('bitbucket.internal.history.changestate', function (e) {
            var _e$state = e.state;
            currentBaseRef = _e$state.baseRef;
            isInitial = _e$state.isInitial;

            branchTable.update(currentBaseRef);
            _events2.default.trigger('bitbucket.internal.page.branches.revisionRefChanged', null, new _revisionReference2.default(currentBaseRef));
        });
    }

    function bindShortcuts(branchTable) {
        branchTable.initShortcuts();

        _events2.default.on('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', function (keyboardShortcuts) {
            return keyboardShortcuts.enableContext('branch-list');
        });
    }

    function onReady(containerSelector, branchTableId, repository, baseRef) {
        currentBaseRef = baseRef;
        _history2.default.initialState({
            baseRef: baseRef,
            isInitial: true
        });

        var $container = (0, _jquery2.default)(containerSelector);
        $container.append(bitbucket.internal.feature.repository.branchTable({
            repository: repository,
            baseRef: baseRef,
            id: branchTableId,
            filterable: false // The branch table is filterable but the filter is not in the default location
        }));
        branchTable = new _branchTable2.default({
            target: '#branch-list',
            filter: 'input[data-for="branch-list"]',
            statusCode: _ajax2.default.ignore404WithinRepository(invalidBaseRefHandler)
        }, baseRef);

        branchTable.init().then(_branchesPageAnalytics2.default.bindAnalyticsEvents);

        bindBaseBranch(branchTable);
        bindShortcuts(branchTable);
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});