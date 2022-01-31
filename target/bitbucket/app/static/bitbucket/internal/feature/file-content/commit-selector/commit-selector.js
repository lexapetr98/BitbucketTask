define('bitbucket/internal/feature/file-content/commit-selector/commit-selector', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/path', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/events', 'bitbucket/internal/widget/keyboard-controller', 'bitbucket/internal/widget/paged-scrollable'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _path, _ajax, _events, _keyboardController, _pagedScrollable) {
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

    var _keyboardController2 = babelHelpers.interopRequireDefault(_keyboardController);

    var _pagedScrollable2 = babelHelpers.interopRequireDefault(_pagedScrollable);

    var ListKeyboardController = _keyboardController2.default.ListKeyboardController;

    /**
     * Select commits from a dropdown
     *
     * @param {Object} options
     * @param {String} options.id - a unique identifier for this selector
     * @param {jQuery|HTMLElement|String} options.buttonEl - the existing element to attach to as trigger
     * @constructor
     */
    function CommitSelector(options) {
        var _this = this;

        var id = options.id,
            buttonEl = options.buttonEl;

        this._$selectorButton = (0, _jquery2.default)(buttonEl);

        this._id = '#inline-dialog-' + id;
        this._scrollPaneSelector = this._id + ' .commit-selector';
        this._listSelector = this._scrollPaneSelector + ' > ul';
        this._scrollable = null;

        var _dialogInitialised = false;
        var $currentContent = void 0;

        var itemClicked = function itemClicked(e) {
            var $li = (0, _jquery2.default)(e.currentTarget);

            if ($li.hasClass('disabled')) {
                e.preventDefault();
                return;
            }

            var $a = $li.children('a');
            var commitId = $a.attr('data-id');
            var commitJSON = _this._visibleCommits[commitId];
            var preloadItem = _this._preloadItems[$li.index()];
            var commitRangeJSON = preloadItem && preloadItem.commitRange;
            var path = null;
            var sincePath = null;

            if (_lodash2.default.get(commitJSON, 'properties.change')) {
                path = commitJSON.properties.change.path ? new _path2.default(commitJSON.properties.change.path) : null;
                sincePath = commitJSON.properties.change.srcPath ? new _path2.default(commitJSON.properties.change.srcPath) : null;
            }

            (0, _jquery2.default)('li', _this._listSelector).removeClass('selected');
            $li.addClass('selected');

            _this._renderButton(commitJSON, preloadItem);
            hide();
            _events2.default.trigger('bitbucket.internal.feature.commitselector.itemSelected', _this, {
                commitJSON: commitJSON,
                commitRangeJSON: commitRangeJSON,
                pullRequest: _this._pullRequest,
                path: path,
                sincePath: sincePath
            });
            e.preventDefault();
        };

        var hide = function hide() {
            _this._inlineDialog.removeAttr('open');
        };

        var show = function show(e) {
            _this._$selectorButton.addClass('active');
            if (!_dialogInitialised) {
                var $inlineDialog = (0, _jquery2.default)(e.target);
                var $content = $inlineDialog.find('.aui-inline-dialog-contents');
                $currentContent = $content.html(bitbucket.internal.feature.fileContent.commitSelector());
                $currentContent.on('click', 'li.commit-list-item', itemClicked);

                _this._scrollable = _this._createScrollable();
                _this._visibleCommits = {};
                setTimeout(function () {
                    $content.find('.spinner-container').spin();
                    _this._scrollable.init();
                }, 0);
                _this._initialiseKeyboardNavigation();
                _this._initialiseMouseNavigation();
            }

            (0, _jquery2.default)(window).on('scroll', hide);
        };

        this.resetDialog = function () {
            _this._$selectorButton.removeClass('active');
            if (_this._scrollable) {
                _this._scrollable.reset();
            }
            $currentContent && $currentContent.off('click', 'li.commit-list-item', itemClicked);
            (0, _jquery2.default)(window).off('scroll', hide);
            _dialogInitialised = false;
        };

        this._inlineDialog = (0, _jquery2.default)(this._id);
        this._inlineDialog.on('aui-show', show).on('aui-hide', this.resetDialog);

        this._events = _events2.default.chain().on('bitbucket.internal.feature.commitselector.itemSelected', this.resetDialog).on('bitbucket.internal.page.*.revisionRefChanged', this.resetDialog).on('bitbucket.internal.page.*.pathChanged', this.resetDialog);
    }

    CommitSelector.prototype.init = function (options) {
        this._commitRange = options.commitRange;
        this._followRenames = options.followRenames;
        this._headRevisionRef = options.headRevisionReference;
        this._itemTemplate = options.itemTemplate;
        this._itemTitle = options.itemTitle;
        this._itemUrl = options.itemUrl;
        this._itemExtraClasses = options.itemExtraClasses;
        this._mode = options.mode;
        this._path = options.path;
        this._preloadItems = options.preloadItems || [];
        this._pullRequest = options.pullRequest;
        this._selectedCommit = options.selectedCommit;
        this._updateButton = options.updateButton;
        this._lastPageMessage = options.lastPageMessage || _aui2.default.I18n.getText('bitbucket.web.file.history.allhistoryfetched');
        this._includesMerge = options.includesMerge || false;
        this._renderButton(options.selectedCommit, options.selectedItem);
    };

    CommitSelector.prototype.destroy = function () {
        this.resetDialog();
        this._events.destroy();
        this._inlineDialog.remove();
        if (this._resultsKeyboardController) {
            this._resultsKeyboardController.destroy();
            this._resultsKeyboardController = null;
        }
    };

    CommitSelector.prototype._createScrollable = function () {
        var scrollable = new _pagedScrollable2.default(this._scrollPaneSelector, {
            bufferPixels: 0,
            pageSize: 25,
            paginationContext: 'file-history',
            preventOverscroll: true
        });
        scrollable.requestData = this.requestData.bind(this);
        scrollable.attachNewContent = this.attachNewContent.bind(this);

        var oldOnFirstDataLoaded = scrollable.onFirstDataLoaded;

        scrollable.onFirstDataLoaded = function () {
            return oldOnFirstDataLoaded.apply(this, arguments);
        };

        return scrollable;
    };

    CommitSelector.prototype.requestData = function (start, limit) {
        this._inlineDialog.find('.spinner-container').spin();
        var urlBuilder = void 0;

        // Could potentially be extracted out of the commit selector as it toggles between file history and
        // pull request commit selector
        if (this._pullRequest) {
            urlBuilder = _navbuilder2.default.rest().currentRepo().pullRequest(this._pullRequest.id).commits().withParams({
                start: start,
                limit: limit,
                avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                    size: 'xsmall'
                })
            });
        } else {
            urlBuilder = _navbuilder2.default.rest().currentRepo().commits().withParams({
                followRenames: this._followRenames,
                path: this._path.toString(),
                until: this._headRevisionRef.getId(),
                start: start,
                limit: limit,
                avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                    size: 'xsmall'
                })
            });
        }

        return _ajax2.default.rest({
            url: urlBuilder.build()
        }).done(function (data) {
            if (data.size > 0) {
                return data;
            }
            // BSERV-8673 If there is no data the file must have been created in a merge
            // so do the REST call again with followRenames: false so merge commits are included
            return _ajax2.default.rest({
                url: urlBuilder.withParams({
                    followRenames: false
                }).build()
            });
        });
    };

    function addCommitsToMap(commits, cache) {
        _lodash2.default.forEach(commits, function (commit) {
            cache[commit.id] = commit;
        });
    }

    CommitSelector.prototype._renderItem = function (item, isFocused, isSelected) {
        return bitbucket.internal.widget.commit.commitListItem({
            content: this._itemTemplate({
                commit: item,
                href: this._itemUrl(item, this)
            }),
            isFocused: isFocused,
            isSelected: isSelected,
            extraClasses: this._itemExtraClasses && this._itemExtraClasses(item).join(' '),
            title: this._itemTitle ? this._itemTitle(item.displayId) : ''
        });
    };

    CommitSelector.prototype.attachNewContent = function (data) {
        var _this2 = this;

        addCommitsToMap(data.values, this._visibleCommits);
        var selectedCommitId = this._selectedCommit && this._selectedCommit.id;
        var commitSelectorItems = data.values.map(function (commit) {
            return _this2._renderItem(commit, selectedCommitId === commit.id && data.start === 0, selectedCommitId === commit.id);
        });
        var preloadItems = this._preloadItems && data.start === 0 ? this._preloadItems.map(function (item) {
            var urlItemProps = {
                href: item.href,
                icon: item.icon,
                messageHtml: item.messageHtml,
                size: item.size
            };

            var extraClasses = ['preload-item'];

            if (item.disabled) {
                extraClasses.push('disabled');
            }

            if (_this2._itemExtraClasses) {
                extraClasses = extraClasses.concat(_this2._itemExtraClasses(item));
            }

            return bitbucket.internal.widget.commit.commitListItem({
                isSelected: item.selected,
                extraClasses: extraClasses.join(' '),
                content: bitbucket.internal.feature.fileContent.commitSelectorUrlItem(urlItemProps)
            });
        }) : null;

        var $list = (0, _jquery2.default)(this._listSelector);
        $list.append(preloadItems).append(commitSelectorItems);

        var $spinner = (0, _jquery2.default)(this._scrollPaneSelector).children('.spinner-container');
        $spinner.spinStop();

        if (data.isLastPage) {
            $list.append(bitbucket.internal.feature.fileContent.commitSelectorNoMoreResults({
                lastPageMessage: this._lastPageMessage
            }));

            $spinner.remove();
        }
    };

    CommitSelector.prototype.isButtonEnabled = function () {
        return !this._$selectorButton.prop('disabled');
    };

    CommitSelector.prototype.getSelectedCommit = function () {
        if (this._visibleCommits && this._selectedCommit && this._selectedCommit.id) {
            // _visibleCommits will contain the commits from the server, which will include
            // the enriched properties that the consumer probably wants
            return this._visibleCommits[this._selectedCommit.id];
        }
    };

    CommitSelector.prototype.refreshCommit = function (id, props) {
        var commit = this._visibleCommits[id];
        if (!commit) {
            console.warn('Unable to refresh commit with id ' + id);
            return;
        }

        var refreshedCommit = this._visibleCommits[id] = babelHelpers.extends({}, commit, props);

        var $existing = (0, _jquery2.default)(this._listSelector).find('.commit-selector-item-message[data-id=\'' + id + '\']').parent();
        var renderedCommit = this._renderItem(refreshedCommit, $existing.hasClass('focused'), $existing.hasClass('selected'));
        $existing.replaceWith(renderedCommit);

        return this._visibleCommits[id];
    };

    CommitSelector.prototype._initialiseKeyboardNavigation = function () {
        var commitSelector = this;
        var $scrollPane = (0, _jquery2.default)(commitSelector._scrollPaneSelector);

        if (commitSelector._resultsKeyboardController) {
            commitSelector._resultsKeyboardController.destroy();
        }

        var listEventTarget = commitSelector._$selectorButton;
        var resultsList = commitSelector._listSelector;
        commitSelector._resultsKeyboardController = new ListKeyboardController(listEventTarget, resultsList, {
            focusedClass: 'focused',
            itemSelector: 'li.commit-list-item',
            adjacentItems: true,
            requestMore: function requestMore() {
                var loadAfterPromise = commitSelector._scrollable.loadAfter();
                return loadAfterPromise && loadAfterPromise.then(function (data) {
                    return data.isLastPage;
                });
            },
            onSelect: function onSelect($focused) {
                if (!commitSelector._inlineDialog.is(':visible')) {
                    commitSelector._$selectorButton.click();
                } else {
                    $focused.click();
                }
            },
            onFocusLastItem: function onFocusLastItem() {
                $scrollPane.scrollTop($scrollPane[0].scrollHeight);
            }
        });
    };

    CommitSelector.prototype._initialiseMouseNavigation = function () {
        var $listSelector = (0, _jquery2.default)(this._listSelector);
        var focusedClass = 'focused';

        $listSelector.on('mouseenter', 'li', function (e) {
            var $li = (0, _jquery2.default)(e.currentTarget);

            // return early if element already has the focused class
            if ($li.find('.' + focusedClass).length) {
                return;
            }
            $listSelector.find('.' + focusedClass).removeClass(focusedClass);
            $li.addClass(focusedClass);
        });
    };

    CommitSelector.prototype._renderButton = function (commit, item) {
        if (!this._updateButton) {
            return;
        }

        if (commit) {
            this._$selectorButton.children().first().replaceWith(bitbucket.internal.feature.fileContent.singleCommitIcon());
            this._$selectorButton.find('.text').text(commit.message);
        } else if (item) {
            if (item.icon) {
                this._$selectorButton.children().first().replaceWith(item.icon);
            }
            this._$selectorButton.toggleClass('commit-selector-large', item.size === 'large');
            this._$selectorButton.find('.text').html(item.messageHtml);
        } else {
            throw new Error('PreloadItems must provide a selectionContent HTML string to render into the dropdown button when they are selected');
        }
    };

    exports.default = CommitSelector;
    module.exports = exports['default'];
});