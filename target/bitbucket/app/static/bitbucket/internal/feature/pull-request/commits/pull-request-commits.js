define('bitbucket/internal/feature/pull-request/commits/pull-request-commits', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/commits/commits-table', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/events', 'bitbucket/internal/util/history'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _commitsTable, _domEvent, _events, _history) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _commitsTable2 = babelHelpers.interopRequireDefault(_commitsTable);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    var _destroyables = void 0;
    var pullRequestId = void 0;
    var commitsTable = void 0;

    function getCommitsUrlBuilder() {
        var builder = _navbuilder2.default.currentRepo().pullRequest(pullRequestId).commits();

        return builder;
    }

    function init(options) {
        _destroyables = [];
        pullRequestId = options.pullRequest.getId();

        var $table = (0, _jquery2.default)(bitbucket.internal.feature.pullRequest.commits({
            repository: options.repository.toJSON(),
            commitsTableWebSections: options.commitsTableWebSections
        }));

        // HACK: We keep the table out of the DOM until it's fully initialized (for UX reasons).
        // HACK: To avoid multiple pages being loaded because of this, we suspend the commits table, and
        // HACK: resume once the table is in the DOM.
        // HACK: $fakeParent is required because paged-table adds a spinner as a sibling.
        var $fakeParent = (0, _jquery2.default)('<div />').append($table);

        commitsTable = new _commitsTable2.default(getCommitsUrlBuilder, {
            target: $table,
            webSections: options.commitsTableWebSections,
            allCommitsFetchedMessage: _aui2.default.I18n.getText('bitbucket.web.pullrequest.allcommitsfetched'),
            focusFirstRow: true
        });

        // HACK: see note on $fakeParent above.
        (0, _jquery2.default)(options.el).append(commitsTable.$spinner);

        // HACK: see note on $fakeParent above.
        var promise = commitsTable.init({ suspended: true }).done(function () {
            (0, _jquery2.default)(options.el).prepend($fakeParent.children());
            commitsTable.resume();
            commitsTable.bindKeyboardShortcuts();
        });

        _destroyables.push(_events2.default.chainWith((0, _jquery2.default)(document)).on('click', '.commits-table a.commitid', function (e) {
            var commitJSON = (0, _jquery2.default)(e.target).closest('tr').attr('data-commit-json');
            // Analytics event: stash.client.pullRequest.commit.open
            _events2.default.trigger('bitbucket.internal.feature.pullRequest.commit.open', this, {
                commitJSON: commitJSON ? JSON.parse(commitJSON) : null,
                pullRequest: options.pullRequest
            });
            // we have enough information to pushState & user hasn't specified to open link in new tab/window
            if (commitJSON && _domEvent2.default.openInSameTab(e)) {
                _history2.default.pushState({
                    commit: JSON.parse(commitJSON)
                }, null, e.target.href);
                e.preventDefault();
            }
            // else let it naturally page pop
        }));

        return promise;
    }

    function reset() {
        _lodash2.default.invokeMap(_destroyables, 'destroy');
        commitsTable.destroy();
        commitsTable = null;
    }

    exports.default = {
        init: init,
        reset: reset
    };
    module.exports = exports['default'];
});