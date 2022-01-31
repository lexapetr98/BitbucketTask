define('bitbucket/internal/feature/filebrowser/file-finder/file-finder', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/path', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/util/property', 'bitbucket/internal/widget/keyboard-controller', 'bitbucket/internal/widget/paged-scrollable'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _path, _ajax, _events, _function, _property, _keyboardController, _pagedScrollable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _path2 = babelHelpers.interopRequireDefault(_path);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _property2 = babelHelpers.interopRequireDefault(_property);

    var _keyboardController2 = babelHelpers.interopRequireDefault(_keyboardController);

    var _pagedScrollable2 = babelHelpers.interopRequireDefault(_pagedScrollable);

    var ListKeyboardController = _keyboardController2.default.ListKeyboardController;

    var maxDirectoryChildren = 100000;
    _property2.default.getFromProvider('page.max.directory.recursive.children').done(function (val) {
        maxDirectoryChildren = val;
    });

    function getRestFileFinderUrl(revision) {
        return _navbuilder2.default.rest().currentRepo().files().at(revision.getId()).withParams({ limit: maxDirectoryChildren }).build();
    }

    function getFileUrl(path, revision) {
        var browse = _navbuilder2.default.currentRepo().browse().path(path);

        if (!revision.isDefault()) {
            browse = browse.at(revision.getDisplayId());
        }

        return browse.build();
    }

    function lowerToCaseInsensitive(chr) {
        return chr !== chr.toUpperCase() ? '[' + RegExp.escape(chr.toUpperCase() + chr) + ']' : RegExp.escape(chr);
    }

    // Trim leading, trailing and multiple spaces.
    function trimSpaces(s) {
        return s.replace(/(^\s*)|(\s*$)/gi, '').replace(/[ ]{2,}/gi, ' ');
    }

    function getPattern(filter) {
        if (filter) {
            var patternStr = '';
            var splitFilter = trimSpaces(filter).split(/\*|\s|(?=[A-Z0-9]|\/|\.|-|_)/g);

            //Remove empty strings
            splitFilter = _lodash2.default.filter(splitFilter, _function2.default.not(_lodash2.default.isEmpty));

            var splitLength = splitFilter.length;
            if (splitLength) {
                patternStr = _lodash2.default.map(splitFilter, function (termPart) {
                    return '(' + _lodash2.default.map(termPart.split(''), lowerToCaseInsensitive).join('') + ')';
                }).join('.*?');
                return new RegExp('(' + patternStr + ')', 'g');
            }
        }
        return null;
    }

    function highlightMatches(pattern, str) {
        //TODO: port this to use util/highlight-text in the future
        str = _aui2.default.escapeHtml(str);
        return pattern ? str.replace(pattern, '<mark>$1</mark>') : str;
    }

    function FileFinder(container, revisionRef) {
        var self = this;
        this._isLoaded = false;
        this.fileTableSelector = container;
        this.currentRevisionRef = revisionRef;
        this.resultSetId = 0;
        this.$fileFinderInput = (0, _jquery2.default)('.file-finder-input');
        this.$textInput = (0, _jquery2.default)('input.filter-files');
        this.$fileFinderTip = (0, _jquery2.default)('.file-finder-tip');
        this.$spinner = (0, _jquery2.default)("<div class='spinner'/>").hide().insertAfter(this.fileTableSelector);

        _events2.default.on('bitbucket.internal.page.filebrowser.revisionRefChanged', function (revisionRef) {
            self.currentRevisionRef = revisionRef;
            self.files = undefined; //Clear cache as the revision has changed, we need to re-request
        });
    }

    // Not final yet, needs more thought
    FileFinder.prototype.tips = [_aui2.default.I18n.getText('bitbucket.web.file.finder.tip.1'), _aui2.default.I18n.getText('bitbucket.web.file.finder.tip.2'), _aui2.default.I18n.getText('bitbucket.web.file.finder.tip.3'), _aui2.default.I18n.getText('bitbucket.web.file.finder.tip.4'), _aui2.default.I18n.getText('bitbucket.web.file.finder.tip.5')];

    FileFinder.prototype._bindKeyboardNavigation = function () {
        this._filesKeyboardController = new ListKeyboardController(this.$textInput, (0, _jquery2.default)(this.fileTableSelector), {
            wrapAround: false,
            focusedClass: 'focused-file',
            itemSelector: 'tr.file-row',
            onSelect: function onSelect($focused) {
                window.location.href = $focused.find('a').attr('href');
            },
            requestMore: function requestMore() {
                var promise = _jquery2.default.Deferred();
                window.scrollTo(0, document.documentElement.scrollHeight);
                setTimeout(function () {
                    promise.resolve();
                });
                return promise;
            }
        });
    };

    FileFinder.prototype._showSpinner = function () {
        (0, _jquery2.default)('.filebrowser-banner').empty();
        (0, _jquery2.default)(this.fileTableSelector).empty();
        this.$spinner.show().spin('large');
    };

    FileFinder.prototype._hideSpinner = function () {
        this.$spinner.spinStop().hide();
    };

    FileFinder.prototype.isLoaded = function () {
        return this._isLoaded;
    };

    FileFinder.prototype.unloadFinder = function () {
        (0, _jquery2.default)('.breadcrumbs').removeClass('file-finder-mode');
        this.$textInput.blur().hide().val('');
        this.$fileFinderInput.removeClass('visible');
        this.$fileFinderTip.removeClass('visible');
        this._isLoaded = false;
        if (this._filesKeyboardController) {
            this._filesKeyboardController.destroy();
            this._filesKeyboardController = null;
        }
        this.tableView && this.tableView.reset();
        _events2.default.trigger('bitbucket.internal.feature.filefinder.unloaded');
    };

    FileFinder.prototype.loadFinder = function () {
        (0, _jquery2.default)('.filebrowser-banner').empty();
        (0, _jquery2.default)('.breadcrumbs').addClass('file-finder-mode');
        this.$textInput.focus();
        if (!this._isLoaded) {
            this.requestFiles();
            this._isLoaded = true;
        }
        _events2.default.trigger('bitbucket.internal.feature.filefinder.loaded');
    };

    FileFinder.prototype.requestFiles = function () {
        var self = this;

        this._showSpinner();
        if (this.files) {
            // Files have already been loaded
            this.onFilesLoaded();

            // slightly hacky since we don't do a request but it triggers a re-layout fixing an overlap in IE in narrow res
            this._hideSpinner();
        } else {
            _ajax2.default.rest({
                url: getRestFileFinderUrl(self.currentRevisionRef)
            }).done(function (data) {
                var files = data.values;
                if (!data.isLastPage) {
                    self.showLimitWarning();
                }
                self.files = [];
                for (var i = 0; i < files.length; i++) {
                    self.files.push({
                        name: files[i]
                    });
                }
                self.onFilesLoaded();
            }).always(function () {
                self._hideSpinner();
            });
        }
    };

    FileFinder.prototype.onFilesLoaded = function () {
        var self = this;
        var randomTip = this.tips[Math.floor(Math.random() * this.tips.length)];
        var currentTip = _aui2.default.I18n.getText('bitbucket.web.file.finder.tip.label') + ' ' + randomTip;
        this.$fileFinderInput.addClass('visible');
        this.$fileFinderTip.addClass('visible');
        this.$textInput.show();
        this.showFiles();
        this._bindKeyboardNavigation();
        this._filesKeyboardController.moveToNext();

        this.$fileFinderTip.tooltip({
            gravity: 'w',
            html: true,
            title: _function2.default.constant(currentTip)
        });

        var $input = this.$textInput;
        var inputVal = $input.val();

        function filterAndSelect(filter) {
            self.showFiles(filter);
            self._filesKeyboardController.setListElement((0, _jquery2.default)(self.fileTableSelector));
            self._filesKeyboardController.moveToNext();
        }

        //Unbind first in case the input has remained visible across multiple directory visits
        this.$textInput.unbind('keyup').on('keyup', function (e) {
            if (e.keyCode === 27) {
                _events2.default.trigger('bitbucket.internal.feature.filetable.hideFind', self);
            }
        }).on('keyup', _lodash2.default.debounce(function (e) {
            if (e.keyCode !== 27 && inputVal !== (inputVal = $input.val())) {
                filterAndSelect((0, _jquery2.default)(this).val());
            }
        }, 200)).focus();

        //Filter and select if there was
        if (inputVal) {
            filterAndSelect(inputVal);
        }
    };

    FileFinder.prototype.showFiles = function (filter) {
        this.filteredFiles = this.files;

        var pattern = getPattern(filter);

        if (this.tableView) {
            //kill the old table view - ensuring it unbinds document listeners
            this.tableView.reset();
        }
        //Filter files upfront since all files are pre-fetched anyway
        if (pattern && this.files.length > 0) {
            this.filteredFiles = _lodash2.default.filter(this.files, function (f) {
                pattern.lastIndex = 0;
                return pattern.test(f.name);
            });
            pattern.lastIndex = 0;

            //matches the filter pattern but only where there are no following /
            var filenamePattern = new RegExp(pattern.source + '(?!.*/)');
            var exactMatches = function exactMatches(file) {
                /*jshint boss:true */
                if (file.exactMatches) {
                    return file.exactMatches;
                }
                return file.exactMatches = _lodash2.default.includes(file.name, filter);
            };
            var filenameMatches = function filenameMatches(file) {
                /*jshint boss:true */
                if (file.matches) {
                    return file.matches;
                }
                return file.matches = filenamePattern.test(file.name);
            };

            this.filteredFiles.sort(function (f1, f2) {
                var f1ExactMatch = exactMatches(f1);
                var f2ExactMatch = exactMatches(f2);

                if (f1ExactMatch !== f2ExactMatch) {
                    return f1ExactMatch ? -1 : 1;
                }

                var f1FilenameMatches = filenameMatches(f1);
                var f2FilenameMatches = filenameMatches(f2);

                if (f1FilenameMatches === f2FilenameMatches) {
                    return f1.name.localeCompare(f2.name);
                }

                return f1FilenameMatches ? -1 : 1;
            });
        } else {
            _lodash2.default.forEach(this.files, function (f) {
                f.highlightedName = null;
                f.matches = null;
                f.exactMatches = null;
            });
        }

        this._makeFileFinderView(pattern);
    };

    FileFinder.prototype.showLimitWarning = function () {
        var $warning = (0, _jquery2.default)(bitbucket.internal.feature.filefinder.tableLimitedWarning({
            limit: maxDirectoryChildren
        }));
        (0, _jquery2.default)(this.fileTableSelector).parent().append($warning);
    };

    FileFinder.prototype._makeFileFinderView = function (pattern) {
        this.tableView = new FileFinderTableView(this.filteredFiles, pattern, this.fileTableSelector, this.currentRevisionRef, this.resultSetId++);
        //Load the first 50 elements
        this.tableView.init();
    };

    function FileFinderTableView(files, pattern, fileTableSelector, revisionRef, resultSetId) {
        _pagedScrollable2.default.call(this, null, {
            pageSize: 50,
            paginationContext: 'file-finder'
        });
        this.pattern = pattern;
        this.fileTableSelector = fileTableSelector;
        this.filteredFiles = files;
        this.currentRevisionRef = revisionRef;
        this.resultSetId = resultSetId;
    }

    _jquery2.default.extend(FileFinderTableView.prototype, _pagedScrollable2.default.prototype);

    FileFinderTableView.prototype.requestData = function (start, limit) {
        var self = this;
        var slice = this.filteredFiles.slice(start, start + limit);

        _lodash2.default.forEach(slice, function (f) {
            if (!f.url) {
                f.url = getFileUrl(new _path2.default(f.name), self.currentRevisionRef);
            }
            f.highlightedName = highlightMatches(self.pattern, f.name);
        });
        return _jquery2.default.Deferred().resolve({
            values: slice,
            size: slice.length,
            isLastPage: start + limit >= this.filteredFiles.length
        });
    };

    FileFinderTableView.prototype.attachNewContent = function (data, attachmentMethod) {
        var $tableContainer = (0, _jquery2.default)(this.fileTableSelector);

        if (attachmentMethod === 'html') {
            var $html = (0, _jquery2.default)(bitbucket.internal.feature.filefinder.fileFinderTable({
                files: data.values,
                resultSetId: this.resultSetId
            }));
            $tableContainer.replaceWith($html);
        } else {
            var append = attachmentMethod === 'append';
            var $tbody = (0, _jquery2.default)($tableContainer, 'table > tbody');

            _lodash2.default.forEach(data.values, function (file) {
                var $row = (0, _jquery2.default)(bitbucket.internal.feature.filefinder.fileFinderRow(_jquery2.default.extend({}, file, { name: file.highlightedName })));
                if (append) {
                    $tbody.append($row);
                } else {
                    $tbody.prepend($row);
                }
            });
        }
    };

    // Visible for testing
    FileFinder.highlightMatches = highlightMatches;
    FileFinder.getPattern = getPattern;

    exports.default = {
        FileFinder: FileFinder
    };
    module.exports = exports['default'];
});