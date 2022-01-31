define('bitbucket/internal/widget/markup-editor/markup-editor', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/util/async-element-resize-helper', 'bitbucket/internal/util/events', 'bitbucket/internal/widget/markup-attachments/markup-attachments', 'bitbucket/internal/widget/markup-preview/markup-preview', 'bitbucket/internal/widget/mentionable-textarea/mentionable-textarea'], function (module, exports, _aui, _jquery, _lodash, _asyncElementResizeHelper, _events, _markupAttachments, _markupPreview, _mentionableTextarea) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _asyncElementResizeHelper2 = babelHelpers.interopRequireDefault(_asyncElementResizeHelper);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _markupAttachments2 = babelHelpers.interopRequireDefault(_markupAttachments);

    var _markupPreview2 = babelHelpers.interopRequireDefault(_markupPreview);

    var _mentionableTextarea2 = babelHelpers.interopRequireDefault(_mentionableTextarea);

    var editorExtensions = [];

    /**
     * A top level component to simplify initialisation and destruction of markup editing sub-components
     *
     * @param {HTMLElement|jQuery} editor
     * @constructor MarkupEditor
     */
    function MarkupEditor(editor) {
        this.init.apply(this, arguments);
    }

    MarkupEditor._dataKey = 'markup-editor';

    /**
     * Convenience method for initialising a MarkupEditor and storing a reference to it in the jQuery data for the editor element
     *
     * @param {HTMLElement|jQuery} editor
     * @returns {MarkupEditor}
     */
    MarkupEditor.bindTo = function (editor) {
        var $editor = MarkupEditor.unbindFrom(editor);

        var markupEditor = new MarkupEditor($editor);

        $editor.data(MarkupEditor._dataKey, markupEditor);

        return markupEditor;
    };

    /**
     * Destroy the MarkupEditor instance associated with the supplied editor element
     *
     * @param {HTMLElement|jQuery} editor
     * @returns {jQuery}
     */
    MarkupEditor.unbindFrom = function (editor) {
        var $editor = (0, _jquery2.default)(editor);
        $editor = $editor.is('.markup-editor') ? $editor : $editor.find('.markup-editor');
        var markupEditor = $editor.data(MarkupEditor._dataKey);

        markupEditor && markupEditor.destroy();

        return $editor;
    };

    /**
     * @typedef {Object} EditorExtension
     * @property {Function} init - Function to call when the editor is initialised (is passed the $editor)
     * @property {Function} destroy - Function to call when the editor is destroyed
     */

    /**
     * Register an editor extension. All new editor instances will have the extension
     * @param {EditorExtension} extension
     */
    MarkupEditor.registerExtension = function (extension) {
        if (!_lodash2.default.includes(editorExtensions, extension)) {
            editorExtensions.push(extension);
        }
    };

    /**
     * Remove an editor extension.
     * New instance will not have the extension,
     * but existing instances will still destroy any previously initialised extensions
     * @param {EditorExtension} extension
     */
    MarkupEditor.deregisterExtension = function (extension) {
        editorExtensions = _lodash2.default.without(editorExtensions, extension);
    };

    _events2.default.addLocalEventMixin(MarkupEditor.prototype);

    /**
     * Initialise the editor
     *
     * @param {HTMLElement|jQuery} editor
     */
    MarkupEditor.prototype.init = function (editor) {
        var $editor = (0, _jquery2.default)(editor);
        this.$editor = $editor.is('.markup-editor') ? $editor : $editor.find('.markup-editor');
        this._destroyables = [];
        var $textarea = this.$editor.find('textarea');

        if ($textarea.is(document.activeElement)) {
            //expandingTextarea removes $textarea from the DOM to insert it into its new container.
            //This preserves focus
            _lodash2.default.defer($textarea.focus.bind($textarea));
        }
        var $expandingTextarea = this.$editor.find('textarea.expanding').expandingTextarea();
        this._destroyables.push(_events2.default.chainWith($expandingTextarea).on('resize.expanding', this.onComponentResize.bind(this, false)));
        this._destroyables.push({
            destroy: $expandingTextarea.expandingTextarea.bind($expandingTextarea, 'destroy')
        });

        var markupPreview = new _markupPreview2.default(this.$editor);
        this._destroyables.push(_events2.default.chainWith(markupPreview).on('resize', this.onComponentResize.bind(this, true)));
        this._destroyables.push(markupPreview);

        this._destroyables.push(new _mentionableTextarea2.default({ $container: this.$editor }));

        var disableAttachmentsButton = function (message) {
            this.$editor.find('.markup-attachments-button').addClass('disabled').prop('disabled', 'disabled').attr('aria-disabled', true).attr('title', message);
        }.bind(this);

        if (_markupAttachments2.default.isEnabled()) {
            if (_markupAttachments2.default.isSupported()) {
                this._destroyables.push(new _markupAttachments2.default(this.$editor));
            } else {
                //IE9
                disableAttachmentsButton(_aui2.default.I18n.getText('bitbucket.web.markup.attachments.unsupported'));
            }
        } else {
            //Disabled on server
            disableAttachmentsButton(_aui2.default.I18n.getText('bitbucket.web.markup.attachments.disabled'));
        }

        editorExtensions.forEach(function (extension) {
            extension.init(this.$editor);
            _lodash2.default.isFunction(extension.destroy) && this._destroyables.push({
                destroy: _lodash2.default.partial(extension.destroy, this.$editor)
            });
        }.bind(this));

        // init tooltip for help icon button and preview link
        this.$editor.find('.markup-preview-help').tooltip({
            gravity: _jquery2.default.fn.tipsy.autoNS
        });
    };

    /**
     * Trigger an editor resize event whenever any of the components resize
     * @param {boolean} shouldUpdatePosition - A flag to say whether the component resize changes the focal point for the editor
     */
    MarkupEditor.prototype.onComponentResize = function (shouldUpdatePosition) {
        var _this = this;

        // To avoid triggering a layout we request the next animation frame where we can safely read the size of the
        // editor to determine whether it has actually changed size
        (0, _asyncElementResizeHelper2.default)(this.$editor[0], function () {
            _this.$editor.triggerHandler('resize'); //Let any components listening for editor resizes know, but don't bubble
            _this.trigger('resize', shouldUpdatePosition);
        });
    };

    /**
     * Destroy the instance
     */
    MarkupEditor.prototype.destroy = function () {
        _lodash2.default.invokeMap(this._destroyables, 'destroy');

        this.$editor.data(MarkupEditor._dataKey, null);
        this.$editor = null;
        this.off();
    };

    exports.default = MarkupEditor;
    module.exports = exports['default'];
});