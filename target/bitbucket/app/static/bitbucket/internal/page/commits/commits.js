define('bitbucket/internal/page/commits/commits', ['module', 'exports', 'jquery', 'react', 'react-dom', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/commits/commits-table', 'bitbucket/internal/model/revision-reference', 'bitbucket/internal/util/events', 'bitbucket/internal/util/feature-enabled', 'bitbucket/internal/util/history', './commits-page-graph'], function (module, exports, _jquery, _react, _reactDom, _navbuilder, _commitsTable, _revisionReference, _events, _featureEnabled, _history, _commitsPageGraph) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _commitsTable2 = babelHelpers.interopRequireDefault(_commitsTable);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _featureEnabled2 = babelHelpers.interopRequireDefault(_featureEnabled);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    var atRevisionRef;
    var commitsTable;
    var merges;

    var commitGraphEnabled = false;
    _featureEnabled2.default.getFromProvider('commit.graph').done(function (enabled) {
        return commitGraphEnabled = enabled;
    });

    function getCommitsUrlBuilder(atRevRef) {
        var builder = _navbuilder2.default.currentRepo().commits();

        atRevRef = atRevRef || atRevisionRef;
        if (!atRevRef.isDefault()) {
            builder = builder.withParams({ until: atRevRef.getId() });
        }

        if (merges) {
            builder = builder.withParams({ merges: merges });
        }

        return builder;
    }

    function bindKeyboardShortcuts() {
        commitsTable.bindKeyboardShortcuts();

        _events2.default.on('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', function (keyboardShortcuts) {
            keyboardShortcuts.enableContext('commits');
        });

        var disableOpenHandler = function disableOpenHandler() {
            _events2.default.trigger('bitbucket.internal.keyboard.shortcuts.disableOpenItemHandler');
        };
        var enableOpenHandler = function enableOpenHandler() {
            _events2.default.trigger('bitbucket.internal.keyboard.shortcuts.enableOpenItemHandler');
        };
        _events2.default.on('bitbucket.internal.widget.branchselector.dialogShown', disableOpenHandler);
        _events2.default.on('bitbucket.internal.widget.branchselector.dialogHidden', enableOpenHandler);
        _events2.default.on('bitbucket.internal.layout.branch.actions.dropdownShown', disableOpenHandler);
        _events2.default.on('bitbucket.internal.layout.branch.actions.dropdownHidden', enableOpenHandler);
    }

    function onReady(atRevisionRefJSON, mergeFilter) {
        atRevisionRef = new _revisionReference2.default(atRevisionRefJSON);
        merges = mergeFilter;
        commitsTable = new _commitsTable2.default(getCommitsUrlBuilder, { focusFirstRow: true });
        commitsTable.init();

        if (commitGraphEnabled) {
            _reactDom2.default.render(_react2.default.createElement(_commitsPageGraph.CommitsPageGraph, {
                initialRows: commitsTable.$table.find('tr.commit-row').toArray(),
                headerRowHeight: commitsTable.$table.find('> thead > tr:first').outerHeight(),
                rowHeight: commitsTable.$table.find('> tbody > tr:last').outerHeight()
            }), document.getElementById('commit-graph-container'));
        }

        _events2.default.on('bitbucket.internal.layout.branch.revisionRefChanged', function (newAtRevisionRef) {
            if (atRevisionRef.getId() !== newAtRevisionRef.getId()) {
                _history2.default.pushState(newAtRevisionRef.toJSON(), null, getCommitsUrlBuilder(newAtRevisionRef).build());
            }
        });

        _events2.default.on('bitbucket.internal.history.changestate', function (e) {
            var state = e.state;
            if (state) {
                atRevisionRef = new _revisionReference2.default(state);
                commitsTable.update();
                _events2.default.trigger('bitbucket.internal.page.commits.revisionRefChanged', null, atRevisionRef);
            }
        });

        bindKeyboardShortcuts();

        _history2.default.initialState(atRevisionRef.toJSON());
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});