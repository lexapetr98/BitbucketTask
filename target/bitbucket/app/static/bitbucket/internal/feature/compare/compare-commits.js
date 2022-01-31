define('bitbucket/internal/feature/compare/compare-commits', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/commits/commits-table', 'bitbucket/internal/util/bacon'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _commitsTable, _bacon) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = onReady;

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _commitsTable2 = babelHelpers.interopRequireDefault(_commitsTable);

    var _bacon2 = babelHelpers.interopRequireDefault(_bacon);

    /**
     * Get a builder to build the URL used to fetch the list of commits.
     *
     * @param {SourceTargetSelector} sourceTargetSelector the UI component used to pick the source branch and repository
     * @returns {bitbucket/util/navbuilder.Builder} a builder to build the URL used to fetch the list of commits
     * @private
     */
    function getCommitsUrlBuilder(sourceTargetSelector) {
        var sourceRepo = sourceTargetSelector.getSourceRepository();
        return _navbuilder2.default.project(sourceRepo.getProject()).repo(sourceRepo).commits().withParams({
            until: sourceTargetSelector.getSourceBranch().getLatestCommit(),
            since: sourceTargetSelector.getTargetBranch().getLatestCommit(),
            secondaryRepositoryId: sourceTargetSelector.getTargetRepository().getId()
        });
    }

    function onReady(commitsTableWebSections) {
        var keyboardRegisterEvent = _bacon2.default.events('bitbucket.internal.widget.keyboard-shortcuts.register-contexts');
        return function renderCompareCommits(sourceTargetSelector, $el) {
            var $table = (0, _jquery2.default)(bitbucket.internal.feature.compare.commits({
                repository: sourceTargetSelector.getSourceRepository().toJSON(),
                commitsTableWebSections: commitsTableWebSections
            }));

            $el.append($table);

            var commitsTable = new _commitsTable2.default(_lodash2.default.partial(getCommitsUrlBuilder, sourceTargetSelector), {
                target: $table,
                webSections: commitsTableWebSections,
                allFetchedMessageHtml: _aui2.default.I18n.getText('bitbucket.web.repository.compare.allcommitsfetched'),
                noneFoundMessageHtml: _aui2.default.I18n.getText('bitbucket.web.repository.compare.nocommitsfetched')
            });

            commitsTable.init({ suspended: true }).done(function () {
                commitsTable.resume();
            });

            var keyboardDestroy = keyboardRegisterEvent.onValue(function (keyboardShortcuts) {
                keyboardShortcuts.enableContext('commits');
            });
            commitsTable.bindKeyboardShortcuts();

            return function () {
                keyboardDestroy();
                commitsTable.destroy();
            };
        };
    }
    module.exports = exports['default'];
});