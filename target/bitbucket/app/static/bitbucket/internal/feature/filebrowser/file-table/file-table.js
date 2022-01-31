define('bitbucket/internal/feature/filebrowser/file-table/file-table', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/filebrowser/file-table-history/file-table-history', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/path', 'bitbucket/internal/model/revision-reference', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/events', 'bitbucket/internal/util/history'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _fileTableHistory, _pageState, _path, _revisionReference, _ajax, _domEvent, _events, _history) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _fileTableHistory2 = babelHelpers.interopRequireDefault(_fileTableHistory);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _path2 = babelHelpers.interopRequireDefault(_path);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    function getParentURL(projectKey, repoSlug, path, revisionRef) {
        var parent = path && path.getParent();
        if (parent) {
            return buildUrl(projectKey, repoSlug, parent, revisionRef);
        }
        return '';
    }

    /*
     * If we came from a previous child directory or file, we want to initially select it.
     *
     * NOTE to the next person:
     * What we want is an algorithm that can handle a few different interactions:
     * 1. Use of the '..' button to go to the parent
     * 2. Use of the Back button to go to the parent
     * 3. Use of the breadcrumbs to go to a parent
     * 4. Stretch goal: Selecting the nth history item from the browser Back dropdown
     * AND it needs to work through infinite depth of noise.
     * - so pressing Back N times and then pressing '..' another M times should all highlight the right folder
     * - Refreshing the page at any point in that chain doesn't break it.
     * - Switching to File Finder and back doesn't break it
     *
     * The current method really only works when you use '..', because it relies on pushState holding the previous URL.
     * Pressing Back isn't handled because prevUrl will be for two history entries back, not the "forward" url we just came from.
     * document.referrer is whatever pointed us here (before all the pushState business)
     *
     * I'm punting on accomplishing this for now.
     */
    function getPrevChildDirOrFileName() {
        var prevUrl;
        var currentUrl = window.location.href;
        var state = _history2.default.state();

        if (state && state.prevUrl) {
            prevUrl = state.prevUrl;
        } else {
            prevUrl = document.referrer;
        }

        return getChildPathDifferenceBetweenUrls(prevUrl, currentUrl);
    }

    function appendSlashToUrl(url) {
        if (typeof url !== 'string') {
            return '/';
        }
        return url + (url.charAt(url.length - 1) !== '/' ? '/' : '');
    }

    /*
     * Find the difference between 2 urls, one assumed to be the child of the other.
     * Allow for differences in view operation (browse, diff, etc)
      */
    function getChildPathDifferenceBetweenUrls(prevUrl, currentUrl) {
        var prevDirOrFileName;
        var baseUrl;
        var baseRegex;

        // make sure we have 2 non-empty strings for urls.
        if (!(prevUrl && currentUrl) || typeof prevUrl !== 'string' || typeof currentUrl !== 'string') {
            return null;
        }

        // remove querystring from urls
        prevUrl = prevUrl.split('?')[0];
        currentUrl = currentUrl.split('?')[0];

        // if the previous url is shorter than the current url, it is not a child of currentUrl, so bail out.
        if (prevUrl.length < currentUrl.length) {
            return null;
        }

        currentUrl = appendSlashToUrl(currentUrl);

        baseUrl = _navbuilder2.default.currentRepo().build();
        // base url, minus '/browse', plus regex for view operation (browse, diff, etc)
        baseRegex = new RegExp(baseUrl.substring(0, baseUrl.lastIndexOf('/')) + '/.*?/');

        //Normalise the urls to the `browse` operation
        currentUrl = appendSlashToUrl(baseUrl) + currentUrl.split(baseRegex)[1];
        prevUrl = appendSlashToUrl(baseUrl) + prevUrl.split(baseRegex)[1];

        //split out the difference between the urls
        prevDirOrFileName = prevUrl.split(currentUrl)[1];

        //for paths containing multiple levels of directories, grab the topmost directory.
        if (prevDirOrFileName && _lodash2.default.includes(prevDirOrFileName, '/')) {
            prevDirOrFileName = prevDirOrFileName.substring(0, prevDirOrFileName.indexOf('/'));
        }

        return prevDirOrFileName ? decodeURIComponent(prevDirOrFileName) : null;
    }

    function buildUrl(projectKey, repoSlug, path, revisionRef) {
        var navBuilder = _navbuilder2.default.project(projectKey).repo(repoSlug).browse().path(path.toJSON());
        if (revisionRef && !(typeof revisionRef.isDefault === 'function' ? revisionRef.isDefault() : revisionRef.isDefault)) {
            return navBuilder.at(revisionRef.id || revisionRef.getId()).build();
        }
        return navBuilder.build();
    }

    function updateWarnings(fileCount, isTruncated) {
        (0, _jquery2.default)('.filebrowser-banner').replaceWith(bitbucket.internal.feature.filebrowser.warnings({
            isTruncated: isTruncated,
            message: _aui2.default.I18n.getText('bitbucket.web.file.browser.toomanyfiles', '' + fileCount)
        }));
    }

    function FileTable(path, revisionRef, maxDirectoryChildren) {
        _fileTableHistory2.default.init();

        var self = this;
        this.currentPath = path;
        this.currentRevisionRef = revisionRef;
        this.maxDirectoryChildren = maxDirectoryChildren;

        _events2.default.on('bitbucket.internal.history.changestate', function (e) {
            var state = e.state;
            if (!state || state.path === self.currentPath.toString() && state.revisionRef.id === self.currentRevisionRef.getId()) {
                //do nothing
            } else if (!state.children && !state.errors) {
                // Clicked back to initial state. We don't have JSON for this so fetch it
                var atRef = _revisionReference2.default.fromCommit({
                    id: state.revisionRef.latestCommit
                });
                self.requestData(_pageState2.default.getProject().getKey(), _pageState2.default.getRepository().getSlug(), new _path2.default(state.path), atRef, { popState: true }).done(function (data) {
                    self.dataReceived(_jquery2.default.extend(state, data));
                }).fail(function (xhr, textStatus, errorThrown, data) {
                    self.dataReceived(_jquery2.default.extend(state, data));
                });
            } else {
                self.dataReceived(state);
            }
        });

        _history2.default.initialState({
            path: path.toString(),
            revisionRef: revisionRef.toJSON()
        });

        _events2.default.on('bitbucket.internal.page.*.revisionRefChanged', function (revisionReference) {
            if (self.currentRevisionRef.getId() !== revisionReference.getId()) {
                self.requestData(_pageState2.default.getProject().getKey(), _pageState2.default.getRepository().getSlug(), self.currentPath, revisionReference);
            }
        });

        _events2.default.on('bitbucket.internal.page.*.urlChanged', function (url) {
            self.requestDataAtUrl(url);
        });
    }

    function internalizeData(data) {
        data.revisionRef = new _revisionReference2.default(data.revisionRef);
        data.path = new _path2.default(data.path);
        if (!isErrorResponse(data)) {
            data.parent = new _path2.default(data.parent);
            _lodash2.default.forEach(data.children.values, function (child) {
                var path = child.path;
                if (path.parent && path.parent.length) {
                    //path.parent is always relative to data.path; it will never
                    //include any overlapping levels
                    child.collapsedParents = path.parent + '/';
                }
                //path.name is the final part of the path, after path.parent; it's
                //the directory, file or submodule name
                child.name = path.name;
                //child.path.components is child.path.parent + child.path.name. the
                //parent might be empty, or might not if one or more subdirectories
                //have been collapsed. data.path + path.components together yields
                //the absolute path to the directory, file or submodule
                child.path = _path2.default.fromParentAndName(data.path, path.components);
                //lastly, the URL is built from the absolute path
                child.url = child.url || buildUrl(_pageState2.default.getProject().getKey(), _pageState2.default.getRepository().getSlug(), child.path, data.revisionRef);
            });
        }
    }

    FileTable.prototype.reload = function () {
        this.requestData(_pageState2.default.getProject().getKey(), _pageState2.default.getRepository().getSlug(), this.currentPath, this.currentRevisionRef);
    };

    FileTable.prototype.dataReceived = function (data) {
        internalizeData(data);
        if (data.path) {
            this.currentPath = data.path;
        }

        if (data.revisionRef && this.currentRevisionRef.getId() !== data.revisionRef.getId()) {
            this.currentRevisionRef = data.revisionRef;
            _events2.default.trigger('bitbucket.internal.feature.filetable.revisionRefChanged', this, data.revisionRef);
        }

        _events2.default.trigger('bitbucket.internal.feature.filetable.dataReceived', this, data);
    };

    FileTable.prototype.requestData = function (projectKey, repoSlug, path, revisionRef, opts) {
        return this.requestDataAtUrl(buildUrl(projectKey, repoSlug, path, revisionRef), revisionRef, opts);
    };

    var PathExtractor = new RegExp('(?:/?([^?#]*))([?][^#]*)?');
    FileTable.prototype.parsePathUrl = function (url) {
        if (url && url.length > 0) {
            var projKey = _pageState2.default.getProject().getKey();
            var repoSlug = _pageState2.default.getRepository().getSlug();
            var prefix = _navbuilder2.default.project(projKey).repo(repoSlug).browse().build();
            url = url.substring(url.indexOf(prefix) + prefix.length);

            var results = url.match(PathExtractor);
            if (results && results.length >= 2) {
                var o = {
                    projectKey: projKey,
                    repoSlug: repoSlug,
                    path: decodeURIComponent(results[1])
                };
                if (results.length === 3) {
                    o.query = results[2];
                }
                return o;
            }
        }
        return {};
    };

    FileTable.prototype.requestDataAtUrl = function (url, revisionRef, opts) {
        var self = this;
        var parsedPath = self.parsePathUrl(url);
        var path = new _path2.default(parsedPath.path);
        var query = parsedPath.query ? parsedPath.query : '';
        var queryString = _navbuilder2.default.parseQuery(query).replaceParam('limit', this.maxDirectoryChildren).toString();
        var restUrl = _navbuilder2.default.rest().project(parsedPath.projectKey).repo(parsedPath.repoSlug).browse().path(path).build() + queryString;

        opts = opts || {};
        var handlePushState = function handlePushState(data) {
            if (!opts.popState) {
                var state = self.data = _jquery2.default.extend({}, data, {
                    revisionRef: (revisionRef || self.currentRevisionRef).toJSON(),
                    projectKey: parsedPath.projectKey,
                    repoSlug: parsedPath.repoSlug,
                    path: parsedPath.path,
                    prevUrl: window.location.href
                });

                var href = window.location.href;
                var currentPath = href.substring(window.location.href.indexOf(window.location.pathname));
                if (currentPath !== url) {
                    _history2.default.pushState(state, '', url);
                } else {
                    self.dataReceived(state);
                }
            }
        };

        //the spinner is stopped in dataReceived, this is done later to cover more of the processing
        _events2.default.trigger('bitbucket.internal.feature.filetable.showSpinner', this, true);
        return _ajax2.default.rest({
            url: restUrl,
            statusCode: _ajax2.default.ignore404WithinRepository()
        }).done(function (data) {
            handlePushState(data);
        }).fail(function (xhr, textStatus, errorThrown, data) {
            handlePushState(data);
        });
    };

    function FileTableView(container) {
        var self = this;
        this.fileTableSelector = container;
        this.$spinner = (0, _jquery2.default)("<div class='spinner'/>").hide().insertAfter(this.fileTableSelector);

        // Optimisation. Only intercept clicks if pushState is supported
        (0, _jquery2.default)(document).on('click', container + ' .folder a', function (e) {
            if (_domEvent2.default.openInSameTab(e)) {
                _events2.default.trigger('bitbucket.internal.feature.filetable.urlChanged', self, (0, _jquery2.default)(this).attr('href'));
                e.preventDefault();
            }
        });

        (0, _jquery2.default)(document).on('mouseenter', '.submodule-name[title], .submodule-unlinked-commit[title]', function () {
            // we want to trigger _only_ on hover and NOT focus, which tipsy doesn't support. (we focus the first row on page load)
            // So we manually init each item on the first mouseenter.
            var $this = (0, _jquery2.default)(this);
            var tipsy = $this.tooltip({
                gravity: 'nw',
                trigger: 'manual'
            }).tipsy(true);

            tipsy.show();
            $this.on('mouseenter', function () {
                return tipsy.show();
            });
            $this.on('mouseleave', function () {
                return tipsy.hide();
            });
        });

        _events2.default.on('bitbucket.internal.feature.filetable.showSpinner', function () {
            (0, _jquery2.default)('.filebrowser-banner').empty();
            (0, _jquery2.default)(self.fileTableSelector).empty();
            self.$spinner.show().spin('large');
        });

        _events2.default.on('bitbucket.internal.feature.filetable.dataReceived', function (data) {
            self.update(data);
            _events2.default.trigger('bitbucket.internal.feature.filetable.hideSpinner', this);
        });

        _events2.default.on('bitbucket.internal.feature.filetable.hideSpinner', function () {
            self.$spinner.spinStop().hide();
        });

        this.focusInitialRow();
    }

    var DIRECTORY = 'DIRECTORY';
    FileTableView.prototype.getSortedFiles = function (files) {
        if (!files || files.length === 0) {
            return files;
        }

        // If you change this logic please update the corresponding logic in ViewFile.java
        return files.sort(function (a, b) {
            // Directories at the top - everything else down the bottom
            if (a.type === DIRECTORY ^ b.type === DIRECTORY) {
                return a.type === DIRECTORY ? -1 : 1;
            }
            // sort 'AbcaBC' into 'AaBbCc' - alphabetical first, then by case.
            // NOTE: FF and WebKit return DIFFERENT ORDERING for 'a'.localeCompare('A'), so we can't use it.
            // FF is very backward since it returns the opposite for 'a' < 'A'

            //Make sure the collapsed parents are included in the sort so that
            //`aaa/ccc` doesn't appear after `bbb`
            var aName = (a.collapsedParents || '') + a.path.getName();
            var bName = (b.collapsedParents || '') + b.path.getName();

            var aLower = aName.toLowerCase();
            var bLower = bName.toLowerCase();

            // don't use localeCompare - it's lowercase-first by default and sorts all(?) punctuation before letters
            // Conversely, the < and > operators just look at char values, so lowercase is after and punctuation is
            // mixed.
            //
            // > '/.,?!@#$%^&*():;\'"aA{'.split('').sort((a,b) => a.localeCompare(b)).map(c => c + c.charCodeAt(0))
            // [",44", ";59", ":58", "!33", "?63", ".46", "'39", ""34", "(40", ")41", "{123", "@64", "*42", "/47", "&38", "#35", "%37", "^94", "$36", "a97", "A65"]
            // > '/.,?!@#$%^&*():;\'"aA{'.split('').sort((a,b) => a < b ? -1 : 1).map(c => c + c.charCodeAt(0))
            // ["!33", ""34", "#35", "$36", "%37", "&38", "'39", "(40", ")41", "*42", ",44", ".46", "/47", ":58", ";59", "?63", "@64", "A65", "^94", "a97", "{123"]
            //
            // The < > behavior is easier to replicate server-side and client-side.

            if (aLower !== bLower) {
                return aLower < bLower ? -1 : 1;
            }
            return aName === bName ? 0 : aName < bName ? -1 : 1;
        });
    };

    FileTableView.prototype.update = function (data) {
        if (isErrorResponse(data)) {
            this.handleError(data);
        } else {
            var files = data.children.values;
            var isTruncated = !data.children.isLastPage;

            // Sort the files if we have only one page (ie, is the last page)
            if (!isTruncated) {
                files = this.getSortedFiles(files);
            }

            updateWarnings(files.length, isTruncated);

            var $html = (0, _jquery2.default)(bitbucket.internal.feature.filebrowser.fileTable({
                files: files,
                parentDirectoryUrl: getParentURL(_pageState2.default.getProject().getKey(), _pageState2.default.getRepository().getSlug(), new _path2.default(data.path), data.revisionRef)
            }));

            (0, _jquery2.default)(this.fileTableSelector).replaceWith($html);
            this.focusInitialRow();
        }
        _events2.default.trigger('bitbucket.internal.feature.filetable.pathChanged', this, data.path.toJSON());
    };

    FileTableView.prototype.handleError = function (data) {
        // if there are no errors and this is a file rather than a dir, redirect to the file.
        if (data && !data.errors && data.lines && data.path && data.revisionRef) {
            window.location.href = _navbuilder2.default.currentRepo().browse().path(data.path).at(data.revisionRef.getId()).build();
            return;
        }

        var errorMessage = data && data.errors && data.errors.length ? data.errors[0].message : _aui2.default.I18n.getText('bitbucket.web.ajax.unexpected.error');

        var html = bitbucket.internal.feature.filebrowser.fileTable({
            files: [],
            isError: true,
            errorMessage: errorMessage
        });

        (0, _jquery2.default)(this.fileTableSelector).replaceWith((0, _jquery2.default)(html));
    };

    FileTableView.prototype.getParentDirSelector = function () {
        return this.fileTableSelector + ' tr.browse-up a';
    };

    FileTableView.prototype.focusInitialRow = function () {
        var $rows = (0, _jquery2.default)(this.fileTableSelector).find('tr.file-row').not('.browse-up');
        var $prevDirOrFile;
        var prevDirOrFileName = getPrevChildDirOrFileName();

        if (prevDirOrFileName) {
            $prevDirOrFile = $rows.filter(function () {
                return (0, _jquery2.default)(this).find('a').text() === prevDirOrFileName;
            });
        }

        if ($prevDirOrFile && $prevDirOrFile.length) {
            $prevDirOrFile.addClass('focused-file').find('a').first().focus();
        } else if ($rows.first().length) {
            $rows.first().addClass('focused-file').find('a').first().focus();
        }
    };

    var isErrorResponse = function isErrorResponse(data) {
        return !(data && data.children);
    };

    exports.default = {
        FileTableView: FileTableView,
        FileTable: FileTable,
        getChildPathDifferenceBetweenUrls: getChildPathDifferenceBetweenUrls
    };
    module.exports = exports['default'];
});