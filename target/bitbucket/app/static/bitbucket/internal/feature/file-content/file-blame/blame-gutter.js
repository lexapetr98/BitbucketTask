define('bitbucket/internal/feature/file-content/file-blame/blame-gutter', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/events', 'bitbucket/util/state', 'bitbucket/internal/bbui/widget/widget', 'bitbucket/internal/feature/file-content/diff-view-segment-types', 'bitbucket/internal/util/css', 'bitbucket/internal/util/object'], function (module, exports, _jquery, _lodash, _events, _state, _widget, _diffViewSegmentTypes, _css, _object) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _widget2 = babelHelpers.interopRequireDefault(_widget);

    var _diffViewSegmentTypes2 = babelHelpers.interopRequireDefault(_diffViewSegmentTypes);

    var _css2 = babelHelpers.interopRequireDefault(_css);

    var _object2 = babelHelpers.interopRequireDefault(_object);

    function createBlameElementCache(blames) {
        var repo = _state2.default.getRepository();
        var filePath = _state2.default.getFilePath().components.join('/');
        var blameStats = blames.map(function (blameSpan) {
            var templateData = {
                spannedLines: blameSpan.spannedLines,
                filePath: filePath,
                repository: repo,
                commit: _lodash2.default.assign({
                    id: blameSpan.commitHash,
                    displayId: blameSpan.displayCommitHash
                }, blameSpan)
            };
            var els = [];
            //Make the array indexes start at the lineNumber
            els[blameSpan.lineNumber] = (0, _jquery2.default)(bitbucket.internal.feature.fileContent.fileBlameGutterDetailed(templateData))[0];

            if (blameSpan.spannedLines === 1) {
                return {
                    commitId: blameSpan.commitHash,
                    els: els
                };
            }

            var restEl = (0, _jquery2.default)(bitbucket.internal.feature.fileContent.fileBlameGutterSpan(templateData))[0];
            els.push(restEl);

            return {
                commitId: blameSpan.commitHash,
                els: els.concat(_lodash2.default.times(blameSpan.spannedLines - 2, function () {
                    return restEl.cloneNode(true);
                }))
            };
        });

        //Merge the els arrays, preserving line indexes, into a new array
        var byLine = _jquery2.default.extend.apply(_jquery2.default, [[]].concat(_lodash2.default.map(blameStats, 'els')));

        var stat = {
            byLine: byLine,
            byCommitId: {},
            all: _lodash2.default.compact(byLine)
        };

        _lodash2.default.transform(blameStats, function (byCommitId, stat) {
            if (byCommitId[stat.commitId]) {
                byCommitId[stat.commitId] = byCommitId[stat.commitId].concat(_lodash2.default.compact(stat.els));
            } else {
                byCommitId[stat.commitId] = _lodash2.default.compact(stat.els);
            }
        }, stat.byCommitId);
        return stat;
    }

    var BLAME_GUTTER_ID = 'blame';

    function getSetGutterMarkerArgs(untilBlameElementsByLine, sinceBlameElementsByLine, change) {
        var setGutterMarkerArgs = [];

        return change.eachLine(function (lineInfo) {
            var blameEl;
            var lineHandle;

            switch (lineInfo.lineType) {
                case undefined:
                    //Source View
                    blameEl = untilBlameElementsByLine[lineInfo.lineNumber];
                    lineHandle = lineInfo.handles.SOURCE;
                    break;
                case _diffViewSegmentTypes2.default.ADDED:
                    blameEl = untilBlameElementsByLine[lineInfo.line.destination];
                    lineHandle = lineInfo.handles.TO;
                    break;
                case _diffViewSegmentTypes2.default.REMOVED:
                    blameEl = sinceBlameElementsByLine[lineInfo.line.source];
                    lineHandle = lineInfo.handles.FROM;
                    break;
                case _diffViewSegmentTypes2.default.CONTEXT:
                    //Normally use sinceBlame for context, unless it wasn't fetched due to criteria defined in blame-diff
                    if (sinceBlameElementsByLine) {
                        blameEl = sinceBlameElementsByLine[lineInfo.line.source];
                        lineHandle = lineInfo.handles.FROM;
                    } else {
                        blameEl = untilBlameElementsByLine[lineInfo.line.destination];
                        lineHandle = lineInfo.handles.TO;
                    }
                    break;
            }

            setGutterMarkerArgs.push([lineHandle, BLAME_GUTTER_ID, blameEl]);
        }).then(function () {
            return setGutterMarkerArgs;
        });
    }

    function BlameGutter(textView, requestBlame) {
        _widget2.default.call(this);
        this._enabled = false;
        this._textView = textView;
        this._requestBlame = requestBlame;
        this._pendingChanges = [];

        var self = this;
        this._textView.on('change', function (change) {
            if (self._pendingChanges) {
                self._pendingChanges.push(change);
            } else {
                self._fillForChange(change);
            }
        });

        this._textView.addContainerClass('blame-disabled');
        this._textView.registerGutter(BLAME_GUTTER_ID, { weight: 0 });
    }
    _object2.default.inherits(BlameGutter, _widget2.default);

    BlameGutter.prototype.setEnabled = function (shouldEnable) {
        shouldEnable = Boolean(shouldEnable);
        var whenChanged;
        if (this._enabled !== shouldEnable) {
            this._enabled = shouldEnable;
            if (this._enabled === shouldEnable) {
                // event listener didn't call setEnabled.
                if (shouldEnable) {
                    this._textView.removeContainerClass('blame-disabled');
                    whenChanged = this._fillGutter();
                } else {
                    this._textView.addContainerClass('blame-disabled');
                    whenChanged = _jquery2.default.Deferred().resolve();
                }
                var self = this;
                whenChanged.done(function () {
                    _events2.default.trigger('bitbucket.internal.feature.fileContent.fileBlameExpandedStateChanged', null, self._enabled);
                });
            }
        }
        return whenChanged || _jquery2.default.Deferred().resolve();
    };

    BlameGutter.prototype._addHoverBehavior = function (blameCache) {
        var $byCommitId = _lodash2.default.transform(blameCache.byCommitId, function ($byCommitId, els, commitId) {
            $byCommitId[commitId] = (0, _jquery2.default)(els);
        }, {});
        var _unhover;
        var hoveredCommitId;
        var unhoverTimeout;

        function mouseEnter(e) {
            if (e.target !== this) {
                return;
            }
            var commitId = this.getAttribute('data-commitid');
            clearTimeout(unhoverTimeout);

            if (hoveredCommitId === commitId) {
                return;
            }

            if (_unhover) {
                _unhover();
            }

            hoveredCommitId = commitId;
            var $newHovered = $byCommitId[commitId];
            var unstyle;
            // At some point the number of elements out of the DOM is so great it's actually slower to change them than to change global styles.
            // This especially affects IE, Firefox slightly, and Chrome almost not at all. But the result is that for very large
            // blames, we add rules to style them, instead of adding style classes
            if ($newHovered.length < 500) {
                $newHovered.addClass('commitid-hovered');
                unstyle = $newHovered.removeClass.bind($newHovered, 'commitid-hovered');
            } else {
                unstyle = _css2.default.appendRule('.blame.bitbucket-gutter-marker[data-commitid="' + commitId + '"] {' +
                // Change with @primaryHighlightColor and @primaryHighlight
                'background-color: #F4F5F7;' + 'border-right-color: #0065FF;' + '}');
            }
            _unhover = function unhover() {
                unstyle();
                hoveredCommitId = null;
                _unhover = null;
            };
        }

        function mouseLeave(e) {
            if (e.target !== this) {
                return;
            }
            if (_unhover) {
                unhoverTimeout = setTimeout(function () {
                    if (_unhover) {
                        _unhover();
                    }
                }, 100);
            }
        }

        // jQuery event handling invalidates layout due to copying of some properties on the event
        // So we're resorting to native handling.
        // Turns a 40ms frame into a 30ms one due to not having to do weird requests for SVG data URIs.
        blameCache.all.forEach(function (el) {
            el.addEventListener('mouseenter', mouseEnter);
            el.addEventListener('mouseleave', mouseLeave);
        });

        this._addDestroyable(function () {
            if (_unhover) {
                // must call this to remove added CSS rules.
                _unhover();
            }
        });
    };

    /**
     * Fill the gutter for a given change.
     *
     * @param {TextViewChange} change
     * @private
     */
    BlameGutter.prototype._fillForChange = function (change) {
        var untilBlameElementsByLine = this._untilBlameElCache && this._untilBlameElCache.byLine;
        var sinceBlameElementsByLine = this._sinceBlameElCache && this._sinceBlameElCache.byLine;
        var self = this;

        getSetGutterMarkerArgs(untilBlameElementsByLine, sinceBlameElementsByLine, change).done(function (setGutterMarkerArgs) {
            self._textView.operation(function () {
                setGutterMarkerArgs.forEach(function (args) {
                    if (!args[2]) {
                        // This means the line for the change is outside the range we have blame for
                        // A future improvement would be to request more blame, for now we just show nothing in the blame gutter.
                        return;
                    }

                    self._textView.setGutterMarker.apply(self._textView, args);
                });
            });
        });
    };

    /**
     * Fill the gutter the first time it is shown. Requires requesting the blame information for all existing changes.
     *
     * @private
     */
    BlameGutter.prototype._fillGutter = function () {
        if (this._gutterFilled) {
            return _jquery2.default.Deferred().resolve();
        }
        this._gutterFilled = true;

        var self = this;
        return this._requestBlame.get().done(function (untilBlames, sinceBlames) {
            if (untilBlames) {
                self._untilBlameElCache = createBlameElementCache(untilBlames);
                self._addHoverBehavior(self._untilBlameElCache);
            }
            if (sinceBlames) {
                self._sinceBlameElCache = createBlameElementCache(sinceBlames);
                self._addHoverBehavior(self._sinceBlameElCache);
            }

            self._textView.operation(function () {
                self._pendingChanges.forEach(self._fillForChange.bind(self));
            });
            self._pendingChanges = null;
        });
    };

    exports.default = BlameGutter;
    module.exports = exports['default'];
});