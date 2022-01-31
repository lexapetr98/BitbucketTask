define('bitbucket/internal/page/filebrowser/filebrowser', ['module', 'exports', '@atlassian/aui', 'chaperone', 'jquery', 'lodash', 'bitbucket/internal/feature/filebrowser/file-finder/file-finder', 'bitbucket/internal/feature/filebrowser/file-table/file-table', 'bitbucket/internal/model/content-tree-node-types', 'bitbucket/internal/model/path', 'bitbucket/internal/model/revision-reference', 'bitbucket/internal/util/events'], function (module, exports, _aui, _chaperone, _jquery, _lodash, _fileFinder, _fileTable, _contentTreeNodeTypes, _path, _revisionReference, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _chaperone2 = babelHelpers.interopRequireDefault(_chaperone);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _fileFinder2 = babelHelpers.interopRequireDefault(_fileFinder);

    var _fileTable2 = babelHelpers.interopRequireDefault(_fileTable);

    var _contentTreeNodeTypes2 = babelHelpers.interopRequireDefault(_contentTreeNodeTypes);

    var _path2 = babelHelpers.interopRequireDefault(_path);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var FileTable = _fileTable2.default.FileTable;
    var FileTableView = _fileTable2.default.FileTableView;
    var FileFinder = _fileFinder2.default.FileFinder;
    var dialogIsShowing;

    var fileTable;
    var fileTableView;
    var fileFinder;

    var findFilesTooltip;
    var browseFilesTooltip;
    var $findFilesItem;
    var $content;
    var $findFilesButton;
    var $browseFilesButton;

    function getFileNamesFromDOM() {
        return $content.find('.file-row a').map(function (i, row) {
            var $row = (0, _jquery2.default)(row);
            var $parent = $row.parent().parent();
            return {
                name: $row.text(),
                contentId: $row.attr('data-contentId'),
                type: $parent.hasClass('file') ? _contentTreeNodeTypes2.default.FILE : $parent.hasClass('directory') ? _contentTreeNodeTypes2.default.DIRECTORY : _contentTreeNodeTypes2.default.SUBMODULE
            };
        }).toArray();
    }

    function onReady(path, revisionRef, fileTableWrapper, fileTableContainer, maxDirectoryChildren) {
        var currentPath = new _path2.default(path);
        var currentRevisionRef = new _revisionReference2.default(revisionRef);

        $findFilesItem = (0, _jquery2.default)('.find-files');
        $content = (0, _jquery2.default)('.filebrowser-content');
        $findFilesButton = $findFilesItem.find('.find-files-button');
        $browseFilesButton = $findFilesItem.find('.browse-files-button');

        fileTableView = new FileTableView(fileTableWrapper);

        fileTable = new FileTable(currentPath, currentRevisionRef, maxDirectoryChildren);

        fileFinder = new FileFinder(fileTableContainer, currentRevisionRef);

        (0, _jquery2.default)(document).on('focus', '#browse-table tr.file-row', function () {
            (0, _jquery2.default)('.focused-file').removeClass('focused-file');
            (0, _jquery2.default)(this).addClass('focused-file');
        });

        _events2.default.on('bitbucket.internal.history.popstate', function (e) {
            if (e.state) {
                currentRevisionRef = new _revisionReference2.default(e.state.revisionRef);
            } // else ignore hashchange events
        });

        var pipeRevisionChanged = function pipeRevisionChanged(revisionReference) {
            if (currentRevisionRef !== revisionReference) {
                currentRevisionRef = revisionReference;
                _events2.default.trigger('bitbucket.internal.page.filebrowser.revisionRefChanged', null, revisionReference);
            }
        };
        _events2.default.on('bitbucket.internal.layout.branch.revisionRefChanged', pipeRevisionChanged);
        _events2.default.on('bitbucket.internal.feature.filetable.revisionRefChanged', pipeRevisionChanged);

        _events2.default.on('bitbucket.internal.widget.branchselector.dialogShown', function () {
            dialogIsShowing = true;
        });
        _events2.default.on('bitbucket.internal.widget.branchselector.dialogHidden', function () {
            dialogIsShowing = false;
        });

        var pipeUrlChanged = function pipeUrlChanged(url) {
            _events2.default.trigger('bitbucket.internal.page.filebrowser.urlChanged', null, url);
        };
        _events2.default.on('bitbucket.internal.layout.*.urlChanged', pipeUrlChanged);
        _events2.default.on('bitbucket.internal.feature.*.urlChanged', pipeUrlChanged);

        _events2.default.on('bitbucket.internal.feature.*.pathChanged', function (path) {
            currentPath = new _path2.default(path);
            _events2.default.trigger('bitbucket.internal.page.filebrowser.pathChanged', null, currentPath.toJSON());
        });

        _events2.default.on('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', function (keyboardShortcuts) {
            keyboardShortcuts.enableContext('filebrowser');
        });

        var showFinder = function showFinder() {
            if (!fileFinder.isLoaded()) {
                $findFilesButton.attr('aria-pressed', true);
                $browseFilesButton.attr('aria-pressed', false);

                fileFinder.loadFinder();
            }
        };

        var hideFinder = function hideFinder() {
            if (fileFinder.isLoaded()) {
                $findFilesButton.attr('aria-pressed', false);
                $browseFilesButton.attr('aria-pressed', true);

                fileFinder.unloadFinder();

                if (fileTable.data) {
                    fileTableView.update(fileTable.data);
                } else {
                    fileTable.reload();
                }
            }
        };

        _events2.default.on('bitbucket.internal.feature.filetable.showFind', showFinder);
        _events2.default.on('bitbucket.internal.feature.filetable.hideFind', hideFinder);
        //If the revision has changed, close the file finder and show the browse file link
        _events2.default.on('bitbucket.internal.page.filebrowser.revisionRefChanged', hideFinder);

        /**
         * Notify listeners of the initial files and when there are subsequent changes.
         */
        _events2.default.trigger('bitbucket.internal.feature.filebrowser.filesChanged', null, {
            files: getFileNamesFromDOM(),
            path: new _path2.default(path).toJSON(),
            revision: currentRevisionRef.getId()
        });
        _events2.default.on('bitbucket.internal.feature.filetable.dataReceived', function (data) {
            if (isDataReceivedErrorResponse(data)) {
                return;
            }
            _events2.default.trigger('bitbucket.internal.feature.filebrowser.filesChanged', null, {
                files: data.children.values.map(function (child) {
                    return _lodash2.default.pick(child, 'name', 'contentId', 'type');
                }),
                path: data.path,
                revision: data.revisionRef && data.revisionRef.id
            });
        });

        $findFilesButton.click(function () {
            _events2.default.trigger('bitbucket.internal.feature.filetable.showFind');
            return false;
        });

        $browseFilesButton.click(function () {
            _events2.default.trigger('bitbucket.internal.feature.filetable.hideFind');
            return false;
        });

        listenForKeyboardShortcutRequests();

        _chaperone2.default.registerFeature('watch-repository', [{
            id: 'watch-repository',
            alignment: 'top right',
            selector: '.watch-repository-feature-discovery-trigger',
            title: _aui2.default.I18n.getText('bitbucket.web.repository.watch.discovery.title'),
            content: bitbucket.internal.widget.paragraph({
                text: _aui2.default.I18n.getText('bitbucket.web.repository.watch.discovery.desc')
            }),
            close: {
                text: _aui2.default.I18n.getText('bitbucket.web.got.it')
            },
            width: 350,
            once: true
        }]);
    }

    /**
     * Indicate whether the data object from a dataReceived event is an error response
     *
     * @param {object} [data]
     * @returns {boolean}
     */
    function isDataReceivedErrorResponse(data) {
        return !(data && data.children);
    }

    function listenForKeyboardShortcutRequests() {
        var options = {
            focusedClass: 'focused-file',
            wrapAround: false,
            escToCancel: false
        };
        var rowSelector = '#browse-table tr.file-row';
        var focusedRowSelector = rowSelector + '.' + options.focusedClass;

        _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestMoveToNextHandler', function (keys) {
            (this.moveToNextItem ? this : _aui2.default.whenIType(keys)).moveToNextItem(rowSelector, options);
        });
        _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestMoveToPreviousHandler', function (keys) {
            (this.moveToPrevItem ? this : _aui2.default.whenIType(keys)).moveToPrevItem(rowSelector, options);
        });
        _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestOpenItemHandler', function (keys) {
            (this.execute ? this : _aui2.default.whenIType(keys)).execute(function () {
                if (!dialogIsShowing) {
                    var $focusItem = (0, _jquery2.default)(focusedRowSelector);
                    if ($focusItem.length) {
                        if ($focusItem.hasClass('file')) {
                            _events2.default.trigger('bitbucket.internal.feature.filetable.showSpinner', this);
                            window.location.href = $focusItem.find('a').attr('href');
                        } else {
                            $focusItem.find('a').click();
                        }
                    }
                }
            });
        });
        _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestOpenParentHandler', function (keys) {
            (this.execute ? this : _aui2.default.whenIType(keys)).execute(function () {
                if (!dialogIsShowing) {
                    var $parentDir = (0, _jquery2.default)(fileTableView.getParentDirSelector());
                    if ($parentDir.length) {
                        $parentDir.click();
                    }
                }
            });
        });

        _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestOpenFileFinderHandler', function (keys) {
            findFilesTooltip = _aui2.default.I18n.getText('bitbucket.web.file.finder.findfiles.tooltip', keys);
            $findFilesButton.attr('title', findFilesTooltip).tooltip({
                gravity: 'ne'
            });

            (this.execute ? this : _aui2.default.whenIType(keys)).execute(function () {
                _events2.default.trigger('bitbucket.internal.feature.filetable.showFind', this);
            });
        });
        _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestCloseFileFinderHandler', function (keys) {
            browseFilesTooltip = _aui2.default.I18n.getText('bitbucket.web.file.finder.browse.files.tooltip', keys);
            $browseFilesButton.attr('title', browseFilesTooltip).tooltip();

            (this.execute ? this : _aui2.default.whenIType(keys)).execute(function () {
                _events2.default.trigger('bitbucket.internal.feature.filetable.hideFind', this);
            });
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});