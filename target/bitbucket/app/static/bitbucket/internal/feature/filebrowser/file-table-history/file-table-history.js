define('bitbucket/internal/feature/filebrowser/file-table-history/file-table-history', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/string-replacer'], function (module, exports, _jquery, _lodash, _events, _navbuilder, _server, _pageState, _analytics, _stringReplacer) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _stringReplacer2 = babelHelpers.interopRequireDefault(_stringReplacer);

    var lastHistoryRequest;
    var lastRequestStart;

    var commitMessageEnrichment = new _stringReplacer2.default();

    function abortLastRequest() {
        if (lastHistoryRequest) {
            lastHistoryRequest.abort();
        }
    }

    function _createCommitLink(shortMessage, commit, fileUrl) {
        // Don't link leading/trailing whitespace
        return bitbucket.internal.widget.filetablehistory.link({
            commit: commit,
            fileUrl: fileUrl,
            shortMessage: shortMessage.trim(),
            leadingSpaces: shortMessage.match(/^\s*/)[0],
            trailingSpaces: shortMessage.match(/\s*$/)[0]
        });
    }

    function updateHistory() {
        abortLastRequest();

        var ref = _pageState2.default.getRevisionRef();
        var commitId = ref.isCommit() ? ref.getId() : ref.getLatestCommit();
        var pathComponents = _pageState2.default.getFilePath().getComponents();

        lastHistoryRequest = _server2.default.rest({
            url: _navbuilder2.default.rest().currentRepo().lastModified().path(pathComponents).at(commitId).build(),
            statusCode: {
                404: false,
                500: false,
                0: function _(xhr, statusText) {
                    if (statusText === 'timeout') {
                        _analytics2.default.add('filetable.lastmodified.timeout');
                        return false;
                    }

                    if (statusText === 'abort') {
                        _analytics2.default.add('filetable.lastmodified.aborted', {
                            requestTime: Date.now() - lastRequestStart
                        });
                        return false;
                    }
                }
            }
        }).done(function (history) {
            _analytics2.default.add('filetable.lastmodified.succeeded', {
                //Only care about the request time, not the render time (below)
                requestTime: Date.now() - lastRequestStart
            });

            var $fileBrowserTable = (0, _jquery2.default)('.filebrowser-table');

            // only display latest commit message on files, not directories
            $fileBrowserTable.find('tr.file').each(function () {
                var $fileRow = (0, _jquery2.default)(this);
                var fileName = $fileRow.data('item-name');
                var commit = history.files[fileName];
                if (!commit) {
                    return;
                }
                var fileUrl = _navbuilder2.default.currentRepo().commit(commit.id).withFragment(pathComponents.concat(fileName).join('/')).build();

                // commit.message only contains the 'subject' part of the commit message (ie nothing after the first
                // '\n\n') - so no need to split it into subject and body here
                commitMessageEnrichment.process(commit.message, commit, function (commitMsgSubstr) {
                    return _createCommitLink(commitMsgSubstr, commit, fileUrl);
                }).then(function (replacements) {
                    $fileRow.append(bitbucket.internal.widget.filetablehistory.row({
                        linkHtml: replacements,
                        commit: commit
                    }));
                    $fileRow.find('.item-name').removeAttr('colspan');
                });
            });
            _lodash2.default.defer(function () {
                // this is sad, but it turns out you cannot add and animate an element in the same JS round
                // using a timeout to trigger the proper animation :(
                $fileBrowserTable.find('td.hide').removeClass('hide');
            });
        }).always(function () {
            lastHistoryRequest = null;
            lastRequestStart = null;
        });
        lastRequestStart = Date.now();
    }

    function init() {
        _events2.default.on('bitbucket.internal.feature.filebrowser.filesChanged', updateHistory);
        _events2.default.on('bitbucket.internal.feature.filefinder.unloaded', updateHistory);
        _events2.default.on('bitbucket.internal.feature.filefinder.loaded', abortLastRequest);
    }

    exports.default = {
        init: init,
        commitMessageEnrichment: commitMessageEnrichment
    };
    module.exports = exports['default'];
});