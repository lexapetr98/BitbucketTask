define('bitbucket/internal/feature/file-content/source-view/source-view', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/file-content/editor-mode', 'bitbucket/internal/feature/file-content/line-handle', 'bitbucket/internal/feature/file-content/request-source', 'bitbucket/internal/feature/file-content/source-line-info', 'bitbucket/internal/feature/file-content/text-view/attach-simple-scroll-behavior', 'bitbucket/internal/feature/file-content/text-view/text-view', 'bitbucket/internal/util/deep-linking', 'bitbucket/internal/util/function', 'bitbucket/internal/util/object', 'bitbucket/internal/util/promise', 'bitbucket/internal/util/property', 'bitbucket/internal/util/shortcuts'], function (module, exports, _aui, _jquery, _lodash, _events, _navbuilder, _editorMode, _lineHandle, _requestSource, _sourceLineInfo, _attachSimpleScrollBehavior, _textView, _deepLinking, _function, _object, _promise, _property, _shortcuts) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _editorMode2 = babelHelpers.interopRequireDefault(_editorMode);

    var _lineHandle2 = babelHelpers.interopRequireDefault(_lineHandle);

    var _requestSource2 = babelHelpers.interopRequireDefault(_requestSource);

    var _sourceLineInfo2 = babelHelpers.interopRequireDefault(_sourceLineInfo);

    var _attachSimpleScrollBehavior2 = babelHelpers.interopRequireDefault(_attachSimpleScrollBehavior);

    var _textView2 = babelHelpers.interopRequireDefault(_textView);

    var _deepLinking2 = babelHelpers.interopRequireDefault(_deepLinking);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _object2 = babelHelpers.interopRequireDefault(_object);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    var _property2 = babelHelpers.interopRequireDefault(_property);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    var tryWithLogging = _promise2.default.tryWithLogging;


    var BOM_CHAR_CODE = 65279;

    /**
     * Get a public change object for editor change/load events
     *
     * @param {ChangeObject} change
     * @returns {PublicChange}
     */
    function getPublicChange(change) {
        var clone = _lodash2.default.assign({}, change);
        return _object2.default.freeze(clone);
    }

    /**
     * Add line numbers to the editor's gutter
     *
     * @param {SourceView} sourceView - needs to be explicitly passed in so we can trigger events (the change only exposes the API)
     * @param {ContentChange} change
     */
    function addLineNumbers(sourceView, change) {
        var gutterMarkerArgs = [];
        var div = document.createElement('div');
        div.innerHTML = bitbucket.internal.feature.fileContent.sourceView.lineNumber();
        var element = div.childNodes[0];

        return change.eachLine(function (data) {
            var newElement = element.cloneNode(true);
            newElement.setAttribute('data-line-number', data.lineNumber);
            newElement.setAttribute('href', '#' + data.lineNumber);
            newElement.appendChild(document.createTextNode(data.lineNumber));

            gutterMarkerArgs.push([data.handles.SOURCE, 'line-number', newElement]);
        }).done(function () {
            sourceView.operation(function () {
                gutterMarkerArgs.forEach(function (args) {
                    sourceView.setGutterMarker.apply(sourceView, args);
                });
            });

            // fire the change event only once the lines are loaded.
            // This is necessary because we can't reliably address lines until the markers are rendered.
            var publicChange = getPublicChange(change);
            sourceView.trigger('change', publicChange);
            _events2.default.trigger('bitbucket.internal.feature.fileContent.sourceViewContentChanged', null, publicChange);
            if (change.type === 'INITIAL') {
                sourceView.trigger('load', publicChange);
                _events2.default.trigger('bitbucket.internal.feature.fileContent.sourceViewContentLoaded', null, publicChange);
            }
        });
    }

    /**
     *
     * @param {Object} data - REST data for the targeted page of source
     * @param {Object} options - options for the SourceView. Supports all otions listed on TextView.
     * @param {jQuery} options.$container - where to place the SourceView
     * @param {string} [options.anchor] - The hash encoded line numbers to focus initially
     * @param {boolean} [options.attachScroll] - whether to request full-page scroll control
     * @constructor
     */
    function SourceView(data, options) {
        var _this = this;

        _textView2.default.call(this, options.$container, options);
        var self = this;

        this._editor = this._createEditor();

        //Remove BOM marker from data so it's not displayed and doesn't interfere with editing.
        //Set a flag so we know to prepend it to the edited content when creating the blob
        if (data.lines[0].text.charCodeAt(0) === BOM_CHAR_CODE) {
            data.lines[0].text = data.lines[0].text.substr(1);
            this._hasBOM = true;
        }

        this._syntaxHighlighting(options.fileChange.path.name, data.lines[0].text, this._editor);

        this.registerGutter('line-number', { weight: 1000 });

        //initialise as empty collection rather than undefined so we can rely on jQuery to no-op
        this._$focusedLines = (0, _jquery2.default)([]);

        this.on('internal-change', function (change) {
            addLineNumbers(self, change).done(function () {
                if (options.anchor) {
                    self._whenOpDone(function () {
                        self.updateAnchor(options.anchor, true);
                    });
                }
            });
        });

        this._scrollingReady = new Promise(function (resolve) {
            _this._resolveScrolling = resolve;
        });
        this._scrollingReady.then(tryWithLogging(function () {
            _this._modify('INITIAL', data, _sourceLineInfo2.default.convertToLineInfos(data));
            _this._editor.setOption('scrollLineIntoViewFunc', function (lineInfo) {
                _this.scrollHandleIntoFocus(_this.getLineHandle({ lineNumber: lineInfo.from.line }));
            });
        }));
        this._scrollingReady.then(tryWithLogging(function () {
            return _this._loadRest(data);
        }));

        this.editing = this._getEditingContext(data);
    }
    _object2.default.inherits(SourceView, _textView2.default);
    SourceView.defaults = _textView2.default.defaults;

    SourceView.prototype.init = function () {
        var _this2 = this;

        _textView2.default.prototype.init.call(this);
        var self = this;
        if (this._options.attachScroll) {
            // Deferred to file-content-spinner is removed before any heights are calculated.
            _lodash2.default.defer(function () {
                return _this2._resolveScrolling(_this2._attachScrollBehavior());
            });
        } else {
            // instantly resolve it because we don't need scrolling
            this._resolveScrolling();
        }

        this._addDestroyable(_shortcuts2.default.bind('sourceViewFindPrev', function () {
            self._editor.execCommand('findPrev');
        }));
        this._addDestroyable(_shortcuts2.default.bind('sourceViewFindNext', function () {
            self._editor.execCommand('findNext');
        }));
        this._addDestroyable(_shortcuts2.default.bind('sourceViewFind', function () {
            self._editor.execCommand('find');
        }));

        var lastNumber = _lodash2.default.last(_deepLinking2.default.hashToLineNumbers(window.location.hash));

        (0, _jquery2.default)(this._editor.getWrapperElement()).on('click contextmenu', '.line-locator', function (e) {
            var newLineNumber = parseInt((0, _jquery2.default)(e.target).attr('href').substring(1), 10);

            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                e.preventDefault();
                var existingLineNumbers = _deepLinking2.default.hashToLineNumbers(window.location.hash);
                var newLineNumbers = _deepLinking2.default.updateSelectionRange(newLineNumber, {
                    existingLineNumbers: existingLineNumbers,
                    selectRange: !!e.shiftKey,
                    lastSelected: lastNumber
                });
                location.hash = _deepLinking2.default.lineNumbersToHash(newLineNumbers);

                //If the new line was removed from the selection, don't use it as an anchor for a range selection
                //It means the first shift+click after removing a line from the selection will add to, not extend, the selection
                newLineNumber = _lodash2.default.includes(newLineNumbers, newLineNumber) ? newLineNumber : null;
            }

            lastNumber = newLineNumber;
        });
    };

    /**
     * @param {Array<number>} lineNumbers - The line numbers to focus, one indexed
     * @param {boolean} shouldScrollIntoView - Whether to scroll the first focused line into view
     */
    SourceView.prototype.setFocusedLines = function (lineNumbers, shouldScrollIntoView) {
        //Unfocus existing lines, empty out _$focusedLines
        this._$focusedLines = this._$focusedLines.removeClass('target').filter();

        if (_lodash2.default.isEmpty(lineNumbers)) {
            return;
        }

        var handles = lineNumbers.map(function (lineNumber) {
            return {
                lineNumber: lineNumber
            };
        }).map(this.getLineHandle).filter(_lodash2.default.identity);

        if (handles.length) {
            this._$focusedLines = (0, _jquery2.default)(handles.map(_function2.default.dot('_handle.gutterMarkers.line-number')).filter(function (x) {
                return x;
            })).addClass('target');

            if (shouldScrollIntoView) {
                this.scrollHandleIntoFocus(_lodash2.default.head(handles));
            }
        }
    };

    /**
     * @param {string} anchor - The hash encoded line numbers to focus
     * @param {boolean} shouldScrollIntoView - Whether to scroll the first focused line into view
     */
    SourceView.prototype.updateAnchor = function (anchor, shouldScrollIntoView) {
        this.setFocusedLines(_deepLinking2.default.hashToLineNumbers(anchor), shouldScrollIntoView);
    };

    SourceView.prototype._getEditingContext = function (data) {
        var _this3 = this;

        if (!data.isLastPage) {
            return {
                editable: false,
                reason: _aui.I18n.getText('bitbucket.web.sourceview.button.edit.uneditable.large')
            };
        }

        var replacementPerformed = data.lines.some(function (line) {
            return _lodash2.default.includes(line.text, '\uFFFD');
        });
        if (replacementPerformed) {
            return {
                editable: false,
                reason: _aui.I18n.getText('bitbucket.web.sourceview.button.edit.uneditable.replacement')
            };
        }

        var prevDoc = void 0;

        var startEditing = function startEditing() {
            if (prevDoc) {
                return;
            }

            prevDoc = _this3._editor.getDoc().copy();
            setEditorWriteable();
        };

        var stopEditing = function stopEditing() {
            var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                discardChanges = _ref.discardChanges;

            if (!prevDoc) {
                return;
            }

            if (discardChanges) {
                _this3._editor.swapDoc(prevDoc);
            }

            setEditorReadOnly();
            prevDoc = null;
        };

        var setEditorWriteable = function setEditorWriteable() {
            _this3._$container.addClass('editing');
            _this3._editor.switchEditorMode(_editorMode2.default.EDIT);
            _this3._editor.clearGutter('line-number');
            _this3._scrollingReady.then(tryWithLogging(function (scrollControl) {
                return scrollControl && scrollControl.destroy();
            }));
            _this3._editor.refresh();
            _this3._editor.focus();

            var editorScrollTop = _this3._editor.getScrollInfo().top;
            var halfLineHeight = _this3._editor.defaultTextHeight() / 2;
            // add half the line height to the scrollTop to avoid ending up on the line that is now > 50% out of the viewport.
            var line = _this3._editor.lineAtHeight(editorScrollTop + halfLineHeight, 'local');
            _this3._editor.setCursor({ ch: 0, line: line });
        };

        var setEditorReadOnly = function setEditorReadOnly() {
            _this3._editor.switchEditorMode(_editorMode2.default.READONLY);
            _this3._$container.removeClass('editing');
            var lines = _this3._editor.getDoc().getValue().split('\n').map(function (text) {
                return { text: text };
            });
            var data = { lines: lines };
            _this3._modify('UPDATE', data, _sourceLineInfo2.default.convertToLineInfos(data));

            _this3._scrollingReady = Promise.resolve(_this3._options.attachScroll ? _this3._attachScrollBehavior() : undefined);
            _this3._scrollingReady.then(tryWithLogging(function () {
                return _this3._editor.scrollTo(0, 0);
            }));
        };

        var hasChanged = function hasChanged() {
            if (!prevDoc) {
                return false;
            }
            return getRawContent() !== prevDoc.getValue();
        };

        var getRawContent = function getRawContent() {
            return _this3._editor.getDoc().getValue(_textView2.default.DEFAULT_LINE_ENDING);
        };

        var getContent = function getContent() {
            return new Blob([(_this3._hasBOM ? String.fromCharCode(BOM_CHAR_CODE) : '') + getRawContent() + _textView2.default.DEFAULT_LINE_ENDING]);
        };

        var changes = function changes(fn) {
            var wrap = function wrap() {
                return fn(hasChanged());
            };
            _this3._editor.on('changes', wrap);
            var off = function off() {
                _this3._editor.off('changes', wrap);
            };
            _this3._addDestroyable(off);
            return off;
        };

        var linesTooLong = {
            editable: false,
            reason: _aui.I18n.getText('bitbucket.web.sourceview.button.edit.uneditable.truncated')
        };

        return data.lines.some(function (line) {
            return line.truncated;
        }) ? linesTooLong : {
            editable: true,
            startEditing: startEditing,
            stopEditing: stopEditing,
            hasChanged: hasChanged,
            getContent: getContent,
            changes: changes
        };
    };

    SourceView.prototype._acceptModification = function (changeType, newContentJSON, newContentLineInfos, at) {
        at = at || 0;
        var editor = this._editor;

        var text = _lodash2.default.chain(newContentJSON.lines).map('text').join(_textView2.default.DEFAULT_LINE_ENDING).value();

        switch (changeType) {
            case 'INITIAL':
                editor.setValue(text);
                break;
            case 'INSERT':
                editor._insert(text, at);
                break;
            case 'UPDATE':
                /*
                    new content has already been entered into the editor via
                    the edit process and no changes should be made to avoid
                    unnecessary updates.
                 */
                break;
            default:
                throw new Error('Unrecognized change type: ' + changeType);
        }

        newContentLineInfos.forEach(function (lineInfo, i) {
            var handle = new _lineHandle2.default(undefined, undefined, lineInfo.lineNumber, editor.getLineHandle(i + at));
            lineInfo._setHandle(handle);
        });
    };

    SourceView.prototype._attachScrollBehavior = function () {
        return (0, _attachSimpleScrollBehavior2.default)(this, this._editor, (0, _jquery2.default)(this._editor.getWrapperElement()));
    };

    SourceView.prototype._getChangeAttributes = function (changeType, sourcePage) {
        return {
            firstLine: sourcePage.start + 1,
            isLastPage: sourcePage.isLastPage
        };
    };

    SourceView.prototype._loadRest = function (startingData) {
        var self = this;
        function loadRange(start, end) {
            var requestOptions = {
                start: start,
                limit: end - start
            };
            return (0, _requestSource2.default)(self._options.fileChange, requestOptions).then(function (data) {
                if (data.size < requestOptions.limit && !data.isLastPage) {
                    return loadRange(start + data.size, end).then(function (restOfData) {
                        return combineData(data, restOfData);
                    });
                }
                return data;
            });
        }
        function combineData(first, second) {
            return {
                start: first.start,
                lines: first.lines.concat(second.lines),
                size: first.size + second.size,
                isLastPage: second.isLastPage
            };
        }
        function insert(at, data) {
            if (data) {
                self._modify('INSERT', data, _sourceLineInfo2.default.convertToLineInfos(data), at);
            }
        }

        var haveStart = startingData.start;
        var haveEnd = startingData.start + startingData.size;

        _property2.default.getFromProvider('display.max.source.lines').done(function (capacity) {
            var before = haveStart > 0 ? loadRange(0, haveStart) : _jquery2.default.Deferred().resolve();
            var after = !startingData.isLastPage && haveEnd < capacity ? loadRange(haveEnd, capacity) : _jquery2.default.Deferred().resolve();

            // only modify once they are both ready to go. This lets us keep them in the same operation.
            _jquery2.default.when(before, after).done(function (beforeValue, afterValue) {
                if (!self._editor) {
                    return; // already destroyed
                }
                self._editor.operation(function () {
                    insert(0, beforeValue);
                    insert(self._editor.lastLine() + 1, afterValue);

                    after.then(function isCapacityExceeded(afterData) {
                        var capacityReached = afterData ? !afterData.isLastPage : haveEnd >= capacity && !startingData.isLastPage;
                        if (capacityReached) {
                            self._renderCapacityReached();
                        }
                    });
                });

                self._$container.addClass('fully-loaded');
                self.trigger('resize');
            });
        });
    };

    SourceView.prototype._renderCapacityReached = function () {
        var fileChange = this._options.fileChange;
        var msgEl = (0, _jquery2.default)(bitbucket.internal.feature.fileContent.sourceView.capacityReachedLineWidget({
            rawUrl: _navbuilder2.default.currentRepo().raw().path(fileChange.path).at(fileChange.commitRange.untilRevision.id).build()
        }))[0];
        this._$container.addClass('capacity-reached');
        this._editor.addLineWidget(this._editor.lastLine(), msgEl, {
            coverGutter: true,
            noHScroll: true
        });
        this.trigger('resize');
    };

    SourceView.prototype._editorForHandle = function () {
        return this._editor;
    };

    exports.default = SourceView;
    module.exports = exports['default'];
});