define('bitbucket/internal/feature/file-content/file-blame/file-blame', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/file-content/diff-view-segment-types', 'bitbucket/internal/feature/file-content/file-blame/blame-diff', 'bitbucket/internal/feature/file-content/file-blame/blame-gutter', 'bitbucket/internal/feature/file-content/file-blame/blame-source', 'bitbucket/internal/model/content-tree-node-types', 'bitbucket/internal/model/file-change-types', 'bitbucket/internal/model/file-content-modes', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/promise', 'bitbucket/internal/util/shortcuts', 'bitbucket/internal/widget/button-trigger/button-trigger'], function (module, exports, _aui, _jquery, _lodash, _events, _navbuilder, _diffViewSegmentTypes, _blameDiff, _blameGutter, _blameSource, _contentTreeNodeTypes, _fileChangeTypes, _fileContentModes, _analytics, _promise, _shortcuts, _buttonTrigger) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _diffViewSegmentTypes2 = babelHelpers.interopRequireDefault(_diffViewSegmentTypes);

    var _blameDiff2 = babelHelpers.interopRequireDefault(_blameDiff);

    var _blameGutter2 = babelHelpers.interopRequireDefault(_blameGutter);

    var _blameSource2 = babelHelpers.interopRequireDefault(_blameSource);

    var _contentTreeNodeTypes2 = babelHelpers.interopRequireDefault(_contentTreeNodeTypes);

    var _fileChangeTypes2 = babelHelpers.interopRequireDefault(_fileChangeTypes);

    var _fileContentModes2 = babelHelpers.interopRequireDefault(_fileContentModes);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    var _shortcuts2 = babelHelpers.interopRequireDefault(_shortcuts);

    var _buttonTrigger2 = babelHelpers.interopRequireDefault(_buttonTrigger);

    function getDiffBlameOptions(fileChange, data) {
        var options;

        if (fileChange.type === _fileChangeTypes2.default.ADD || fileChange.type === _fileChangeTypes2.default.DELETE) {
            //Added or removed files have a simpler method to work out what lines are spanned.
            //There's only ever one hunk, and no context segments, so the destination or source span has all the info we need.
            var firstHunk = _lodash2.default.head(data.diff.hunks);
            options = {
                firstAddedLine: firstHunk.destinationLine,
                lastAddedLine: firstHunk.destinationSpan,
                firstRemovedLine: firstHunk.sourceLine,
                lastRemovedLine: firstHunk.sourceSpan
            };
        } else {
            //Discard context, combine all segment lines by type
            var groupedByType = _lodash2.default.chain(data.diff.hunks).flatMap('segments').reject(_lodash2.default.matchesProperty('type', _diffViewSegmentTypes2.default.CONTEXT)).groupBy('type').mapValues(function (segments) {
                return _lodash2.default.flatMap(segments, 'lines');
            }).value();

            var addedLines = groupedByType[_diffViewSegmentTypes2.default.ADDED] || [];
            var removedLines = groupedByType[_diffViewSegmentTypes2.default.REMOVED] || [];

            options = {
                firstAddedLine: addedLines.length && _lodash2.default.head(addedLines).destination,
                lastAddedLine: addedLines.length && _lodash2.default.last(addedLines).destination,
                firstRemovedLine: removedLines.length && _lodash2.default.head(removedLines).source,
                lastRemovedLine: removedLines.length && _lodash2.default.last(removedLines).source
            };
        }

        options.since = data.fromHash;
        options.until = data.toHash;

        return options;
    }

    function getSourceBlameOptions(fileChange, data) {
        return {
            firstLine: data.firstLine,
            lastLine: data.firstLine + data.linesAdded - 1,
            haveWholeFile: data.firstLine === 1 && data.isLastPage
        };
    }

    var locationMap = {
        '/browse': 'source-view',
        '/diff': 'diff-to-previous',
        '/commits/': 'commit',
        '/compare': 'compare-branch',
        '/pull-requests?create': 'create-pullrequest', //Must be before '/pull-requests'
        '/pull-requests': 'pullrequest'
    };

    function init() {
        _events2.default.on('bitbucket.internal.feature.fileContent.textViewInitializing', onTextView);

        function onTextView(textView, context) {
            var fileChange = context.fileChange;
            var $button = context.$toolbar.find('.file-blame');
            var requestBlame;
            var getBlameOptions;
            var viewLoadedEvent;
            var title = '';

            if (fileChange.nodeType === _contentTreeNodeTypes2.default.SUBMODULE) {
                $button.attr({
                    disabled: true,
                    'aria-disabled': true,
                    title: _aui.I18n.getText('bitbucket.web.file.content.sourceview.blame.submodule.disabled')
                });
                return;
            }

            if (context.contentMode === _fileContentModes2.default.SOURCE) {
                title = _aui.I18n.getText('bitbucket.web.file.content.sourceview.blame.file');
            } else if (context.contentMode === _fileContentModes2.default.DIFF) {
                title = _aui.I18n.getText('bitbucket.web.file.content.sourceview.blame.diff');
            }

            $button.attr({
                disabled: false,
                'aria-disabled': false,
                title: title
            });

            var triggerAnalytics = _lodash2.default.once(function (contentMode) {
                var repoBase = _navbuilder2.default.currentRepo().buildAbsolute();
                var pageName = _lodash2.default.find(locationMap, function (pageKey, path) {
                    if (_lodash2.default.startsWith(location.href, repoBase + path)) {
                        return pageKey;
                    }
                    return false;
                });

                _analytics2.default.add('blame.shown', {
                    type: contentMode,
                    source: pageName
                });
            });

            function setBlameOptions(data) {
                requestBlame.initBlameOptions(getBlameOptions(fileChange, data));
            }

            if ($button.length) {
                if (context.contentMode === _fileContentModes2.default.SOURCE) {
                    requestBlame = new _blameSource2.default(fileChange);
                    viewLoadedEvent = 'bitbucket.internal.feature.fileContent.sourceViewContentLoaded';
                    getBlameOptions = getSourceBlameOptions;
                } else if (context.contentMode === _fileContentModes2.default.DIFF) {
                    requestBlame = new _blameDiff2.default(fileChange);
                    viewLoadedEvent = 'bitbucket.internal.feature.fileContent.diffViewDataLoaded';
                    getBlameOptions = getDiffBlameOptions;
                } else {
                    return;
                }

                _events2.default.on(viewLoadedEvent, setBlameOptions);

                var blameGutter = new _blameGutter2.default(textView, requestBlame);
                var $spinner = (0, _jquery2.default)('<div class="blame-spinner"></div>');
                var blameButton = new _buttonTrigger2.default($button, {
                    stopEvent: false,
                    triggerHandler: function triggerHandler() {
                        this.setTriggerActive(!this.isTriggerActive());
                        _promise2.default.spinner($spinner.insertBefore($button), blameGutter.setEnabled(this.isTriggerActive()));
                        triggerAnalytics(context.contentMode);
                    }
                });

                var unbindShortcut = _shortcuts2.default.bind('showBlame', blameButton.triggerClicked.bind(blameButton));

                textView.on('destroy', function () {
                    unbindShortcut();
                    $spinner.remove();
                    _events2.default.off(viewLoadedEvent, setBlameOptions);
                    _lodash2.default.isFunction(blameGutter.destroy) && blameGutter.destroy();
                    blameGutter = null;
                    blameButton = null;
                    requestBlame = null;
                });
            }
        }

        return {
            destroy: function destroy() {
                _events2.default.off('bitbucket.internal.feature.fileContent.textViewInitializing', onTextView);
            }
        };
    }

    exports.default = {
        init: init
    };
    module.exports = exports['default'];
});