define('bitbucket/internal/widget/mentionable-textarea/mentionable-textarea', ['module', 'exports', '@atlassian/aui', 'backbone', 'jquery', 'lodash', 'textarea-caret-position', 'xregexp', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/stash-user', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/util/markup', 'bitbucket/internal/widget/autocomplete-dialog/autocomplete-dialog'], function (module, exports, _aui, _backbone, _jquery, _lodash, _textareaCaretPosition, _xregexp, _navbuilder, _pageState, _stashUser, _events, _function, _markup, _autocompleteDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backbone2 = babelHelpers.interopRequireDefault(_backbone);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _textareaCaretPosition2 = babelHelpers.interopRequireDefault(_textareaCaretPosition);

    var _xregexp2 = babelHelpers.interopRequireDefault(_xregexp);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _stashUser2 = babelHelpers.interopRequireDefault(_stashUser);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _markup2 = babelHelpers.interopRequireDefault(_markup);

    var _autocompleteDialog2 = babelHelpers.interopRequireDefault(_autocompleteDialog);

    function MentionableTextarea() {
        this.init.apply(this, arguments);
    }

    MentionableTextarea.defaults = {
        $container: (0, _jquery2.default)(document.body),
        selector: 'textarea',
        dialogId: 'mention-autocomplete-dialog'
    };

    MentionableTextarea.prototype.init = function (opts) {
        if (this.options) {
            //This MentionableTextarea has already been initialised, call reset first.
            this.reset();
        }

        this.options = _jquery2.default.extend({}, MentionableTextarea.defaults, opts);

        _lodash2.default.bindAll(this, 'onKeyDown', 'onKeyPress', 'onPaste', 'onDocumentClick', 'updateDialogAnchorPosition', 'updateResults', 'onActivity', 'selectItem', 'highlightMatches');

        var preloadedUsers = [];

        if (_pageState2.default.getPullRequest()) {
            // A bit of a hack to work out if we are in the pull request context and use that to work out which users to preload.
            // The only issue would be if we have a situation where we have a pull request in PageState, but we don't want to use it's participants in the preload data.
            // I haven't been able to envisage a situation where that will happen yet.
            preloadedUsers = _lodash2.default.invokeMap([_pageState2.default.getPullRequest().getAuthor()].concat(_pageState2.default.getPullRequest().getReviewers().models, _pageState2.default.getPullRequest().getParticipants().models), 'getUser');
        } else if (_pageState2.default.getCommitParticipants && _pageState2.default.getCommitParticipants()) {
            // Same hack for commit discussion participants
            preloadedUsers = _pageState2.default.getCommitParticipants().map(function (participant) {
                return participant.getUser();
            });
        }

        this.dataSource = getDataSource(preloadedUsers, this.matcher);
        this.dataSource.on('respond', this.updateResults);
        this.dataSource.on('activity', this.onActivity);

        //This is necessary to append .isMentioning to all selectors in a comma separated group of selectors
        this.isMentioningSelector = _lodash2.default.map(this.options.selector.split(','), function (selector) {
            // Need to trim the selector in case there was a space between the selector and the `,` (or the end of the string)
            // which would create a descendant selector for `.isMentioning` instead of combining it with the original selector
            return _jquery2.default.trim(selector) + '.isMentioning';
        }).join(', ');

        this.options.$container.on('keypress', this.options.selector, this.onKeyPress);
        this.options.$container.on('keydown', this.isMentioningSelector, this.onKeyDown);
        this.options.$container.on('paste', this.isMentioningSelector, this.onPaste); //Has some quirks - http://www.quirksmode.org/dom/events/cutcopypaste.html
    };

    /**
     * Handle keyDown on non-printing keys that manipulate the autocomplete dialog
     * @param e event object containing the keyCode
     */
    MentionableTextarea.prototype.onKeyDown = function (e) {
        // If there is no dialog, let the event propagate
        if (!this.dialog) {
            return;
        }
        switch (e.which) {
            case _aui.keyCode.ENTER:
            case _aui.keyCode.TAB:
                this.selectHighlightedItem();
                e.preventDefault();
                break;

            case _aui.keyCode.UP:
                this.dialog.moveSelectionUp();
                e.preventDefault();
                break;

            case _aui.keyCode.DOWN:
                this.dialog.moveSelectionDown();
                e.preventDefault();
                break;

            case _aui.keyCode.ESCAPE:
                this.endAutocomplete();
                e.preventDefault();
                e.stopPropagation();
                break;

            case _aui.keyCode.BACKSPACE:
            case _aui.keyCode.DELETE:
                this.onKeyPress(e);
                break;
        }
    };

    /**
     * Handle keyPress for printable keys
     * @param e
     */
    MentionableTextarea.prototype.onKeyPress = function (e) {
        //Allow the browser to insert the input into the textarea before updating
        if (e.which) {
            _lodash2.default.defer(_lodash2.default.bind(function (e) {
                var $textarea = (0, _jquery2.default)(e.target);

                if (!$textarea.hasClass('isMentioning')) {
                    // if the user is typing an "@" and is not inside a code block then show the mention autoComplete
                    var cursorPos = $textarea.getSelection().start;
                    if (String.fromCharCode(e.which) === '@' && !_markup2.default.isPositionInsideCodeBlock(cursorPos, $textarea.val())) {
                        this.beginAutocomplete($textarea);
                    }
                } else {
                    this.updateAutocomplete();
                }
            }, this), e);
        }
    };

    MentionableTextarea.prototype.onPaste = function () {
        //Allow the browser to complete the paste before updating
        _lodash2.default.defer(_lodash2.default.bind(this.updateAutocomplete, this));
    };

    MentionableTextarea.prototype.onDocumentClick = function (e) {
        var target = e.target;
        var targetsOfInterest = [];
        this.$textarea && targetsOfInterest.push(this.$textarea);
        this.dialog && targetsOfInterest.push(this.dialog.$el);

        var isInternalClick = _lodash2.default.some(targetsOfInterest, function ($el) {
            return $el.is(target) || _jquery2.default.contains($el[0], target);
        });

        if (!isInternalClick) {
            this.endAutocomplete();
        }
    };

    MentionableTextarea.prototype.beginAutocomplete = function ($textarea) {
        var mentionTriggerPos = $textarea.getSelection().start - 1; //The caret is now on the right of the '@', so mentionTriggerPos is one position back

        if (mentionTriggerPos > 0 && /^\w$/.test($textarea.val().substr(mentionTriggerPos - 1, 1))) {
            //Only start autocomplete when the @ is preceded by a non-word character
            return;
        }

        this.$textarea = $textarea;
        this.$textarea.addClass('isMentioning');
        this.mentionTriggerPos = mentionTriggerPos;
        this.resultsCollection = new _backbone2.default.Collection();

        this.dialog = new _autocompleteDialog2.default({
            id: this.options.dialogId,
            collection: this.resultsCollection,
            minZIndex: this.options.$container.zIndex(),
            anchor: this.getCaretDocumentCoordinates(this.$textarea),
            template: bitbucket.internal.widget.mentionableTextarea.dialog,
            highlighter: this.highlightMatches
        });

        this.dialog.on('itemSelected', this.selectItem);
        _events2.default.on('window.resize.debounced', this.updateDialogAnchorPosition);
        (0, _jquery2.default)(document).on('click focusin mousedown', this.onDocumentClick);

        this.updateAutocomplete(); //This will trigger an empty query to fetch suggested users if there are any in the dataSource cache
    };

    MentionableTextarea.prototype.updateAutocomplete = function () {
        // We _.defer updating the auto complete in many situations. This can lead to race conditions
        // where $textarea is deleted but invoking this method has already been scheduled. If
        // $textarea is undefined, short-circuit
        if (!this.$textarea) {
            return;
        }
        this.currentCaretPos = this.$textarea.getSelection().start;

        var query = this.$textarea.val().substring(this.mentionTriggerPos, this.currentCaretPos);

        if (!query || !_lodash2.default.startsWith(query, '@') || _lodash2.default.includes(query, '\n')) {
            // User has either moved the caret before the location of the '@', deleted the leading '@' from the mention
            // or navigated to a new line of text using the right arrow key. They probably don't want to continue the mention.
            this.endAutocomplete();
        } else {
            query = query.substr(1); //Remove the leading '@' from the query
            this.dataSource.query(query);
        }
    };

    MentionableTextarea.prototype.updateDialogAnchorPosition = function () {
        // Things like expanding textarea are potentially getting fired at the same time as this, we should give them a chance to execute
        // so we can get an accurate position for the cursor. This still has some issues with repositioning after resize.
        _lodash2.default.defer(_lodash2.default.bind(function () {
            if (this.dialog && this.$textarea) {
                this.dialog.updateAnchorPosition(this.getCaretDocumentCoordinates(this.$textarea));
            }
        }, this));
    };

    MentionableTextarea.prototype.updateResults = function (response) {
        // updateResults is called on the respond event from the dataSource, if we have a pending search and the autocomplete gets cancelled,
        // this function will still be called but this.resultsCollection will be null.
        if (this.resultsCollection) {
            this.resultsCollection.query = response.query;
            this.resultsCollection.reset(response.results);
        }
    };

    MentionableTextarea.prototype.onActivity = function (response) {
        this.dialog && this.dialog.toggleSpinner(response.activity);
    };

    MentionableTextarea.prototype.endAutocomplete = function () {
        if (this.$textarea) {
            this.$textarea.removeClass('isMentioning');
            this.$textarea = null;
        }
        this.mentionTriggerPos = undefined;
        this.currentCaretPos = undefined;
        if (this.dialog) {
            this.dialog.off('itemSelected', this.selectItem);
            this.dialog.remove();
            this.dialog = null;
        }
        this.resultsCollection = null;
        _events2.default.off('window.resize.debounced', this.updateDialogAnchorPosition);
        (0, _jquery2.default)(document).off('click focusin mousedown', this.onDocumentClick);
    };

    MentionableTextarea.prototype.selectHighlightedItem = function () {
        this.selectItem(this.dialog.getSelectedItemIndex());
    };

    MentionableTextarea.prototype.selectItem = function (index) {
        var selectedUser = this.resultsCollection.at(index);

        if (selectedUser) {
            var escapedUsername = this.escapeUsername(selectedUser.getName());
            var text = this.$textarea.val();
            var prefixText = text.substring(0, this.mentionTriggerPos + 1);
            var suffixText = text.substring(this.currentCaretPos, text.length);
            var caretInsertionPoint = prefixText.length + escapedUsername.length + 1;

            if (suffixText.charAt(0) !== ' ') {
                //Only add a space after the mention if there isn't already one
                suffixText = ' ' + suffixText;
            }

            this.$textarea.val(prefixText + escapedUsername + suffixText);
            this.$textarea.setSelection(caretInsertionPoint, caretInsertionPoint);
        }
        this.endAutocomplete();
    };

    MentionableTextarea.prototype.matcher = function (stashUser, query) {
        if (_pageState2.default.getCurrentUser() && stashUser.getName() === _pageState2.default.getCurrentUser().getName()) {
            //Don't show the current user in the results
            return false;
        }

        var matcherRegex = _xregexp2.default.cache('(\\b|^|[^\\p{L}\\p{N}])' + RegExp.escape(query), 'i');
        var names = [stashUser.getName(), stashUser.getEmailAddress(), stashUser.getDisplayName()];

        return _lodash2.default.some(names, function (name) {
            return !!(name && matcherRegex.test(name));
        });
    };

    MentionableTextarea.prototype.getMatchParts = function (text, query) {
        //Split the text into the match and it's prefix and suffix, or if no match, just the original text
        var queryRegex = _xregexp2.default.cache('(^|.*?(\\b|\\())(' + RegExp.escape(query) + ')(.*)', 'i');
        var result = {
            text: text
        };

        if (_lodash2.default.includes(text.toLowerCase(), query.toLowerCase())) {
            text.replace(queryRegex, function (_, prefix, spaceOrParenthesis, match, suffix) {
                result = {
                    prefix: prefix,
                    match: match,
                    suffix: suffix
                };
            });
        }

        return result;
    };

    MentionableTextarea.prototype.highlightMatches = function ($html, query) {
        var self = this;
        $html.find('.display-name, .email-address').each(function () {
            var $this = (0, _jquery2.default)(this).contents().filter(function () {
                //Return the text node for when we have another element inside the span as well as the text (e.g an image)
                return this.nodeType === Node.TEXT_NODE;
            });
            var highlightedText = _lodash2.default.reduce(self.getMatchParts($this.text(), query), function (memo, part, key) {
                // Escape and combine all components of the match, wrapping the actual match in a <b/>
                return memo + (key === 'match' ? '<b>' + (0, _aui.escapeHtml)(part) + '</b>' : (0, _aui.escapeHtml)(part));
            }, '');

            $this.replaceWith(highlightedText);
        });

        return $html;
    };

    MentionableTextarea.prototype.getCaretDocumentCoordinates = function ($textarea) {
        var textareaOffset = $textarea.offset();
        var caretPosition = (0, _textareaCaretPosition2.default)($textarea[0], $textarea[0].selectionStart);
        var fontSizeAsInt = parseInt($textarea.css('font-size'), 10);

        caretPosition.top += textareaOffset.top + fontSizeAsInt;
        caretPosition.left += textareaOffset.left;

        return caretPosition;
    };

    // This logic is duplicated in Java - see DefaultUserMentionScanner.java
    MentionableTextarea.prototype.escapeUsername = function (username) {
        //If the username contains non-word characters, wrap it in double quotes and slash escape any double quotes in it.
        if (/^\w*$/.test(username)) {
            return username;
        }
        return '"' + username.replace(/"/g, '\\"') + '"';
    };

    MentionableTextarea.prototype.reset = function () {
        //Destroy + dereference any objects used. Use if MentionableTextarea is to be re-initialised.
        this.destroy();
        delete this.options;
        delete this.dataSource;
        delete this.$textarea;
        delete this.dialog;
        delete this.resultsCollection;
        delete this.mentionTriggerPos;
        delete this.currentCaretPos;
    };

    MentionableTextarea.prototype.destroy = function () {
        // Remove dialog, Unbind all events. Use if MentionableTextarea is going to be de-referenced by the caller.
        if (this.dialog) {
            this.dialog.off('itemSelected', this.selectItem);
            this.dialog.remove();
        }

        this.dataSource.off('respond', this.updateResults);
        this.dataSource.off('activity', this.onActivity);
        this.options.$container.off('keypress', this.options.selector, this.onKeyPress);
        this.options.$container.off('keydown', this.isMentioningSelector, this.onKeyDown);
        this.options.$container.off('paste', this.isMentioningSelector, this.onPaste);

        _events2.default.off('window.resize.debounced', this.updateDialogAnchorPosition);
        (0, _jquery2.default)(document).off('click focusin mousedown', this.onDocumentClick);
    };

    //Use a singleton ProgressiveDataSet so that the cache is shared across all instances on the page
    var getDataSource = _lodash2.default.once(function (preloadedUsers, matcher) {
        var dataSource = new _aui.ProgressiveDataSet(preloadedUsers, {
            queryEndpoint: _navbuilder2.default.rest().users().build(),
            queryParamKey: 'filter',
            queryData: {
                avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                    size: 'small'
                }),
                permission: 'LICENSED_USER'
            },
            maxResults: 5,
            model: _stashUser2.default,
            matcher: matcher
        });

        /**
         * This should be done in AUI ProgressiveDataSet (https://ecosystem.atlassian.net/browse/AUI-3445)
         * but this is a quick fix which will be removed when the support is added in AUI
         */
        var quickFix = {
            debounceInterval: 300,
            minimumInputLength: 2
        };

        dataSource.query = function (query) {
            var results;

            this.value = query;
            results = this.getFilteredResults(query);
            this.respond(query, results);

            if (!query || !this._queryEndpoint || this.hasQueryCache(query) || !this.shouldGetMoreResults(results) || quickFix.minimumInputLength && query.length < quickFix.minimumInputLength) {
                return;
            }

            this.remoteQuery(query);
        }.bind(dataSource);

        dataSource.remoteQuery = function (query) {
            var remote = this.fetch(query);

            this.activeQueryCount++;
            this.trigger('activity', { activity: true });
            remote.always(_lodash2.default.bind(function () {
                this.activeQueryCount--;
                this.trigger('activity', { activity: !!this.activeQueryCount });
            }, this));

            remote.done(_lodash2.default.bind(function (resp, succ, xhr) {
                this.addQueryCache(query, resp, xhr);
            }, this));
            remote.done(_lodash2.default.bind(function () {
                query = this.value;
                this.respond(query, this.getFilteredResults(query));
            }, this));
        }.bind(dataSource);

        dataSource.remoteQuery = _lodash2.default.debounce(dataSource.remoteQuery, quickFix.debounceInterval);
        /**
         * End quick fix
         */

        dataSource.parse = _function2.default.dot('values');

        dataSource.getFilteredResults = function (query) {
            //Removed "return empty array if no query" logic from ProgressiveDataSet
            //Always return something from the cache if possible, even if there is no query
            var results = this.filter(function (item) {
                return !!this.matcher(item, query);
            }, this);
            if (this._maxResults) {
                results = _lodash2.default.take(results, this._maxResults);
            }
            return results;
        };

        return dataSource;
    });

    exports.default = MentionableTextarea;
    module.exports = exports['default'];
});