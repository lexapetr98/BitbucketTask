define('bitbucket/internal/feature/commit/difftree/difftree-search', ['module', 'exports', '@atlassian/aui', 'baconjs', 'jquery', 'lodash', 'bitbucket/internal/feature/commit/difftree/difftree-search-input', 'bitbucket/internal/model/path', 'bitbucket/internal/model/path-and-line', 'bitbucket/internal/util/bacon', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/util/promise', 'bitbucket/internal/util/shortcuts'], function (module, exports, _aui, _baconjs, _jquery, _lodash, _difftreeSearchInput, _path, _pathAndLine, _bacon, _events, _function, _promise, _shortcuts) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _baconjs2 = babelHelpers.interopRequireDefault(_baconjs);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _difftreeSearchInput2 = babelHelpers.interopRequireDefault(_difftreeSearchInput);

    var _path2 = babelHelpers.interopRequireDefault(_path);

    var _pathAndLine2 = babelHelpers.interopRequireDefault(_pathAndLine);

    var _bacon2 = babelHelpers.interopRequireDefault(_bacon);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    /**
     * Represents a single line change.
     *
     * @typedef {Object} LineChangeData
     * @property {string} path
     * @property {string} type
     * @property {number} lineNumber
     * @property {string} line
     */

    function TextWrapper(text, caseSensitive) {
        return {
            length: text.length,
            indexOf: function indexOf(s, offset) {
                return caseSensitive ? s.indexOf(text, offset) : s.toLowerCase().indexOf(text.toLowerCase(), offset);
            }
        };
    }

    /**
     *
     * @param {string} line - the line of text to decorate
     * @param {TextWrapper} filter - case insensitive filter for finding the index in another string
     * @returns {string} an HTML value to be displayed
     */
    function decorateTitle(line, filter) {
        // Number of characters to show before the first match of the filtered text
        // This depends somewhat on the current default width of the difftree
        var magicOffset = 30;
        var i = filter.indexOf(line);
        line = i > magicOffset ? '...' + line.substring(i - magicOffset) : line;
        var offset = 0;
        var html = '';
        for (var j = 0; offset < line.length && j < 100; j++) {
            i = filter.indexOf(line, offset);
            i = i < 0 ? line.length : i;
            html += _aui2.default.escapeHtml(line.substring(offset, i));
            if (i < line.length) {
                html += '<strong>' + _aui2.default.escapeHtml(line.substring(i, i + filter.length)) + '</strong>';
            }
            offset = i + filter.length;
        }
        return html;
    }

    /**
     * Indexes the tree data by file path so file nodes can be quickly referenced.
     *
     * @param {DiffTreeData} diffTreeData
     * @returns {Object.<string, DiffTreeData>}
     */
    function indexFiles(diffTreeData) {
        var dataByFilePath = {};
        function indexDataRecursive(data) {
            if (data.metadata.isDirectory) {
                data.children.forEach(indexDataRecursive);
            } else {
                dataByFilePath[data.data.attr.href.substring(1)] = data;
            }
        }
        indexDataRecursive(diffTreeData);
        return dataByFilePath;
    }

    /**
     * We're using Bacon here as a convenience for lazy streams (or creating a new array).
     * Be warned that Bacon is only a 'hot' stream, and will only support one consumer (eg. the first onValue() call).
     * We may want to investigate lazy.js or RxJS as an alternative at some point.
     *
     * @param {DiffData} data
     * @returns {Bacon<LineChangeData>}
     */
    function convertHunksToLines(data) {
        return _baconjs2.default.fromBinder(function (sink) {
            data.diffs.forEach(function (diff) {
                // By default we want destination unless the file has been removed
                var file = new _path2.default(diff.destination || diff.source);
                (diff.hunks || []).forEach(function (hunk) {
                    hunk.segments.forEach(function (segment) {
                        segment.lines.forEach(function (line) {
                            sink({
                                path: file.toString(),
                                type: segment.type,
                                // By default we want the destination line unless there is none
                                lineNumber: segment.type === 'ADDED' ? line.destination : line.source,
                                line: line.line
                            });
                        });
                    });
                });
            });
            // Make sure we flush!
            sink(new _baconjs2.default.End());
            return _jquery2.default.noop;
        });
    }

    /**
     * Filters a copy (in place) of the difftree data with a subset of the hunk results that match 'text'.
     * This is _very_ much about the format of the data that jstree expects.
     *
     * @param {DiffTreeData} difftreeData
     * @param {TextWrapper} text
     * @param {DiffData} results
     * @returns {DiffTreeData}
     */
    function filterDiffTree(difftreeData, text, results) {
        // Search results _may_ have been truncated see STASH-7517 for some more background
        difftreeData.searchTruncated = results.truncated;
        var fileMap = indexFiles(difftreeData);
        // The only reason we want to split on path is to calculate the longest 'lineNumber' to align the numbers,
        // otherwise don't bother...
        _bacon2.default.split(convertHunksToLines(results).filter(function (line) {
            // Can't use `_.includes` because of the TextWrapper insanity. `indexOf` here is not `String.prototype.indexOf`
            // eslint-disable-next-line lodash/prefer-includes
            return text.indexOf(line.line) >= 0;
        }), _function2.default.dot('path')).onValue(function (fileLines) {
            // Calculate the maximum lineNumber length (as a string) just for display purposes
            var maxLineNumberLength = _lodash2.default.reduce(fileLines, function (l, line) {
                return Math.max(l, line.lineNumber.toString().length);
            }, 0);
            fileLines.forEach(function (row) {
                var data = fileMap[row.path];
                // Should never happen, except when the user rescopes and adds a new file
                // For now we will ignore it, but longer term we need a way of 'updating' the list of files
                if (!data) {
                    return;
                }

                data.children = data.children || [];
                var path = new _pathAndLine2.default(row.path, row.lineNumber, row.type === 'ADDED' ? 'TO' : 'FROM');
                var title = bitbucket.internal.feature.difftree.searchTreeNode({
                    changeType: row.type,
                    lineNumber: row.lineNumber.toString(),
                    padding: maxLineNumberLength,
                    titleContent: decorateTitle(row.line.trim(), text)
                });
                data.children.push({
                    data: {
                        title: title,
                        attr: {
                            class: 'jstree-search-leaf',
                            title: row.line.trim(),
                            href: '#' + path.toString()
                        }
                        // Copy the metadata over to let tree-and-diff-view play nice
                    },
                    metadata: _lodash2.default.assign({}, data.metadata, { path: path })
                });
            });
        });

        // TODO Currently this only updates the original structure, so we may have sub-folders where none are needed
        // We should recreate only the 'directories' that we need to support the searched files
        function filterEmptyNodes(tree) {
            tree.children = tree.children.filter(function (child) {
                if (child.metadata.isDirectory) {
                    return filterEmptyNodes(child);
                }
                return child.children && child.children.length > 0;
            });
            return tree.children.length > 0;
        }
        filterEmptyNodes(difftreeData);

        var analyticsData = {
            linesMatched: _lodash2.default.reduce(difftreeData.children, function (sum, child) {
                return sum + child.children.length;
            }, 0),
            filesMatched: difftreeData.children.length,
            searchTruncated: difftreeData.searchTruncated
        };
        _events2.default.trigger('bitbucket.internal.ui.diff-view.search.result.details', null, analyticsData);

        return difftreeData;
    }

    function DiffTreeSearch(caseSensitive) {
        this.input = new _difftreeSearchInput2.default({
            placeholder: _aui2.default.I18n.getText('bitbucket.web.difftree.search.placeholder')
        });
        this.caseSensitive = caseSensitive;

        this._destroyables = [];
        this._destroyables.push(this.input);
        this._destroyables.push(_events2.default.chainWith(this.input.$el.closest('form')).on('submit', _function2.default.invoke('preventDefault')));
        this._destroyables.push({
            destroy: _shortcuts2.default.bind('requestDiffTreeSearch', this.focusSearch.bind(this))
        });
    }

    /**
     * Start listening for search inputs and return a stream of difftree updates to be rendered.
     *
     * @param {function(string): Promise<DiffData>} requestFilteredDiffs - callback for requesting a diff
     * @param {function(): DiffTreeData} getDiffTreeData - callback for returning the difftree data
     * @returns {Bacon<DiffTreeData>} a stream of data updates as the user updates their search
     */
    DiffTreeSearch.prototype.register = function (requestFilteredDiffs, getDiffTreeData) {
        var self = this;
        var inputs = this.input.getInputs();
        return inputs.flatMap(function (text) {
            if (!text) {
                // Blank text should clear the search and restore the tree to it's 'normal' state
                return _baconjs2.default.fromArray([{ data: getDiffTreeData(), search: text }]);
            }
            var $spinner = (0, _jquery2.default)('<div class="difftree-search-spinner"></div>').prependTo(self.input.$el);
            var $searchIcon = self.input.$el.parent().find('.search-icon');
            $searchIcon.addClass('invisible');
            var promise = _promise2.default.spinner($spinner, requestFilteredDiffs(text)).always(function () {
                $searchIcon.removeClass('invisible');
            });
            return _baconjs2.default.fromPromise(promise, true
            // Cancel if newer inputs have taken flight
            ).takeUntil(inputs).map(_lodash2.default.partial(filterDiffTree, _jquery2.default.extend(true, {}, getDiffTreeData()), new TextWrapper(text, self.caseSensitive))).map(function (data) {
                return { data: data, search: text };
            });
        });
    };

    DiffTreeSearch.prototype.focusSearch = function () {
        this.trigger('search-focus');
        this.input.$el.find('input').focus();
    };

    _lodash2.default.assign(DiffTreeSearch.prototype, _events2.default.createEventMixin('diffTreeSearch', { localOnly: true }));

    DiffTreeSearch.prototype.destroy = function () {
        _lodash2.default.invokeMap(this._destroyables, 'destroy');
    };

    exports.default = {
        DiffTreeSearch: DiffTreeSearch,
        // All for testing
        _filterDiffTree: filterDiffTree,
        _Text: TextWrapper,
        _decorateTitle: decorateTitle
    };
    module.exports = exports['default'];
});