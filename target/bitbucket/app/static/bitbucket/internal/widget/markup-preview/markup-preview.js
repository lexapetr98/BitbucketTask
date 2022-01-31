define('bitbucket/internal/widget/markup-preview/markup-preview', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/events', 'bitbucket/internal/util/navigator', 'bitbucket/internal/util/syntax-highlight'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _ajax, _domEvent, _events, _navigator, _syntaxHighlight) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _syntaxHighlight2 = babelHelpers.interopRequireDefault(_syntaxHighlight);

    // Ensure that we always define a default shortcut - ie for pull-request create
    // If you modify this, please update bitbucket-plugin.xml as well
    var previewShortcutKeys = 'ctrl+shift+p';

    _events2.default.on('bitbucket.internal.keyboard.shortcuts.requestPreviewComment', function (keys) {
        previewShortcutKeys = keys;
        this.unbind();
    });

    /**
     * Add the ability to preview the markup content in an editor
     * @param {HTMLElement|jQuery} editor
     * @constructor MarkupPreview
     */
    function MarkupPreview(editor) {
        this.init.apply(this, arguments);
    }

    _events2.default.addLocalEventMixin(MarkupPreview.prototype);

    /**
     * Initialise the MarkupPreview
     * @param {HTMLElement|jQuery} editor
     */
    MarkupPreview.prototype.init = function (editor) {
        _lodash2.default.bindAll(this, 'togglePreview', 'updatePreview', 'refreshPreview', 'hidePreview', 'cancelPreview');

        var OSShortcutKeys = (0, _navigator.isMac)() ? previewShortcutKeys.replace(/ctrl/i, 'meta') : previewShortcutKeys;

        this.$editor = (0, _jquery2.default)(editor);
        this.$textarea = this.$editor.find('textarea');
        this.$previewButton = this.$editor.find('.markup-preview-button');
        this.$previewPanel = this.$editor.find('.markup-preview');
        this._destroyables = [];

        var $shortcutEls = this.$textarea.add(this.$previewButton);
        $shortcutEls.on('keydown', [OSShortcutKeys], this.togglePreview);
        this._destroyables.push({
            //This has to be done manually, not using `chainWith` because the shortcut keys param stuffs up the unbind
            destroy: function () {
                $shortcutEls.off('keydown', this.togglePreview);
            }.bind(this)
        });

        this._destroyables.push(_events2.default.chainWith(this.$previewButton).on('click', this.togglePreview));

        this._destroyables.push(_events2.default.chainWith(this.$previewPanel
        //Don't toggle the preview if the user clicks on a link (or an image inside a link for attachment thumbnails)
        ).on('click', _domEvent2.default.filterByTarget(':not(a, a > img)', this.togglePreview)));

        this._destroyables.push(_events2.default.chainWith(this.$textarea).on('input', _lodash2.default.debounce(this.refreshPreview, 100) //prevent churning through ajax requests
        ));

        this._destroyables.push({
            destroy: this.cancelPreview
        });

        // init the tipsy for preview button
        var that = this;
        this.$previewButton.tooltip({
            gravity: function gravity() {
                return _jquery2.default.fn.tipsy.autoNS.apply(this, arguments) + 'e';
            },
            title: function title() {
                return that.isPreviewing() ? _aui2.default.I18n.getText('bitbucket.web.diffview.comments.button.exit.preview') : that.$previewButton.attr('data-preview-tooltip');
            }
        });
    };

    /**
     * Is the editor current in preview mode?
     * @returns {boolean}
     */
    MarkupPreview.prototype.isPreviewing = function () {
        return this.$editor.hasClass('previewing');
    };

    /**
     * Toggle displaying the preview
     */
    MarkupPreview.prototype.togglePreview = _domEvent2.default.preventDefault(function () {
        if (this.isPreviewing()) {
            this.cancelPreview();
        } else {
            this.showPreview();
        }
    });

    /**
     * Show the preview
     */
    MarkupPreview.prototype.showPreview = function () {
        this.$editor.addClass('previewing');
        this.$textarea.parent().spin('medium');
        this.$previewButton.text(_aui2.default.I18n.getText('bitbucket.web.markup.edit'));
        this._request && this._request.abort();

        function onFail(xhr, reason) {
            if (reason !== 'abort') {
                //Don't hide preview on abort, it may just be because a newer request was made
                this.hidePreview();
            }
        }

        function cleanUp() {
            this.$textarea.parent().spinStop();
            this._request = null;
        }

        this._request = _ajax2.default.rest({
            type: 'POST',
            url: getPreviewUrl(),
            data: this.$textarea.val(),
            dataType: 'json'
        }).done(this.updatePreview).fail(onFail.bind(this)).always(cleanUp.bind(this));
    };

    /**
     * Refresh the preview
     */
    MarkupPreview.prototype.refreshPreview = function () {
        this.isPreviewing() && this.showPreview();
    };

    /**
     * Update the content in the preview element
     * @param {object} response
     * @param {string} response.html - the HTML for the rendered markup preview
     */
    MarkupPreview.prototype.updatePreview = function (response) {
        this.$previewPanel.html(response.html);
        this.$previewPanel.find('a').attr('target', '_blank'); //Open previewed links in a new tab
        this.$editor.addClass('loaded');
        this.$previewButton.focus();

        _syntaxHighlight2.default.container(this.$previewPanel);

        var boundResize = this.trigger.bind(this, 'resize');
        _lodash2.default.defer(boundResize); //Let the content render first
        this.$previewPanel.imagesLoaded(boundResize); //If there are images, trigger resize again once they have loaded
    };

    /**
     * Cancel the preview and hide (aborts any in progress requests for content)
     */
    MarkupPreview.prototype.cancelPreview = function () {
        this._request && this._request.abort();
        this.hidePreview();
    };

    /**
     * Hide the preview
     */
    MarkupPreview.prototype.hidePreview = function () {
        this.$editor.removeClass('previewing loaded');
        this.$previewButton.text(_aui2.default.I18n.getText('bitbucket.web.markup.preview'));
        this.$textarea.focus();
        this.trigger('resize');
    };

    /**
     * Destroy the instance
     */
    MarkupPreview.prototype.destroy = function () {
        _lodash2.default.invokeMap(this._destroyables, 'destroy');
    };

    /**
     * Cached preview url builder
     * @returns {string}
     */
    var getPreviewUrl = _lodash2.default.once(function () {
        return _navbuilder2.default.rest().markup().preview().build();
    });

    exports.default = MarkupPreview;
    module.exports = exports['default'];
});